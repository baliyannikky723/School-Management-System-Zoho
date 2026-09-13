# Attendance Workflow & Automation Configuration

## 1. Workflow Rule Specification

* **Module:** `Attendance`
* **Rule Name:** `Validate_And_Rollup_Attendance`
* **Trigger:** Record Action on `Create or Edit`
* **Execution Condition:** None (All records)
* **Instant Actions:**
  1. **Validation Function:** `validateAttendanceRecord` (`attendanceId = Attendance.id`)
  2. **Rollup Calculation Function:** `calculateStudentAttendancePercentage` (`studentId = Attendance.Student.id`, `academicYearId = Attendance.Academic_Year.id`)

---

## 2. Validation & Business Logic Summary

| # | Integrity Rule | Logic / COQL Check | Error Handling |
|---|---|---|---|
| 1 | **Active Student Check** | `Students.Student_Status == 'Active'` | Rejects attendance for Graduated, Withdrawn, or Inactive students. |
| 2 | **Academic Year Window** | `Academic_Years.Start_Date <= Attendance.Date <= Academic_Years.End_Date` | Prevents posting attendance outside the valid session window. |
| 3 | **Enrollment Consistency** | Student must have an active record in `Student_Enrollments` for the selected `Academic_Year`. | Rejects attendance if student is not enrolled. |
| 4 | **Class & Section Match** | `Attendance.Class == Enrollment.Class` and `Attendance.Section == Enrollment.Section` | Blocks mismatched class/section attendance. |
| 5 | **Duplicate Prevention** | `select id from Attendance where Student = :s and Academic_Year = :y and Date = :d and id != :currentId` | Blocks duplicate submissions on the same date while allowing record edits. |

---

## 3. Attendance Percentage Calculation

* **Field Updated:** `Students.Current_Attendance_Percentage` (Decimal, 2 decimal places)
* **Business Formula:**
  $$\text{Attendance \%} = \frac{\text{Present Days} + \text{Late Days}}{\text{Present} + \text{Late} + \text{Absent} + \text{Excused}} \times 100$$
* **Verification Example:**
  * Present: 2, Late: 1, Absent: 1, Excused: 1
  * Total Days = 5
  * Attended = $2 + 1 = 3$
  * Attendance % = $(3 / 5) \times 100 = \mathbf{60.00\%}$
