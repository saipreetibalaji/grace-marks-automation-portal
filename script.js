// --- 🔐 ROLE TOGGLE LOGIC ---
function toggleRole() {
    const role = document.getElementById('role-selector').value;
    const studentSec = document.getElementById('student-section');
    const adminSec = document.getElementById('admin-section');

    if (role === 'admin') {
        const pass = prompt("🛡️ Admin Access: Enter Password:");
        if (pass === "admin123") {
            studentSec.style.display = "none";
            adminSec.style.display = "block";
        } else {
            alert("❌ Access Denied: Incorrect Password");
            document.getElementById('role-selector').value = "student";
        }
    } else {
        studentSec.style.display = "block";
        adminSec.style.display = "none";
    }
}

// --- 📝 FORM HANDLING LOGIC ---
function addAuthorRow() {
    const container = document.getElementById('author-container');
    const div = document.createElement('div');
    div.className = 'author-row';
    div.innerHTML = `
        <div>
            <label>Full Name</label>
            <input type="text" class="a-name" placeholder="Author Name">
        </div>
        <div>
            <label>Affiliation</label>
            <select class="a-type" onchange="toggleId(this)">
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="External">External</option>
            </select>
        </div>
        <div>
            <label>Student ID</label>
            <input type="text" class="a-id" placeholder="ID (e.g. S101)">
        </div>
        <div>
            <label>Contrib %</label>
            <input type="number" class="a-pct" placeholder="0-100">
        </div>
    `;
    container.appendChild(div);
}

function toggleId(el) {
    const parent = el.parentElement.parentElement;
    const isNotStudent = el.value !== 'Student';
    const idInput = parent.querySelector('.a-id');
    const pctInput = parent.querySelector('.a-pct');
   
    idInput.disabled = isNotStudent;
    pctInput.disabled = isNotStudent;
    if (isNotStudent) {
        idInput.value = "";
        pctInput.value = "";
    }
}

async function submitData() {
    const title = document.getElementById('title').value;
    const venue = document.getElementById('venue').value;
    const semester = document.getElementById('semester').value;
    const date = document.getElementById('date').value;
    const proof = document.getElementById('proof').value;

    if (!title || !venue || !semester || !date || !proof) {
        alert("⚠️ All fields are mandatory.");
        return;
    }

    const rows = document.querySelectorAll('.author-row');
    if (rows.length === 0) {
        alert("⚠️ Please add at least one contributor.");
        return;
    }

    const authors = [];
    const studentIds = new Set();
    let totalPct = 0;

    for (let r of rows) {
        const name = r.querySelector('.a-name').value;
        const type = r.querySelector('.a-type').value;
        const id = r.querySelector('.a-id').value;
        const pct = parseFloat(r.querySelector('.a-pct').value) || 0;

        if (!name) { alert("⚠️ Author name is required."); return; }

        if (type === 'Student') {
            if (!id) { alert("⚠️ Student ID is required for student authors."); return; }
            if (studentIds.has(id)) { alert("⚠️ Duplicate Student ID detected."); return; }
            studentIds.add(id);
            totalPct += pct;
        }
        authors.push({ name, type, id, pct });
    }

    if (totalPct !== 100) {
        alert(`⚠️ Sum of student contributions must be 100%. (Currently: ${totalPct}%)`);
        return;
    }

    const payload = {
        paper: {
            title, venue, semester, date, proof,
            category: document.getElementById('category').value,
            status: document.getElementById('status').value
        },
        authors: authors
    };

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
            alert("✅ SUCCESS: " + result.message);
            location.reload();
        } else {
            alert("❌ FAILED: " + (result.error || result));
        }
    } catch (err) {
        alert("❌ Connection Error: Is the server running?");
    }
}

// --- 📊 PRO-MAX REPORTING LOGIC ---
async function fetchReport(type) {
    if (!type) return;
    const container = document.getElementById('report-container');
    container.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <p style="color:#718096;">⌛ Fetching University Records...</p>
        </div>
    `;

    try {
        const res = await fetch(`/api/reports/${type}`);
        const data = await res.json();

        if (data.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding:20px; color:#a0aec0;'>No data found for this module.</p>";
            return;
        }

        let html = "";

        // REPORT A: STUDENT MARKS (Card Grid)
        if (type === 'student_marks') {
            html = `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">`;
            data.forEach(row => {
                html += `
                <div style="background:white; padding:15px; border-radius:12px; border-left:4px solid #9b1c31; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align:left;">
                    <div style="font-weight:700; color:#1a202c; font-size:14px;">${row.STUDENT || row.NAME}</div>
                    <div style="font-size:11px; color:#718096; margin-bottom:8px;">${row.TITLE}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="background:#edf2f7; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600;">Share: ${row.CONTRIB || row.CONTRIBUTION_PCT}%</span>
                        <span style="color:#9b1c31; font-weight:700; font-size:15px;">+${row.MARKS || row.MARKS_AWARDED}</span>
                    </div>
                </div>`;
            });
            html += `</div>`;
        }
       
        // REPORT B: BRANCH SUMMARY (Status Table)
        else if (type === 'branch_paper') {
            html = `<table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="text-align:left; color:#a0aec0; font-size:11px; text-transform:uppercase;">
                        <th style="padding:10px; border-bottom:1px solid #edf2f7;">Branch</th>
                        <th style="padding:10px; border-bottom:1px solid #edf2f7;">Type</th>
                        <th style="padding:10px; border-bottom:1px solid #edf2f7; text-align:right;">Count</th>
                    </tr>
                </thead><tbody>`;
            data.forEach(row => {
                html += `
                <tr style="border-bottom: 1px solid #edf2f7;">
                    <td style="padding:12px; font-weight:600; color:#2d3748; text-align:left;">${row.BRANCH}</td>
                    <td style="padding:12px; text-align:left;"><span style="background:#ebf8ff; color:#3182ce; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:700;">${row.CATEGORY}</span></td>
                    <td style="padding:12px; text-align:right; font-weight:700;">${row.TOTAL_PAPERS}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }

        // REPORT C: AGGREGATED LOG (Progress Bars)
        else if (type === 'branch_marks') {
            data.forEach(row => {
                const total = row.TOTAL_MARKS || 0;
                const barWidth = Math.min((total / 10) * 100, 100); // Scale relative to 10 marks
                html += `
                <div style="margin-bottom:15px; text-align:left;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                        <span style="font-weight:600; color:#2d3748;">${row.STUDENT || row.NAME} <small style="color:#718096;">(${row.BRANCH})</small></span>
                        <span style="font-weight:700; color:#9b1c31;">${total} Marks</span>
                    </div>
                    <div style="width:100%; height:6px; background:#edf2f7; border-radius:10px; overflow:hidden;">
                        <div style="width:${barWidth}%; height:100%; background:#9b1c31; border-radius:10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>`;
            });
        }

        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p style='color:#e53e3e; text-align:center;'>❌ Dashboard failed to load data.</p>";
    }
}