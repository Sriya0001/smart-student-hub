# 🎓 Smart Student Hub (SSM)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Framework: React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://reactjs.org/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/)
[![PWA: Ready](https://img.shields.io/badge/PWA-Installable-ff69b4.svg)](https://web.dev/progressive-web-apps/)

**Smart Student Hub** is a premium, enterprise-grade Digital Portfolio and Achievement Tracking System. It bridges the gap between students, faculty, and administration by digitizing the verification of academic and co-curricular achievements with a focus on security, scalability, and mobile accessibility.

---

## 📱 Progressive Web App (PWA) Features
Designed for the modern mobile student, the Smart Student Hub is fully installable on iOS and Android devices.
- **Installable**: Native app-like experience with a home screen icon.
- **Offline Capability**: View previously loaded dashboards and notices without an internet connection.
- **Background Sync**: Seamlessly syncs data once a connection is restored.
- **Mobile-First UI**: Responsive layouts tailored for all screen sizes, from smartphones to desktop monitors.

---

## 🛡️ Enterprise Security Architecture
We implement a **7-layer security model** to ensure data integrity and user privacy:
1.  **SHA-256 Hashing**: Every uploaded certificate is hashed using SHA-256. Any modification to the file on the server will be detected as a security breach.
2.  **AWS S3 Pre-signed URLs**: Direct file access is blocked. Files are served via encrypted URLs that expire after 60 seconds.
3.  **Stateless JWT**: Secure, role-based authentication with auto-expiration and refresh cycles.
4.  **Distributed Rate Limiting**: Powered by **Redis** to prevent brute-force attacks and ensure high availability during peak traffic.
5.  **XMP Metadata Injection**: Uses `pdf-lib` to inject tamper-proof student identifiers (Name, ID, CGPA) into the metadata of uploaded PDFs for offline verification.
6.  **Encryption at Rest**: Sensitive database fields are protected using `mongoose-field-encryption` to ensure data remains secure even if the database is compromised.
7.  **Audit Logs**: Comprehensive tracking of every sensitive action (login, upload, approval, settings change) with IP address and actor tracking.
8.  **Helmet.js & CORS**: Strict HTTP headers and origin filtering to prevent XSS and clickjacking.

---

## 🚀 Key Features

### 🏢 Smart Noticeboard
- **Targeted Notices**: Faculty and Admins can post notices filtered by department or priority.
- **High-Priority Alerts**: Urgent announcements are highlighted with distinct visual styling.
- **Real-time Updates**: Notices appear instantly on the student dashboard.

### 🏆 Achievement Gallery & Portfolio
- **Categorized Views**: Separate sections for Academic Records, Personal Achievements, and Project Portfolios.
- **LinkedIn Integration**: Share verified achievements directly to professional networks.
- **Visual Grid**: A sleek, modern gallery view of all verified certificates.

### 📊 Admin & Faculty Dashboards
- **Real-time Analytics**: Interactive charts (Recharts) showing placement eligibility, certificate approval rates, and student participation.
- **Smart Assignment**: Load-balancing algorithm that automatically assigns students to the faculty member with the least number of mentees.
- **User Management**: Granular control over student and faculty accounts.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**: Lightning-fast HMR and build performance.
- **Tailwind CSS (V4)**: Next-gen styling with optimized JIT engine.
- **Vite PWA**: Service workers and manifest management.
- **Recharts**: Responsive data visualization.
- **Lucide React**: Premium icon set for consistent UI.

### Backend
- **Node.js & Express**: High-concurrency API layer.
- **MongoDB Atlas**: Scalable NoSQL document store.
- **Redis**: Distributed caching and rate limiting.
- **AWS SDK (S3)**: Industrial-grade cloud object storage.
- **pdf-lib**: Low-level PDF manipulation and metadata injection.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v18.0 or higher
- MongoDB Atlas account
- AWS Account (S3 Bucket & IAM Access)
- Redis Cloud or local instance

### 1. Clone & Install
```bash
git clone https://github.com/Sriya0001/smart-student-hub.git
cd smart-student-hub
```

### 2. Backend Configuration
Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_ultra_secure_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_bucket_name
REDIS_URL=your_redis_url
ADMIN_REGISTRATION_CODE=system_secret_code
```
```bash
cd backend
npm install
npm run start # or npm run dev
```

### 3. Frontend Configuration
Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```
```bash
cd ../frontend
npm install
npm run dev
```

---

## 👥 User Roles & Permissions

| Feature | Student | Faculty | Admin |
| :--- | :---: | :---: | :---: |
| Upload Certificates | ✅ | ❌ | ❌ |
| View Own Portfolio | ✅ | ✅ | ✅ |
| Assign Mentors | ❌ | ❌ | ✅ |
| Approve/Reject Records| ❌ | ✅ | ❌ |
| Post Notices | ❌ | ✅ | ✅ |
| System Logs & Analytics| ❌ | ❌ | ✅ |

---

## 📄 License
Licensed under the **ISC License**. 

---

Developed with ❤️ by [Sriya](https://github.com/Sriya0001)
