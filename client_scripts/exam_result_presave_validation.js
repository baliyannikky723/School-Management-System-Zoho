/**
 * Zoho CRM Client Script
 * Module: Exam_Results
 * Page Type: Create / Edit
 * Event: onSave
 * Purpose: PRE-SAVE VALIDATION — Validates marks bounds, student class eligibility, and duplicate prevention before form save.
 */

async function onSave() {
    const student = ZDK.Page.getField("Student").getValue();
    const exam = ZDK.Page.getField("Examination").getValue();
    const subject = ZDK.Page.getField("Subject").getValue();
    const marksObtained = ZDK.Page.getField("Marks_Obtained").getValue();
    const maxMarks = ZDK.Page.getField("Maximum_Marks").getValue();
    const currentRecordId = ZDK.Page.getId();

    if (!student || !exam || !subject || marksObtained === null || maxMarks === null) {
        ZDK.Client.showAlert("Please fill all mandatory fields (Student, Examination, Subject, Marks Obtained, Maximum Marks).");
        return false;
    }

    const marksObtNum = parseFloat(marksObtained);
    const maxMarksNum = parseFloat(maxMarks);

    // 1. Validate Marks Range
    if (isNaN(marksObtNum) || marksObtNum < 0) {
        ZDK.Client.showAlert("Validation Error: Marks Obtained cannot be negative.");
        return false;
    }

    if (isNaN(maxMarksNum) || maxMarksNum <= 0) {
        ZDK.Client.showAlert("Validation Error: Maximum Marks must be greater than zero.");
        return false;
    }

    if (marksObtNum > maxMarksNum) {
        ZDK.Client.showAlert(`Validation Error: Marks Obtained (${marksObtNum}) cannot exceed Maximum Marks (${maxMarksNum}).`);
        return false;
    }

    try {
        // 2. Fetch Examination Details (Academic Year & Class)
        const examRecord = await ZDK.Apps.CRM.Examinations.fetchById(exam.id);
        if (!examRecord || !examRecord.Academic_Year || !examRecord.Class) {
            ZDK.Client.showAlert("Validation Error: Selected Examination is missing Academic Year or Class configuration.");
            return false;
        }

        const examYearId = examRecord.Academic_Year.id;
        const examClassId = examRecord.Class.id;

        // 3. Validate Student Active Enrollment in Exam's Academic Year and Class
        const enrQuery = `select id from Student_Enrollments where Student = ${student.id} and Academic_Year = ${examYearId} and Class = ${examClassId} and Status = 'Active'`;
        const enrResult = await ZDK.Apps.CRM.COQL.execute({ select_query: enrQuery });

        if (!enrResult || !enrResult.data || enrResult.data.length === 0) {
            ZDK.Client.showAlert("Validation Error: Student is not enrolled in the examination's class for this academic year.");
            return false;
        }

        // 3b. Validate Subject Eligibility via Teacher_Allocations
        const allocQuery = `select id from Teacher_Allocations where Class = ${examClassId} and Academic_Year = ${examYearId} and Subject = ${subject.id} and Status = 'Active'`;
        const allocResult = await ZDK.Apps.CRM.COQL.execute({ select_query: allocQuery });

        if (!allocResult || !allocResult.data || allocResult.data.length === 0) {
            ZDK.Client.showAlert("Validation Error: Selected Subject is not allocated to this Class for this Academic Year.");
            return false;
        }

        // 4. Duplicate Check (Student + Examination + Subject) with Self-Exclusion on Edit
        let dupQuery = `select id from Exam_Results where Student = ${student.id} and Examination = ${exam.id} and Subject = ${subject.id}`;
        if (currentRecordId) {
            dupQuery += ` and id != ${currentRecordId}`;
        }

        const dupResult = await ZDK.Apps.CRM.COQL.execute({ select_query: dupQuery });
        if (dupResult && dupResult.data && dupResult.data.length > 0) {
            ZDK.Client.showAlert("Validation Error: A result record already exists for this Student, Examination, and Subject.");
            return false; // HALTS SAVE
        }

        return true;
    } catch (err) {
        console.error("Exam Result pre-save validation error:", err);
        ZDK.Client.showAlert("Validation check failed: " + (err.message || "Unknown error"));
        return false;
    }
}
