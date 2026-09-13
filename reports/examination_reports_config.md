# Examination & Results Reports Specification — Zoho CRM

---

## 1. Report 1 — Student Examination Performance (Individual Marks Card)
* **Primary Module:** `Exam_Results`
* **Related Modules:** `Students`, `Examinations`, `Subjects`, `Classes`, `Academic_Years`
* **Report Type:** Tabular / Summary Report
* **Selected Columns:**
  1. `Student` (Student ID & Full Name)
  2. `Academic Year`
  3. `Class`
  4. `Examination` (e.g. Mid Term 2026)
  5. `Subject` (e.g. Mathematics, Science)
  6. `Marks Obtained`
  7. `Maximum Marks`
  8. `Percentage` (%)
  9. `Grade` (A+, A, B+, B, C, D, F)
  10. `Result Status` (Pass / Fail)
* **Grouping:** Grouped by `Student` → `Examination`
* **Filters:** Dynamic filter by `Student` and `Academic Year`.

---

## 2. Report 2 — Class Examination Performance (Class Level Aggregate)
* **Primary Module:** `Exam_Results`
* **Related Modules:** `Examinations`, `Classes`, `Subjects`
* **Report Type:** Summary Matrix Report
* **Grouping:** Grouped by `Class` → `Examination` → `Subject`
* **Aggregated Metrics:**
  * Total Students Appeared (`Count of Result Records`)
  * Class Average Percentage (`Average of Percentage`)
  * Total Passed (`Count where Result_Status = 'Pass'`)
  * Total Failed (`Count where Result_Status = 'Fail'`)
  * Class Pass Rate (%) (`(Total Passed / Total Appeared) * 100`)

---

## 3. Report 3 — Subject Performance Analysis
* **Primary Module:** `Exam_Results`
* **Related Modules:** `Subjects`, `Examinations`, `Classes`
* **Report Type:** Summary Report
* **Grouping:** Grouped by `Subject` → `Class`
* **Key Metrics:**
  * Average Score (`Average of Marks_Obtained`)
  * Average Percentage
  * Grade Distribution (Count of A+, A, B+, B, C, D, F per subject)
* **Purpose:** Allows academic coordinators to benchmark subject difficulties and teacher efficacy.

---

## 4. Report 4 — Student Overall Performance (Term Rollup)
* **Primary Module:** `Exam_Results`
* **Related Modules:** `Students`, `Examinations`
* **Report Type:** Summary Report
* **Grouping:** Grouped by `Student` → `Examination`
* **Metrics:**
  * Total Marks Obtained (`Sum of Marks_Obtained`)
  * Total Maximum Marks (`Sum of Maximum_Marks`)
  * Term Overall Percentage (`(Sum of Marks_Obtained / Sum of Maximum_Marks) * 100`)
  * Final Term Result (`Pass` if all subjects passed, else `Fail`)
