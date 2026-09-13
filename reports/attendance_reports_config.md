# Attendance Reports Specification — Zoho CRM

This document details the configuration for all required attendance reports in Zoho CRM.

---

## 1. Report 1 — Student Attendance History (Detailed Audit Log)
* **Primary Module:** `Attendance`
* **Related Modules:** `Students`, `Academic_Years`, `Classes`, `Sections`
* **Report Type:** Tabular Report
* **Selected Columns:**
  1. `Date` (Attendance Date)
  2. `Student` (Lookup)
  3. `Academic Year` (Lookup)
  4. `Class` (Lookup)
  5. `Section` (Lookup)
  6. `Attendance Status` (`Present`, `Absent`, `Late`, `Excused`)
  7. `Remarks`
* **Grouping:** Grouped by `Academic Year` → `Class` → `Student`
* **Sorting:** `Date` Descending

---

## 2. Report 2 — Attendance Summary by Student
* **Primary Module:** `Students`
* **Related Modules:** `Attendance`
* **Report Type:** Summary / Matrix Report
* **Selected Columns / Metrics:**
  1. `Student ID`
  2. `Student Name`
  3. `Academic Year`
  4. Total Days Marked (`Count of Attendance Records`)
  5. Total Present Days (`Count where Status = 'Present'`)
  6. Total Late Days (`Count where Status = 'Late'`)
  7. Total Absent Days (`Count where Status = 'Absent'`)
  8. Total Excused Days (`Count where Status = 'Excused'`)
  9. `Current_Attendance_Percentage` (%)
* **Filter:** `Students.Student_Status = 'Active'`

---

## 3. Report 3 — Low Attendance Students (< 75% Threshold)
* **Primary Module:** `Students`
* **Related Modules:** `Student_Enrollments`
* **Report Type:** Summary Report
* **Criteria / Filter:**
  * `Current_Attendance_Percentage < 75` AND `Student_Status = 'Active'`
* **Selected Columns:**
  1. `Student ID`
  2. `Student Name`
  3. `Current Class`
  4. `Current Section`
  5. `Parent / Guardian Name`
  6. `Parent / Guardian Phone`
  7. `Parent / Guardian Email`
  8. `Current_Attendance_Percentage` (%)
* **Purpose:** Proactively identifies at-risk students for parent outreach and academic intervention.
