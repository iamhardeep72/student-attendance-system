# Smart Attendance System on Cloud

A dependency-free prototype for a cloud-ready attendance system with QR check-in, face-recognition placeholder flow, admin dashboard, student tracking, reports, alerts, and serverless API examples.

## Features

- Student attendance tracking with present, late, absent, and excused states
- Admin dashboard with class health metrics and recent activity
- QR attendance flow using a time-bound session code
- Face recognition add-on placeholder for webcam-based verification
- SMS/email alert simulation for absentees
- CSV report generation
- Mobile-friendly interface
- Cloud concepts mapped to serverless functions, cloud database tables, and authentication

## Run

Open `index.html` in a browser.

No install step is required.

## Suggested Cloud Architecture

- **Frontend:** Static hosting on Firebase Hosting, AWS Amplify, Azure Static Web Apps, or Vercel
- **Authentication:** Firebase Auth, Amazon Cognito, or Auth0
- **Cloud database:** Firestore, DynamoDB, or Supabase Postgres
- **Serverless functions:** Cloud Functions, AWS Lambda, or Azure Functions
- **Storage:** Cloud Storage or S3 for optional face profile images
- **Alerts:** Twilio for SMS and SendGrid/Amazon SES for email

## Serverless API Examples

The `serverless-functions` folder contains sample Node-style handlers:

- `markAttendance.js`
- `generateReport.js`
- `sendAlerts.js`

They are intentionally framework-light so they can be adapted to Firebase Functions, AWS Lambda, Azure Functions, or Vercel Functions.

## Demo Credentials

The prototype uses a mock sign-in only:

- Admin: `admin@smartcampus.edu`
- Teacher: `teacher@smartcampus.edu`

Any password works in the local demo.

