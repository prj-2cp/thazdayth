

## 1. Global Architecture Topology
The **TAZDAYTH** platform is architected using the **MERN** stack (MongoDB, Express, React, Node.js). This separation of concerns ensures that the "Face" (Frontend) and the "Brain" (Backend) can work and scale independently.

*   **The Frontend Layer**: Built with **React 18** and **Vite**, focusing on high-speed rendering and interactive user experiences.
*   **The Service Layer**: Built with **Node.js** and **Express**, managing the heavy-lifting logic, security verifications, and external communication.
*   **The Persistence Layer**: Built with **MongoDB Atlas**, a cloud-based NoSQL database that stores all user and community data securely.

---

## 2. Frontend Engineering (The UI Logic)
The frontend is not just a UI; it is a sophisticated client-side application that manages global state and complex interactions.

### A. Logic & State Management
*   **The ID Card (AuthContext)**: We built a global "Context Provider" that remembers who you are across every page. This prevents the website from "forgetting" you when you click a link.
*   **The Translator (i18not)**: A deep-integration localization system that instantly switches the entire site between **French, English, and Kabyle** without slowing down the page.
*   **Smooth Motion Physics**: We used **Framer Motion** to handle animations. Instead of static changes, elements "float" and "fade" into place using math-based physics for a premium feel.

### B. Advanced Component Design
*   **Navbar 3.0**: A state-aware navigation bar that knows the difference between a Visitor and a Customer, showing specialized menus (Profile, Logout) only when authenticated.
*   **Section Reveals**: Every section uses a custom `SectionReveal` component that detects when you are scrolling and "reveals" content only when it’s on screen, saving compute power.

---

## 3. Backend Engineering (The API & Security)
The backend is the high-security core of the project, handling data encryption and automated systems.

### A. The Authentication Handshake
We implemented a **Triple-Security Protocol**:
1.  **Password Scrambling (Bcrypt)**: When a user creates an account, we scramble their password with 12 layers of security ("Salt"). Even if the database was leaked, the passwords remain unreadable.
2.  **VIP Passes (JWT)**: Once logged in, the server gives the user a digital "Entrance Pass" (Token). The user shows this pass to access protected data, meaning the server doesn't have to keep asking for a password.
3.  **Social Identity (OAuth2)**: We integrated the **Google Identity Services** protocol. This allows users to "vouch" for their identity using Google, creating a trustworthy and fast registration path.

### B. Automated Communication (The Postman)
We built a custom **SMTP Email Relay** using **Nodemailer**. 
*   **How it works**: When a user forgets their password, the "Brain" generates a unique 6-digit code, securely stores it with a 15-minute expiration timer, and automatically "mails" it to the user's Inbox.

---

## 4. API Endpoint Registry (The Phone Directory)
The frontend and backend talk to each other using these specialized "Phone Lines":

| Line (Endpoint) | Action | Technical Role |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Scrambles passwords and creates a new user profile. |
| `/api/auth/login` | `POST` | Verifies identity and issues a digital security token. |
| `/api/auth/google` | `POST` | Verifies Google credentials and logs the user in instantly. |
| `/api/auth/forgot-password` | `POST` | Triggers the high-security email relay for recovery codes. |
| `/api/auth/reset-password` | `POST` | Validates the code and updates the database with a new password. |
| `/api/comments` | `POST` | Manages the community testimonials and customer feedback. |

---

## 5. Technical Library Directory (The Toolkit)

### Frontend Tools
*   **React & React-Router**: The core skeleton for building pages and moving between them.
*   **TanStack Query**: The background worker that fetches data and keeps it fresh.
*   **Lucide React**: Our library of high-definition icons.
*   **Radix UI**: Professional building blocks for secure popups, buttons, and menus.
*   **Zod**: A "Security Guard" for our forms that checks if inputs are correct before sending them.

### Backend Tools
*   **Express**: The framework that handles web requests.
*   **Mongoose**: The language we use to talk to the MongoDB database.
*   **CORS**: A permission slip that allows the Frontend to talk to the Backend safely.
*   **Dotenv**: A specialized "SafeBox" for our secret passwords and API keys.

---
**This document provides a comprehensive technical breakdown of the TAZDAYTH platform’s full-stack implementation as of April 8, 2026.**
