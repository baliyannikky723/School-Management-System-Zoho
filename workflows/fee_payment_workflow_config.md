# Fee & Payment Automation Workflow Configuration — Zoho CRM

---

## 1. Workflow Rule: Recalculate Fee Record & Payment Automation

* **Rule Name:** `Recalculate_Fee_Record_On_Payment`
* **Module:** `Payments`
* **Execute On:** `Create or Edit`
* **Condition:** `All Payments` (or `Payment_Status is Successful / not empty`)
* **Instant Action:** Function
  * **Function Name:** `recalculateFeeRecordAndPayment`
  * **Category:** `Automation`
  * **Argument Mapping:** `paymentId = Payments - Payment Id`

---

## 2. Server-side Business Rules Enforced

1. **Auto-Summing & Rollup:**
   * All successful payments linked to a parent `Fee_Records` are summed.
   * `Collected_Amount` on the parent fee record is updated.
   * `Outstanding_Amount` is calculated as `Total_Fee - Collected_Amount` (bounded at 0.0).
2. **Dynamic Status Transition:**
   * `Collected == 0` & `Due Date < Today` $\to$ **`Overdue`**
   * `Collected == 0` & `Due Date >= Today` $\to$ **`Pending`**
   * `0 < Collected < Total Fee` $\to$ **`Partially Paid`** (or **`Overdue`** if past due date)
   * `Collected >= Total Fee` $\to$ **`Paid`**
3. **Student Sync Integrity:**
   * Ensures the `Student` lookup on `Payments` is automatically kept consistent with the parent `Fee_Records.Student`.
