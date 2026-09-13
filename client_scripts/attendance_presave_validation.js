/**
 * Zoho CRM Client Script
 * Module: Attendance
 * Page Type: Create / Edit
 * Event: onSave
 * Purpose: PRE-SAVE VALIDATION — Physically blocks UI submission before record creation in the database.
 */

async function onSave() {
    // 1. Retrieve field values from the form
    const student = ZDK.Page.getField("Student").getValue();
    const academicYear = ZDK.Page.getField("Academic_Year").getValue();
    const classObj = ZDK.Page.getField("Class").getValue();
    const sectionObj = ZDK.Page.getField("Section").getValue();
    const attDate = ZDK.Page.getField("Date").getValue();
    const currentRecordId = ZDK.Page.getId(); // null during Create, populated during Edit

    if (!student || !academicYear || !classObj || !sectionObj || !attDate) {
        ZDK.Client.showAlert("Please fill all required relationship fields (Student, Academic Year, Class, Section, Date).");
        return false;
    }

    const studentId = student.id;
    const academicYearId = academicYear.id;
    const classId = classObj.id;
    const sectionId = sectionObj.id;

    try {
        // 2. Validate Student Active Status
        const studentRecord = await ZDK.Apps.CRM.Students.fetchById(studentId);
        if (studentRecord && studentRecord.Student_Status !== "Active") {
            ZDK.Client.showAlert(`Validation Error: Cannot record attendance for student with status '${studentRecord.Student_Status}'. Only Active students are allowed.`);
            return false;
        }

        // 3. Validate Academic Year Date Range
        const yearRecord = await ZDK.Apps.CRM.Academic_Years.fetchById(academicYearId);
        if (yearRecord && yearRecord.Start_Date && yearRecord.End_Date) {
            const startDate = new Date(yearRecord.Start_Date);
            const endDate = new Date(yearRecord.End_Date);
            const recordDate = new Date(attDate);

            if (recordDate < startDate || recordDate > endDate) {
                ZDK.Client.showAlert(`Validation Error: Attendance date (${attDate}) falls outside the academic year (${yearRecord.Start_Date} to ${yearRecord.End_Date}).`);
                return false;
            }
        }

        // 4. Validate Student Active Enrollment & Class/Section Consistency
        const enrQuery = `select id, Class, Section, Status from Student_Enrollments where Student = ${studentId} and Academic_Year = ${academicYearId} and Status = 'Active'`;
        const enrResult = await ZDK.Apps.CRM.COQL.execute({ select_query: enrQuery });

        if (!enrResult || !enrResult.data || enrResult.data.length === 0) {
            ZDK.Client.showAlert("Validation Error: Student does not have an active enrollment for the selected academic year.");
            return false;
        }

        const activeEnrollment = enrResult.data[0];
        const enrClassId = activeEnrollment.Class ? activeEnrollment.Class.id : null;
        const enrSectionId = activeEnrollment.Section ? activeEnrollment.Section.id : null;

        if (enrClassId !== classId || enrSectionId !== sectionId) {
            ZDK.Client.showAlert("Validation Error: Attendance class/section does not match the student's active enrollment.");
            return false;
        }

        // 5. Duplicate Check (Student + Date + Academic Year) with Edit Self-Exclusion
        let dupQuery = `select id from Attendance where Student = ${studentId} and Academic_Year = ${academicYearId} and Date = '${attDate}'`;
        if (currentRecordId) {
            dupQuery += ` and id != ${currentRecordId}`;
        }

        const dupResult = await ZDK.Apps.CRM.COQL.execute({ select_query: dupQuery });
        if (dupResult && dupResult.data && dupResult.data.length > 0) {
            ZDK.Client.showAlert(`Validation Error: Attendance record already exists for this student on ${attDate}.`);
            return false; // PREVENTS FORM SAVE
        }

        // All checks passed
        return true;
    } catch (error) {
        console.error("Client script validation exception:", error);
        // Fail-safe to avoid silent bad saves
        ZDK.Client.showAlert("Validation check failed: " + (error.message || "Unknown error"));
        return false;
    }
}
