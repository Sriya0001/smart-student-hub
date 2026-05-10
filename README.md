# 🎓 Smart Student Hub

[![Cloud Architecture](https://img.shields.io/badge/Architecture-3--Tier-blue.svg)](https://github.com/Sriya0001/smart-student-hub)
[![Security Layers](https://img.shields.io/badge/Security-7--Layers-green.svg)](https://github.com/Sriya0001/smart-student-hub)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A **Centralized Digital Platform for Student Activity Records** — replacing traditional paper-based systems with a secure, cloud-hosted, and tamper-proof digital environment.

---

## 🚀 Overview

Smart Student Hub is an enterprise-grade web application designed to streamline the management of student activity records. It allows students to upload certificates, faculty to verify them, and administrators to oversee the entire ecosystem with real-time analytics and audit logs.

### 🏗️ Cloud Architecture
The project follows a robust 3-tier architecture deployed across multiple cloud providers for maximum reliability and performance:
- **Frontend**: React.js hosted on **Vercel** (Global CDN).
- **Backend**: Node.js & Express API hosted on **Render**.
- **Database**: **MongoDB Atlas** (Cloud NoSQL).
- **File Storage**: **AWS S3** (Private, Encrypted).
- **Caching/Rate Limiting**: **Render Redis**.

---

## 🔐 Key Features & Security

### 🛡️ Multi-Layered Security
1. **Transport Security**: HTTPS end-to-end with **Helmet.js** for secure HTTP headers.
2. **CORS Protection**: Strict whitelist-only policy.
3. **Authentication**: Stateless **JWT** (JSON Web Tokens) with 24-hour expiration.
4. **RBAC**: Role-Based Access Control (Student, Faculty, Admin).
5. **Data Integrity**: **SHA-256 Cryptographic Hashing** for every uploaded file to detect tampering.
6. **Secure Access**: **AWS S3 Pre-signed URLs** (60-second expiration) for private file viewing.
7. **Rate Limiting**: Distributed rate limiting using **Redis** to prevent DDoS and brute-force attacks.
8. **Audit Logging**: Comprehensive logging of all sensitive actions for compliance (GDPR/SOC 2).

### 🧠 Smart Innovation
- **Automatic Mentor Assignment**: A load-balancing algorithm that automatically assigns students to faculty members with the least current mentees.
- **XMP Metadata Injection**: Automatically embeds student properties (Name, CGPA, Skills) into PDF metadata using `pdf-lib` for offline traceability.
- **Real-Time Analytics**: Interactive dashboards built with **Recharts** for visualizing placement metrics and participation.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router
- **Styling**: Tailwind CSS (V4)
- **Charts**: Recharts
- **PDF Handling**: jsPDF, pdf-lib

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **File Uploads**: Multer
- **Security**: bcrypt, jsonwebtoken, helmet, express-rate-limit

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- AWS Account (S3 Bucket)
- Redis Instance

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sriya0001/smart-student-hub.git
   cd smart-student-hub
   ```

2. **Backend Setup**
   ```bash
   cd "student records/backend"
   npm install
   ```
   Create a `.env` file in the backend directory with:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   S3_BUCKET_NAME=your_bucket_name
   REDIS_URL=your_redis_url
   ADMIN_REGISTRATION_CODE=your_secret_code
   ```

3. **Frontend Setup**
   ```bash
   cd "../frontend"
   npm install
   ```
   Create a `.env` file in the frontend directory with:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run the Application**
   From the root directory (`student records`):
   ```bash
   npm run dev
   ```

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Student** | Upload certificates, track approval status, share to LinkedIn, view files. |
| **Faculty** | Review & approve/reject certificates for assigned mentees, view dashboard. |
| **Admin** | Manage users, view global analytics, monitor audit logs, configure mentorships. |

---

## 📄 License

This project is licensed under the **ISC License**.

---

Developed by [Sriya](https://github.com/Sriya0001)
