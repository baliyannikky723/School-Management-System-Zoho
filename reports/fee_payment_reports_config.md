# Fee & Payment Reports Specification — Zoho CRM

---

## 1. Report 1 — Outstanding Students
* **Primary Module:** `Fee Records`
* **Report Type:** Summary Report
* **Selected Columns:**
  1. `Student`
  2. `Academic Year`
  3. `Fee Type`
  4. `Total Fee`
  5. `Collected Amount`
  6. `Outstanding Amount`
  7. `Status`
  8. `Due Date`
* **Grouping:** Grouped by `Student`
* **Filter:** `Outstanding Amount` > `0`
* **Report Name:** `Outstanding Students`

---

## 2. Report 2 — Fee Collection Summary
* **Primary Module:** `Payments`
* **Report Type:** Summary Report
* **Group by:** `Payment Method`
* **Aggregation:** Sum of `Amount Paid`
* **Filter:** `Payment Status` equals `Successful`
* **Report Name:** `Fee Collection Summary`

---

## 3. Report 3 — Payment History
* **Primary Module:** `Payments`
* **Report Type:** Tabular Report
* **Selected Columns:**
  1. `Payment ID`
  2. `Student`
  3. `Fee Record`
  4. `Payment Date`
  5. `Amount Paid`
  6. `Payment Method`
  7. `Transaction Reference`
  8. `Payment Status`
* **Sorting:** `Payment Date` descending
* **Report Name:** `Payment History`
