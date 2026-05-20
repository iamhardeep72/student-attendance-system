# Smart Attendance System on Cloud - Project Report

## Problem Statement

Manual attendance is slow, error-prone, and difficult to monitor across classes. A cloud-based attendance system lets students check in using QR or face recognition while administrators track records, generate reports, and send absence alerts.

## Objectives

- Reduce attendance marking time
- Prevent duplicate or proxy attendance
- Give admins a real-time dashboard
- Store attendance data in a secure cloud database
- Generate class-wise reports
- Notify guardians or students about absences

## Modules

1. **Authentication Module**
   - Admin and teacher login
   - Role-based access control
   - Secure student session tokens

2. **Student Management Module**
   - Student profile records
   - Class and roll number mapping
   - Optional face profile image reference

3. **Attendance Module**
   - QR-based check-in
   - Face-recognition add-on
   - Manual admin override
   - Duplicate attendance prevention

4. **Dashboard Module**
   - Present, late, absent, and excused counts
   - Recent check-in activity
   - Session code management

5. **Reports Module**
   - CSV export
   - Date-range summaries
   - Class-wise attendance history

6. **Alerts Module**
   - SMS alerts
   - Email alerts
   - Alert delivery status tracking

## Cloud Components

- **Static hosting:** Hosts the web dashboard
- **Authentication:** Verifies admin, teacher, and student identity
- **Cloud database:** Stores users, students, sessions, attendance records, and alerts
- **Serverless functions:** Handles attendance marking, reports, and alert sending
- **Object storage:** Stores optional student face images

## Security Considerations

- QR codes should expire after a short duration
- Attendance writes should require a valid authenticated user or signed session token
- Face templates should be encrypted or handled by a trusted recognition provider
- Admin actions should be logged for auditing
- Database rules should restrict users to authorized classes only

## Future Enhancements

- Real webcam face recognition with liveness detection
- PWA install support
- Push notifications
- Biometric device integration
- Analytics for low-attendance students
- Integration with college ERP systems

