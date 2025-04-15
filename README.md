# Immigration Pathways Resource Hub

A full-stack web application built to support immigrants and their families with access to trustworthy resources, tools, and document handling — built as both a professional portfolio piece and a real solution for Immigration Pathways Consulting LLC.

---

## 🌟 Project Purpose

This application serves as a centralized hub for:
- Educational blog posts and immigration resources
- Interactive eligibility checklists and quizzes
- Secure client document uploads
- Appointment requests and scheduling
- Admin-only content management and client tracking

It reflects real-world use cases in legal document preparation, resource delivery, and client interaction — aligned with the mission of helping immigrants navigate their journeys with clarity and support.

---

## 🧰 Tech Stack

**Frontend:**
- React (or EJS if SSR)
- TailwindCSS
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT + bcrypt for authentication
- Multer for file uploads
- Nodemailer for email confirmations
- Dotenv for environment configuration

**Deployment:**
- Render (Backend)
- Vercel / Netlify (Frontend)
- MongoDB Atlas (Database)

---

## ✨ Key Features

### 🔐 User Roles
- Client: Access their documents, appointments, and resources
- Admin: Manage blog content, documents, appointments, and users

### 📚 Knowledge Center
- Admins can post/edit/delete blog articles (e.g., asylum, TPS, naturalization)
- Public blog feed with categories and search

### 📄 Document Uploads
- Secure file upload area for clients
- Admin dashboard to view and manage files

### 🗓 Appointment Scheduling
- Clients request appointments through a simple form
- Admin panel to track and confirm sessions

### 📊 Eligibility Tools
- Interactive self-assessments: “Am I eligible for a green card?”
- Generates results with suggestions and PDF output

### 🌍 Language Support
- English and Spanish versions
- Language toggle on all pages

---