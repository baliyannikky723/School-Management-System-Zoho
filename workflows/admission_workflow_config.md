# Admission Workflow & Automation Configuration

## 1. Workflow Rule Specification

* **Module:** `Leads`
* **Rule Name:** `Auto_Convert_Confirmed_Lead_To_Student`
* **Description:** Triggers Deluge custom function when a prospective student enquiry is marked as 'Confirmed'.
* **Execute Rule On:** Record Action — `Create or Edit`
* **Condition / Criteria:**
  ```text
  (Admission_Status is "Confirmed") AND (Student_Created is not true)
  ```
* **Instant Action:**
  * **Function:** `convertLeadToStudent`
  * **Parameters:** `leadId = Leads.id`

---

## 2. Lead to Student Field Mapping

| Source (Leads) | Target (Students) | Transformation / Logic |
|---|---|---|
| `First_Name` | `First_Name` | Direct copy (**Mandatory**) |
| `Last_Name` | `Last_Name` / `Name` | Direct copy |
| `First_Name` + `Last_Name` | `Full_Name` | Concatenation (`First_Name + " " + Last_Name`) |
| `Student_DOB` | `Date_of_Birth` | Direct copy (Date) |
| `Gender` | `Gender` | Picklist value match |
| `Parent_Guardian_Name` | `Parent_Guardian_Name` | Direct copy |
| `Email` | `Parent_Guardian_Email` | Explicitly mapped to parent email per business rule |
| `Parent_Guardian_Phone` | `Parent_Guardian_Phone` | Direct copy (Phone) |
| `Admission_Academic_Year` | `Admission_Academic_Year` | Direct / Lookup match |
| *Auto-Generated* | `Student_ID` | Sequential ID (e.g., `STU-00001`) with zero padding |
| *System Current Date* | `Admission_Date` | `zoho.currentdate` formatted as `yyyy-MM-dd` |
| *Fixed Value* | `Admission_Status` | `"Confirmed"` |
| *Fixed Value* | `Student_Status` | `"Active"` |
| `Leads.id` | `Source_Lead` | Lookup to originating Lead (for traceability & idempotency) |

---

## 3. Idempotency & Safety Mechanism

1. **Pre-execution Database Query:**
   Before creating a record, the Deluge function searches the `Students` module for `Source_Lead == leadId`.
   If a record is returned, the function halts immediately with `IDEMPOTENT_EXIT`.
2. **Flagging:**
   Upon successful creation, `Leads.Student_Created` is updated to `true`.
3. **Rollback & Error Handling:**
   If creation fails, the Lead record remains unchanged with status preserved, and the execution returns a clear diagnostic error.

---

## 4. Lifecycle Verification Matrix

| Step | Action / State Change | Expected Outcome |
|---|---|---|
| 1 | Webform submitted | Lead created with `Admission_Status = "New"`. No Student created. |
| 2 | Status changed to `Contacted` | No Student created. |
| 3 | Status changed to `Follow-up` | No Student created. |
| 4 | Status changed to `Rejected` | No Student created. |
| 5 | Status changed to `Confirmed` | **Workflow triggers.** Exactly 1 Student created with unique `Student_ID`, `Student_Status = "Active"`, `Source_Lead` mapped. Lead `Student_Created = true`. |
| 6 | Same Lead saved again as `Confirmed` | **Idempotent.** Zero duplicate students created. Exits safely. |
