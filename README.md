# SBEC – Smart Blueprint to Enhance Career

> An AI-powered career development platform designed to help students plan, learn, build skills, prepare for interviews, and manage their complete career journey.

---

## 🚀 About SBEC

**SBEC (Smart Blueprint to Enhance Career)** is a full-stack, AI-powered career development platform designed to help students manage and improve their complete career journey from a single platform.

Students often use multiple applications for learning, task management, resume building, portfolio creation, interview preparation, and skill assessment. SBEC brings these activities together into one centralized platform.

The platform provides students with structured learning guidance, career planning tools, assessments, AI-powered mentoring, and progress tracking.

---

## 🎯 Problem Statement

Students commonly use different platforms for different career-development activities, such as:

- Learning technical skills
- Creating study plans
- Managing tasks
- Building resumes
- Creating portfolios
- Preparing for interviews
- Testing their knowledge
- Tracking learning progress

Managing these activities across multiple platforms can make career preparation difficult and unorganized.

**SBEC aims to solve this problem by bringing important career-development activities together into a single platform.**

---

## 💡 Objectives

The main objectives of SBEC are:

1. Help students organize their career preparation.
2. Provide personalized learning guidance.
3. Create structured learning roadmaps.
4. Help students manage daily and weekly tasks.
5. Verify technical skills through assessments.
6. Provide AI-powered mentoring.
7. Help students create professional resumes.
8. Generate professional portfolios.
9. Conduct weekly knowledge tests.
10. Track student learning and performance.

---

# ✨ Features

## 🎓 Student Panel

### 📊 Dashboard

The student dashboard provides an overview of the student's career-development activities.

It can display:

- Learning progress
- Total tasks
- Completed tasks
- Learning streak
- Test performance
- Upcoming activities
- Quick actions

---

### ✅ Task Manager

The Task Manager helps students organize their learning and career-related activities.

Features include:

- Create tasks
- Update tasks
- Delete tasks
- Mark tasks as completed
- Task priorities
- Search tasks
- Filter tasks
- Task status tracking

---

### 📅 Daily Planner

The Daily Planner allows students to organize their activities for each day.

Students can plan:

- Study sessions
- Coding practice
- Projects
- Revision
- Interview preparation
- Other career-related activities

---

### 📆 Weekly Planner

The Weekly Planner helps students organize their learning activities throughout the week.

It provides a structured way to manage weekly learning goals and activities.

---

# 🤖 AI Mentor

SBEC includes an AI-powered mentor designed to assist students with their learning and career preparation.

The AI Mentor can help with:

- Programming questions
- Technical concepts
- Learning guidance
- Career guidance
- Study planning
- Interview preparation
- Project guidance

If a student wants to learn a particular technology or topic, the AI Mentor can help create a structured, task-based learning plan.

---

# 🧠 Learning Roadmaps

Students can follow structured learning paths for different technologies and career goals.

### Example: Web Development

```text
Web Development
       │
       ├── HTML
       │
       ├── CSS
       │
       ├── JavaScript
       │
       ├── React
       │
       ├── Node.js
       │
       ├── Express.js
       │
       └── MongoDB
```

The roadmap allows students to progress through learning topics step by step.

---

# 📝 Weekly Tests

SBEC includes a weekly testing system to evaluate student learning.

The planned learning flow is:

```text
Learning
    │
    ▼
6 Days of Learning
    │
    ▼
Weekly Test
    │
    ▼
Performance Evaluation
    │
    ▼
Progress Tracking
```

The weekly test evaluates the student's understanding of the topics learned during the learning period.

---

# 🏆 Skill Verification

SBEC provides a skill verification mechanism to help students demonstrate their understanding of technical skills.

When a student wants to add a technical skill to their profile, the system can verify their knowledge through questions.

### Example

```text
Student adds JavaScript
          │
          ▼
     Basic Questions
          │
          ▼
     Student Answers
          │
      ┌───┴───┐
      ▼       ▼
   Correct  Incorrect
      │       │
      ▼       ▼
    Skill    Skill
   Verified  Not Verified
```

This helps make the skills listed on a student's profile more meaningful.

---

# 📄 Resume Builder

The Resume Builder allows students to create professional resumes.

The resume can include:

- Personal Information
- Education
- Skills
- Projects
- Experience
- Certifications
- Achievements

The system can generate a structured resume that students can use for internship and job applications.

---

# 🌐 Portfolio Builder

Students can create a professional portfolio based on their profile information.

The portfolio can contain:

- About
- Skills
- Projects
- Education
- Experience
- Certifications
- Contact Information

---

# 🎤 Interview Preparation

SBEC can help students prepare for technical and HR interviews.

Possible features include:

- Technical questions
- HR questions
- Mock interviews
- Topic-based questions
- Interview feedback
- Performance tracking

---

# 👤 Student Profile

Students can maintain their career profile.

Profile information can include:

- Name
- Email
- Course
- Academic Year
- Semester
- Skills
- Projects
- Certifications
- Career Interests

---

# ⚙️ Settings

Students can manage their application preferences through the Settings section.

Possible settings include:

- Account settings
- Password management
- Notifications
- Preferences
- Security

