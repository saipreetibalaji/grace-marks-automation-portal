const oracledb = require('oracledb');

// ⚙️ Initialize Oracle Thick Mode using your specific path
try {
    oracledb.initOracleClient({
        libDir: 'C:\\Users\\exam\\Downloads\\instantclient-basic-windows.x64-23.26.1.0.0\\instantclient_23_0'
    });
    console.log("✅ Oracle Thick Mode enabled successfully!");
} catch (err) {
    console.error("❌ Oracle Client failed to start. Check your path!");
    console.error(err.message);
}

// 🔐 Your Oracle APEX Workspace Credentials
const config = {
    user: "username",
    password: "password",
    connectString: "connectstring"
};

/**
 * Executes a SQL query against the Oracle Database
 * @param {string} sql - The SQL statement
 * @param {object} binds - The bind variables
 */
async function getResult(sql, binds = {}) {
    let conn;
    try {
        conn = await oracledb.getConnection(config);
       
        // Execute with autoCommit to ensure data is saved immediately
        const result = await conn.execute(sql, binds, {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
       
        return result;
    } catch (err) {
        // Log the error to the terminal for debugging
        console.error("❌ Database Error:", err.message);
        throw err;
    } finally {
        // Always close the connection
        if (conn) {
            try {
                await conn.close();
            } catch (e) {
                console.error("Error closing connection", e);
            }
        }
    }
}

module.exports = { getResult };
