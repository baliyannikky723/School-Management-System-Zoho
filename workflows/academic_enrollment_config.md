# Academic Structure & Student Enrollment Specification

## 1. Academic Structure Master Data

### A. Academic Years
| Academic Year Name | Start Date | End Date | Status |
|---|---|---|---|
| `2025-2026` | `2025-04-01` | `2026-03-31` | `Completed` |
| `2026-2027` | `2026-04-01` | `2027-03-31` | `Active` |
| `2027-2028` | `2027-04-01` | `2028-03-31` | `Upcoming` |

### B. Classes
| Class Name | Class Code | Status | Description |
|---|---|---|---|
| `Class 8` | `CLS-08` | `Active` | Middle School Grade 8 |
| `Class 9` | `CLS-09` | `Active` | High School Grade 9 |
| `Class 10` | `CLS-10` | `Active` | High School Grade 10 |

### C. Sections (Linked to Class)
| Section Name | Section Code | Class Lookup | Capacity | Status |
|---|---|---|---|---|
| `Section A` | `SEC-8A` | `Class 8` | 40 | `Active` |
| `Section B` | `SEC-8B` | `Class 8` | 40 | `Active` |
| `Section A` | `SEC-9A` | `Class 9` | 40 | `Active` |
| `Section B` | `SEC-9B` | `Class 9` | 40 | `Active` |
| `Section A` | `SEC-10A` | `Class 10` | 40 | `Active` |
| `Section B` | `SEC-10B` | `Class 10` | 40 | `Active` |

### D. Subjects
| Subject Name | Subject Code | Subject Type | Status |
|---|---|---|---|
| `Mathematics` | `SUB-MTH` | `Core` | `Active` |
| `Science` | `SUB-SCI` | `Core` | `Active` |
| `English` | `SUB-ENG` | `Core` | `Active` |
| `Social Science` | `SUB-SOC` | `Core` | `Active` |
| `Computer Science`| `SUB-CSC` | `Elective` | `Active` |

### E. Teachers
| Teacher Name | Teacher ID | Department | Status |
|---|---|---|---|
| `Vikram Rao` | `TCH-001` | `Mathematics` | `Active` |
| `Anita Desai` | `TCH-002` | `Science` | `Active` |
| `Meenakshi Iyer` | `TCH-003` | `Languages` | `Active` |

---

## 2. Teacher-Subject-Class-Section Relationship

To establish which teachers teach which subjects in specific classes/sections without redundant data:
* **Junction Structure:** `Teacher_Allocations` (or `Class_Subject_Teachers`)
  * `Academic_Year` → Lookup (`Academic_Years`)
  * `Class` → Lookup (`Classes`)
  * `Section` → Lookup (`Sections`)
  * `Subject` → Lookup (`Subjects`)
  * `Teacher` → Lookup (`Teachers`)
* This maintains full relational normalization.

---

## 3. Student Enrollment Validations (Business Rules)

### Rule 1: Single Active Enrollment Per Academic Year
* A student can only have **one** record in `Student_Enrollments` where `Status == 'Active'` for a given `Academic_Year`.
* Prior year enrollments (`Status == 'Completed'` or `'Promoted'`) are preserved for academic history.

### Rule 2: Section & Class Consistency
* The chosen `Section` must have its parent `Class` matching the enrollment record's `Class`.

### Rule 3: Active Student Constraint
* Enrollments with `Status == 'Active'` can only be created for students whose `Student_Status == 'Active'`.

---

## 4. Test Execution & Verification Matrix

| Test Case # | Scenario | Inputs | Expected Result | Actual Result |
|---|---|---|---|---|
| **TEST 1** | Valid Active Enrollment | Student: Rahul Sharma<br>Year: 2026-2027<br>Class: Class 8<br>Section: Section 8-A<br>Status: Active | **SUCCESS** — Record created and linked. | PASS |
| **TEST 2** | Duplicate Active Enrollment | Student: Rahul Sharma<br>Year: 2026-2027<br>Class: Class 8<br>Section: Section 8-B<br>Status: Active | **BLOCKED** — "This student already has an active enrollment for this academic year." | PASS |
| **TEST 3** | Multi-Year Progression | Student: Rahul Sharma<br>Year: 2027-2028<br>Class: Class 9<br>Section: Section 9-A<br>Status: Active | **SUCCESS** — Allowed because Academic Year is different. | PASS |
| **TEST 4** | Class-Section Mismatch | Class: Class 8<br>Section: Section 9-A (belongs to Class 9) | **BLOCKED** — "Selected section does not belong to the selected class." | PASS |
| **TEST 5** | Historical Preservation | Year 2025-26 (Class 8, Completed)<br>Year 2026-27 (Class 9, Active) | **SUCCESS** — Both records remain intact; past history is never overwritten. | PASS |
| **TEST 6** | Non-Active Student Enrollment | Student Status: Withdrawn<br>Enrollment Status: Active | **BLOCKED** — "Only Active students can have an Active enrollment." | PASS |
