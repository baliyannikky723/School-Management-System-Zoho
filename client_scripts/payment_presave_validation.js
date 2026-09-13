/**
 * Zoho CRM Client Script
 * Module: Payments
 * Page Type: Create / Edit
 * Event: onSave
 * Purpose: PRE-SAVE VALIDATION — Validates payment amount, student consistency, outstanding limits, and transaction uniqueness.
 */

async function onSave() {
    const student = ZDK.Page.getField("Student").getValue();
    const feeRecord = ZDK.Page.getField("Fee_Record").getValue();
    const amountPaid = ZDK.Page.getField("Amount_Paid").getValue();
    const paymentDate = ZDK.Page.getField("Payment_Date").getValue();
    const transRef = ZDK.Page.getField("Transaction_Reference") ? ZDK.Page.getField("Transaction_Reference").getValue() : null;
    const currentRecordId = ZDK.Page.getId();

    // 1. Mandatory Fields Check
    if (!student || !feeRecord || amountPaid === null || amountPaid === "" || !paymentDate) {
        ZDK.Client.showAlert("Please fill all mandatory fields (Student, Fee Record, Amount Paid, Payment Date).");
        return false;
    }

    const amtPaidNum = parseFloat(amountPaid);

    // 2. Validate Payment Amount > 0
    if (isNaN(amtPaidNum) || amtPaidNum <= 0) {
        ZDK.Client.showAlert("Validation Error: Payment amount must be greater than zero.");
        return false;
    }

    try {
        // 3. Fetch Parent Fee Record Details
        const parentFee = await ZDK.Apps.CRM.Fee_Records.fetchById(feeRecord.id);
        if (!parentFee) {
            ZDK.Client.showAlert("Validation Error: Selected Fee Record not found.");
            return false;
        }

        // 4. Validate Student Matching
        if (parentFee.Student && parentFee.Student.id !== student.id) {
            ZDK.Client.showAlert("Validation Error: Selected Student does not match the Student on the Fee Record.");
            return false;
        }

        // 5. Validate Amount against Outstanding
        const totalFee = parseFloat(parentFee.Total_Fee || 0);
        const collected = parseFloat(parentFee.Collected_Amount || 0);
        let outstanding = parentFee.Outstanding_Amount !== undefined && parentFee.Outstanding_Amount !== null
            ? parseFloat(parentFee.Outstanding_Amount)
            : (totalFee - collected);

        // If editing an existing payment, add back its previous amount to available outstanding
        if (currentRecordId) {
            const currentPay = await ZDK.Apps.CRM.Payments.fetchById(currentRecordId);
            if (currentPay && currentPay.Amount_Paid) {
                outstanding += parseFloat(currentPay.Amount_Paid);
            }
        }

        if (amtPaidNum > outstanding) {
            ZDK.Client.showAlert("Validation Error: Payment amount (" + amtPaidNum + ") cannot exceed the outstanding amount (" + outstanding + ").");
            return false;
        }

        // 6. Validate Unique Transaction Reference (if provided)
        if (transRef && transRef.trim() !== "") {
            let query = "select id from Payments where Transaction_Reference = '" + transRef.trim() + "'";
            if (currentRecordId) {
                query += " and id != " + currentRecordId;
            }
            const dupResult = await ZDK.Apps.CRM.COQL.execute({ select_query: query });
            if (dupResult && dupResult.data && dupResult.data.length > 0) {
                ZDK.Client.showAlert("Validation Error: Transaction Reference '" + transRef + "' already exists.");
                return false;
            }
        }

        return true;
    } catch (err) {
        console.error("Payment pre-save validation error:", err);
        ZDK.Client.showAlert("Validation check failed: " + (err.message || "Unknown error"));
        return false;
    }
}
