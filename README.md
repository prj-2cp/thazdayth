# 🏺 TAZDAYTH - Family Oil Mill Platform

[![Live Demo](https://img.shields.io/badge/demo-thazdayth.vercel.app-blueviolet?style=for-the-badge&logo=vercel)](https://thazdayth.vercel.app)

**TAZDAYTH** is a modern, full-stack web application dedicated to the traditional family oil mill. It combines a beautiful, immersive public showcase of heritage and craftsmanship with a robust e-commerce boutique and a comprehensive administrative dashboard.

##  Key Features

###  Public Showcase
- **Immersive Experience**: High-quality visual storytelling with video backgrounds and scroll animations.
- **Craftsmanship Journey**: Interactive "Process" page detailing the 8 stages of traditional oil production.
- **Cultural Heritage**: Dedicated pages for Kabyle recipes (Nos Plats) and the beautiful region of Kabylie/Djurdjura.
- **Multilingual Support**: Fully localized in **Français**, **English**, and **Kabyle** using `i18next`.

###  E-commerce Boutique
- **Premium Shop**: Elegant product listing for olive oil and traditional products.
- **Seamless Checkout**: Integrated shopping cart and order tracking system.
- **AI-Powered Assistance**: Smart chatbot (n8n integration) to assist customers with inquiries.

### Admin Dashboard
- **Comprehensive Management**:
  - **Agenda Manager**: Schedule and manage mill operations.
  - **Order Manager**: Full lifecycle tracking of boutique orders.
  - **Pressing Manager**: Monitor and manage the oil extraction requests and status.
  - **Product Manager**: Inventory and product listing management.
  - **User Manager**: Administration of accounts and permissions.
- **Analytics**: Real-time statistics and data visualization using Recharts.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Localization**: [i18next](https://www.i18next.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Environment**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Passport.js](https://www.passportjs.org/) (Google OAuth) + [JWT](https://jwt.io/)
- **Communication**: [Nodemailer](https://nodemailer.com/) & [Resend](https://resend.com/) for email services.

---

## 📂 Project Structure

```text
thazdayth/
├── frontend/             # React + Vite application
│   ├── src/
│   │   ├── components/   # Reusable UI & Dashboard components
│   │   ├── pages/        # All application views
│   │   ├── locales/      # Translation files (fr, en, kab)
│   │   └── assets/       # Media (videos, images)
├── backend/              # Node.js + Express server
│   ├── server/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Auth & security logic
```

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `server/env.exemple`.
4. Run in development: `npm run dev`

### 2. Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run in development: `npm run dev`
4. Access the app at `http://localhost:8081` (default Vite port might vary).

---

## 📄 License
Project realized with passion to preserve heritage. All rights reserved.
