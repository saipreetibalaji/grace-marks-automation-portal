const express = require('express');
const oracledb = require('oracledb');
const db = require('./db');
const app = express();

const config = {
    user: "username",
    password: "password",
    connectString: "connectstring"
};

app.use(express.json());
app.use(express.static(__dirname));

// --- 1. Paper Submission API (Student Role) ---
app.post('/api/submit', async (req, res) => {
    const { paper, authors } = req.body;
    let conn;

    try {
        const studentsOnly = authors.filter(a => a.type === 'Student');
        const totalPct = studentsOnly.reduce((sum, a) => sum + Number(a.pct), 0);
        if (totalPct !== 100) {
            return res.status(400).json({ error: "Total Student Contribution must be 100%" });
        }

        conn = await oracledb.getConnection(config);

        // Validation: Max 2 papers per semester
        for (let s of studentsOnly) {
            const check = await conn.execute(
                `SELECT COUNT(*) as TOTAL FROM GRACE_MARKS_SUMMARY WHERE STUDENT_ID = :sid AND SEMESTER = :sem`,
                { sid: s.id, sem: paper.semester },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (check.rows[0].TOTAL >= 2) {
                return res.status(400).json({ error: `Student ${s.id} already reached 2 paper limit.` });
            }
        }

        // Insert Paper
        const pSql = `INSERT INTO PAPERS (PAPER_ID, TITLE, CATEGORY, PUBLICATION_NAME, EVENT_DATE, STATUS, PROOF_LINK, SEMESTER)
                      VALUES (PAPER_SEQ.NEXTVAL, :title, :cat, :pub, TO_DATE(:dt, 'YYYY-MM-DD'), :stat, :proof, :sem)`;
       
        await conn.execute(pSql, {
            title: paper.title, cat: paper.category, pub: paper.venue,
            dt: paper.date, stat: paper.status, proof: paper.proof, sem: paper.semester
        });

        // Get ID
        const idRes = await conn.execute(`SELECT PAPER_SEQ.CURRVAL as ID FROM DUAL`, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const paperId = idRes.rows[0].ID;

        // Insert Authors & Marks
        for (let a of authors) {
            await conn.execute(
                `INSERT INTO PAPER_AUTHORS (PAPER_ID, STUDENT_ID, AUTHOR_TYPE, CONTRIBUTION_PCT) VALUES (:pid, :sid, :type, :pct)`,
                { pid: paperId, sid: a.id || null, type: a.type, pct: a.pct || 0 }
            );

            if (a.type === 'Student') {
                const marks = (Number(a.pct) / 100) * 10;
                await conn.execute(
                    `INSERT INTO GRACE_MARKS_SUMMARY (STUDENT_ID, PAPER_ID, MARKS_AWARDED, SEMESTER) VALUES (:sid, :pid, :m, :sem)`,
                    { sid: a.id, pid: paperId, m: marks, sem: paper.semester }
                );
            }
        }

        await conn.commit();
        res.json({ message: "Submission Successful and Marks Calculated!" });

    } catch (err) {
        if (conn) await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// --- 2. Reports API (Administrator Role) ---
app.get('/api/reports/:type', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(config);
        let sql = "";
        const reportType = req.params.type;

        if (reportType === 'student_marks') {
            // A. Student-wise Marks Report
            sql = `SELECT s.NAME as STUDENT, p.TITLE, pa.CONTRIBUTION_PCT as CONTRIB, g.MARKS_AWARDED as MARKS
                   FROM GRACE_MARKS_SUMMARY g
                   JOIN STUDENTS s ON g.STUDENT_ID = s.STUDENT_ID
                   JOIN PAPERS p ON g.PAPER_ID = p.PAPER_ID
                   JOIN PAPER_AUTHORS pa ON (pa.PAPER_ID = p.PAPER_ID AND pa.STUDENT_ID = s.STUDENT_ID)`;
        } else if (reportType === 'branch_paper') {
            // B. Branch-wise Paper Report
            sql = `SELECT s.BRANCH, p.CATEGORY, COUNT(DISTINCT p.PAPER_ID) as TOTAL_PAPERS
                   FROM PAPERS p
                   JOIN PAPER_AUTHORS pa ON p.PAPER_ID = pa.PAPER_ID
                   JOIN STUDENTS s ON pa.STUDENT_ID = s.STUDENT_ID
                   GROUP BY s.BRANCH, p.CATEGORY`;
        } else if (reportType === 'branch_marks') {
            // C. Branch-wise Student Marks Report
            sql = `SELECT s.BRANCH, s.NAME as STUDENT, SUM(g.MARKS_AWARDED) as TOTAL_MARKS
                   FROM GRACE_MARKS_SUMMARY g
                   JOIN STUDENTS s ON g.STUDENT_ID = s.STUDENT_ID
                   GROUP BY s.BRANCH, s.NAME`;
        }

        const result = await conn.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

app.listen(3000, () => {
    console.log("🚀 System running at http://localhost:3000");
});
