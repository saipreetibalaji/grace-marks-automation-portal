# 🎓 Amrita Grace Marks Automation Portal

An Oracle Database-powered academic portal designed to streamline the submission, verification, and allocation of grace marks for student research publications and conference presentations.

The application provides a centralized platform where students can submit their research details, specify individual author contributions, and receive automatically calculated grace marks. An administrator dashboard provides student-wise performance reports and branch-level publication analytics.

## 📌 Project Overview

The Grace Marks Automation Portal aims to simplify the process of awarding academic credits for research-related achievements.

Traditionally, tracking research publications, verifying author contributions, and calculating grace marks can involve considerable manual effort. This project introduces a database-driven solution that automates these operations while maintaining structured academic records.

The system consists of two primary modules:

- **Student Portal:** Allows students to submit research publication details, enter contributor information, and provide supporting evidence.
- **Administrator Dashboard:** Provides access to publication statistics, student-wise grace marks, and branch-level analytical reports.

## ✨ Key Features

### Student Module
- Submission of research paper metadata, including title, publication venue, category, date, and semester.
- Support for multiple contributors through dynamically generated author-entry fields.
- Classification of contributors as Students, Faculty, or External Authors.
- Individual student contribution percentage allocation.
- Automatic validation ensuring that student contribution percentages total exactly 100%.
- Supporting evidence submission through Scopus proof or DOI links.
- Validation of the maximum two approved paper entries per student per semester.

### Administrator Module
- Dedicated administrator dashboard for viewing academic records.
- Student-wise grace marks and contribution breakdown.
- Branch-wise publication statistics categorized by Journal and Conference.
- Aggregated grace marks tracking across students and departments.
- Dynamic report generation using SQL joins and aggregate functions.

### Database Management
- Structured relational database design using Oracle Database.
- Primary key and foreign key constraints for maintaining referential integrity.
- Oracle sequences and triggers for automatic identifier generation.
- Transaction management using COMMIT and ROLLBACK.
- SQL-based reporting using JOIN, GROUP BY, COUNT, SUM, and window functions.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | Oracle Database XE |
| Database Connectivity | Node.js OracleDB Driver |
| Database Programming | SQL, PL/SQL |
| Development Environment | Visual Studio Code |

## 🏗️ System Architecture

The application follows a three-tier architecture consisting of the presentation layer, application layer, and database layer.

```text
          STUDENT / ADMIN
                 |
                 v
       FRONTEND (HTML, CSS, JS)
                 |
          HTTP / Fetch API
                 |
                 v
       BACKEND (Node.js + Express)
                 |
        Business Rule Validation
                 |
                 v
          ORACLE DATABASE
                 |
       Tables, Queries, Triggers
                 |
                 v
         JSON Response
                 |
                 v
       FRONTEND REPORT DISPLAY
```

**Presentation Layer:** Provides the user interface for paper submissions, author mapping, role selection, and administrative reports.

**Application Layer:** Handles API requests, validates business rules, calculates grace marks, and coordinates database operations.

**Database Layer:** Maintains student records, publication information, contributor mappings, and calculated grace marks.

## 🗄️ Database Design

The application uses four relational tables to organize academic and publication-related information.

| Table | Purpose |
|---|---|
| `STUDENTS` | Stores student identifiers, names, and academic branches. |
| `PAPERS` | Maintains research paper metadata, publication details, and supporting evidence. |
| `PAPER_AUTHORS` | Maps contributors to research papers and records their contribution percentages. |
| `GRACE_MARKS_SUMMARY` | Stores the calculated grace marks awarded to individual student authors. |

### Entity Relationships

- **STUDENTS – PAPER_AUTHORS:** One-to-Many relationship.
- **PAPERS – PAPER_AUTHORS:** One-to-Many relationship.
- **STUDENTS – PAPERS:** Many-to-Many relationship, resolved through `PAPER_AUTHORS`.
- **STUDENTS – GRACE_MARKS_SUMMARY:** One-to-Many relationship.
- **PAPERS – GRACE_MARKS_SUMMARY:** One-to-Many relationship.

Primary keys uniquely identify records, while foreign keys establish relationships between the tables and enforce referential integrity.

### Oracle Database Features Used

- **Sequences:** Generate unique identifiers for paper, author-mapping, and grace-mark records.
- **Triggers:** Automatically assign generated sequence values before inserting new records.
- **Constraints:** Enforce uniqueness, mandatory fields, valid categories, and valid author types.
- **Transactions:** Ensure that paper submissions and their associated author and marks records are processed together.

## 🧮 Grace Marks Calculation

The application calculates grace marks based on the percentage contribution of each student author.

**Formula:**