---

# 👨‍💼 Admin Panel

SBEC includes an administration panel for managing the platform.

The Admin Panel includes:

- Admin Dashboard
- Student Management
- Subject Management
- Notes
- Previous Year Papers
- Quiz Questions
- Weekly Tests
- Exam Data
- Settings

---

## 📊 Admin Dashboard

Administrators can monitor important platform information such as:

- Total Students
- Total Subjects
- Total Exams
- Weekly Tests
- Quiz Questions
- Other system statistics

---

## 👥 Student Management

Administrators can manage registered students.

Operations can include:

- View students
- Search students
- View student details
- Manage student information

---

## 📚 Subject Management

Administrators can manage academic subjects used throughout the platform.

---

## 📖 Notes

Administrators can manage educational notes that students can access for their studies.

---

## 📑 Previous Year Papers

Administrators can manage previous-year examination papers.

Students can use these papers for examination preparation.

---

## ❓ Quiz Questions

Administrators can create and manage quiz questions.

These questions can be used for learning and assessment.

---

## 📝 Weekly Test Management

Administrators can create and manage weekly tests for students.

The admin can manage:

- Test title
- Subject
- Questions
- Test status
- Test information

---

## 📅 Exam Data

Administrators can manage examination information.

Exam data can include:

- Exam title
- Subject
- Examination date
- Academic year
- Semester
- Duration

This information can then be displayed to students through the student panel.

---

# 🏗️ System Architecture

```text
                         SBEC
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      Student Panel               Admin Panel
             │                         │
             └────────────┬────────────┘
                          │
                          ▼
                       REST APIs
                          │
                          ▼
                   Node.js / Express
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
         Controllers               Services
              │                       │
              └───────────┬───────────┘
                          │
                          ▼
                       MongoDB
```

---

# 🛠️ Technology Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- Framer Motion
- React Icons
- React Hot Toast

## Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs

## Database

- MongoDB
- Mongoose

## AI

- Generative AI APIs
- AI-powered mentoring
- AI-assisted career guidance

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- Thunder Client

---

# 📂 Project Structure

```text
SBEC/
│
├── Backend/
│   │
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── Frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🔐 Authentication

SBEC uses authentication to protect student and administrator areas.

The general authentication flow is:

```text
Login
  │
  ▼
Authentication
  │
  ▼
JWT Token
  │
  ▼
Protected Routes
  │
  ▼
Dashboard
```

Authentication helps prevent unauthorized users from accessing protected resources.

---

# 🔌 Backend API

The frontend communicates with the backend through REST APIs.

### Authentication

```text
/api/auth
/api/admin/auth
```

### Admin APIs

```text
/api/admin
/api/admin/notes
/api/admin/quiz
/api/admin/weekly-tests
/api/admin/exams
/api/admin/settings
```

### Papers

```text
/api/papers
```

### Student APIs

```text
/api/student/dashboard
/api/student/subjects
```

---

# 📱 Responsive Design

SBEC is designed to provide a responsive experience across different screen sizes.

Supported devices include:

- 🖥️ Desktop
- 💻 Laptop
- 📱 Mobile
- 📲 Tablet

The interface uses responsive layouts to keep the application usable on smaller screens.

---

# 🔒 Security

Security considerations include:

- JWT authentication
- Password hashing
- Protected routes
- Authorization
- Server-side validation
- Client-side validation
- Environment variables
- Secure API communication

> **Important:** Sensitive credentials such as database passwords, API keys, JWT secrets, and environment variables should never be committed to GitHub.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/BandwarShlok/SBEC-Student-Blueprint-to-Enhance-your-Career.git
```

---

## 2. Enter the Project Directory

```bash
cd SBEC-Student-Blueprint-to-Enhance-your-Career
```

---

# 🚀 Backend Setup

Open a terminal and navigate to the Backend folder:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the Backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

---

# 💻 Frontend Setup

Open another terminal and navigate to the Frontend folder:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

---

# 🧪 API Testing

Backend APIs can be tested using:

- Postman
- Thunder Client

Important areas to test include:

- Authentication
- Student APIs
- Admin APIs
- Subject APIs
- Exam APIs
- Weekly Test APIs
- Quiz APIs
- Notes APIs

---

# 🔮 Future Enhancements

Possible future enhancements include:

- AI career recommendations
- AI resume optimization
- AI portfolio generation
- AI mock interviews
- Job recommendation system
- Internship recommendation system
- Skill-gap analysis
- Personalized career roadmaps
- GitHub profile analysis
- LinkedIn profile optimization
- Learning analytics
- Achievement badges
- Gamification
- Push notifications
- Email reminders
- Advanced progress analytics

---

# 🎓 Project Purpose

SBEC is developed as an academic and portfolio project to demonstrate the practical implementation of:

- Full-stack web development
- REST API development
- Database management
- Authentication
- Responsive UI/UX
- AI integration
- Career-development workflows

---

# 👨‍💻 Developer

## Shlok Bandwar

**B.Sc. Computer Science Student**

GitHub:

https://github.com/BandwarShlok

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

# 📄 License

This project is developed for educational and academic purposes.