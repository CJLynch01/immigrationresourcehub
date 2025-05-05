# Immigration Pathways Consulting

**Website:** [immigrationpathwaysconsulting.com](https:immigrationpathwaysconsulting.com)  
**Repository:** [GitHub - CJLynch01](https://github.com/CJLynch01)  
**Status:** 🟢 Live and in use  
**Author:** Chris Lynch

---

## 📝 About

**Immigration Pathways Consulting LLC** provides document preparation services and helpful information for individuals navigating U.S. immigration processes. This site allows users to securely register, communicate with an admin, upload documents, and access immigration resources.

⚠️ **Disclaimer:** We do not offer legal advice or legal representation. For legal help, please consult a licensed attorney.

---

## 🌟 Project Purpose

## 🚀 Features

- 🔒 **Secure Registration and Login** (JWT authentication)
- 🧑‍💼 **Role-Based Access Control** (Admin vs. Client dashboards)
- 📂 **File Upload to AWS S3** (Clients can upload documents, Admin can view)
- 📥 **Admin Document Sharing** (Admins send documents directly to client dashboards)
- 💬 **Internal Messaging System** (Admin ↔ Client communication)
- 📝 **Blog System** (Admin can create Markdown blog posts, visible to users)
- 📄 **Custom Pages** – About, Services, Contact, Legal (Terms of Use & Privacy Policy)
- 🌓 **Dark Themed UI** with Gold Accent Styling

---

## ⚙️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | HTML, CSS, JavaScript               |
| Backend      | Node.js, Express.js                 |
| Database     | MongoDB (Mongoose)                  |
| File Storage | AWS S3 (AWS SDK v3)                 |
| Auth         | JSON Web Tokens (JWT)               |
| Hosting      | Render (API) + Hostinger (static site) |