```text
Grace Marks = (Student Contribution / 100) × 10
```

**Example:**

For a paper with two student authors:

| Student | Contribution | Grace Marks |
|---|---:|---:|
| Student A | 60% | 6 |
| Student B | 40% | 4 |
| **Total** | **100%** | **10** |

Faculty and external contributors are recorded as authors but excluded from grace-mark calculations.

### Business Rules and Validations

1. The total contribution percentage assigned to student authors for a paper must equal 100%.
2. A student can have a maximum of two paper entries per semester, based on the existing grace marks records.
3. Duplicate student identifiers within the same submission are rejected.
4. Paper titles and publication venues are subject to a uniqueness constraint.
5. Mandatory publication and contributor information must be provided before submission.

## 🔄 Application Workflow

### 1. Paper Submission

Students enter publication details through the submission interface and dynamically add the corresponding contributors.

### 2. Input Validation

The frontend performs initial validation for mandatory fields, duplicate student IDs, and contribution percentage allocation.

### 3. Backend Processing

The Express.js backend receives the submission through a REST API endpoint and independently validates the contribution rules and semester-wise paper limit.

### 4. Database Operations

The backend connects to Oracle Database and performs the following operations:

- Inserts the publication details into `PAPERS`.
- Retrieves the generated paper identifier.
- Records contributor information in `PAPER_AUTHORS`.
- Calculates grace marks for student authors.
- Stores the results in `GRACE_MARKS_SUMMARY`.

### 5. Transaction Management

All related insertion operations are committed together upon successful execution. If an error occurs, the transaction is rolled back to prevent incomplete submissions.

### 6. Administrative Reporting

The administrator can retrieve database-generated reports through the dashboard to analyze publication activity and grace marks distribution.

## 📊 Administrative Reports

The portal provides three reporting modules:

| Report | Description |
|---|---|
| Student Performance Audit | Displays individual student contributions, paper details, and grace marks awarded. |
| Branch Publication Summary | Displays branch-wise publication counts categorized by research type. |
| Aggregated Grace Marks Log | Displays cumulative grace marks earned by students across their respective branches. |

SQL operations such as multi-table joins, grouping, aggregation, and distinct counting are used to generate these reports.

## ⚙️ Prerequisites

Before running the application, ensure that the following are available:

- Node.js and npm
- Oracle Database XE
- Oracle Instant Client (required for the configured Thick Mode connection)
- Visual Studio Code or another code editor

## 🚀 Setup and Execution

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd grace-marks-automation-portal
```

### 2. Install Dependencies

```bash
npm init -y
npm install express oracledb
```

### 3. Configure Oracle Database

- Start your Oracle Database XE instance.
- Connect to the appropriate Oracle user/schema.
- Execute the SQL statements in `init.sql` to create the tables, constraints, sequences, and triggers.
- Ensure that the required student records are available in the `STUDENTS` table.

### 4. Configure Database Connectivity

Configure the Oracle connection details and Oracle Instant Client library path in the backend configuration.

Use environment variables for database credentials rather than committing passwords or other sensitive configuration details to the repository.

### 5. Start the Application

```bash
node server.js
```

### 6. Access the Portal

Open the following address in your browser:

```text
http://localhost:3000
```

The student submission interface is available by default. The administrator dashboard can be accessed through the role selector.

## 🔗 API Endpoints

| Method | Endpoint | Functionality |
|---|---|---|
| POST | `/api/submit` | Validates and processes paper submissions, contributor mappings, and grace marks. |
| GET | `/api/reports/student_marks` | Retrieves student-wise grace marks and paper contribution details. |
| GET | `/api/reports/branch_paper` | Retrieves branch-wise publication statistics. |
| GET | `/api/reports/branch_marks` | Retrieves aggregated student grace marks. |

## 🎯 Project Outcomes

- Automated the calculation and recording of grace marks based on student research contributions.
- Implemented relational database design with appropriate primary and foreign key relationships.
- Integrated a web-based frontend with a Node.js backend and Oracle Database.
- Applied SQL joins and aggregation techniques to generate academic performance reports.
- Incorporated transaction handling and database constraints to improve data consistency.
- Developed separate student submission and administrative reporting interfaces.

## 🔮 Future Enhancements

- Integration with institutional student databases for automatic student verification.
- Secure role-based authentication and authorization.
- Administrator approval and publication verification workflows.
- Enhanced semester-wise and academic-year-wise analytical reports.
- Automated evidence verification through DOI and publication indexing services.

---

**Developed as a DBMS Hackathon Project**
B Sai Preeti
Dishi Sharma
Josheni K S

*An academic automation solution for research contribution tracking and grace marks management.*
