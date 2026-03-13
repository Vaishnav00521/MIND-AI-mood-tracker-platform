# 🧠 MindAI: Global Mental Health & AI Analytics Platform

![MindAI Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Django%20%7C%20React%20%7C%20PostgreSQL-success)
![AI/ML](https://img.shields.io/badge/AI-Scikit--learn%20%7C%20NLP-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

MindAI is a full-stack, enterprise-grade mental health monitoring and behavioral intervention system. Moving beyond simple mood tracking, it utilizes clinical-grade psychological frameworks (PHQ-9, GAD-7) and machine learning to proactively predict stress, burnout, and emotional trends. 

Designed with a dual-sided architecture, it features a calming, gamified "Zen Garden" interface for daily users, and a secure, data-dense "Clinical Chrome" B2B dashboard for therapists and HR departments.

## ✨ Core Features

* **🤖 AI Mood Prediction Engine:** Utilizes XGBoost and Scikit-learn to analyze sleep, productivity, and past survey data to predict future emotional states and flag burnout risks.
* **📊 Enterprise B2B Therapist Portal:** Role-Based Access Control (RBAC) allows clinicians to monitor anonymized patient aggregates, track critical risk alerts, and export compliance-ready reports.
* **🛡️ Zero-Trust Security & Compliance:** Engineered for HIPAA/GDPR readiness with JWT authentication, encrypted journal fields, and dynamic cloud vault secret injection.
* **🎮 Gamified Behavioral Interventions:** A responsive 3x3 "Wellness Quests" matrix that encourages daily micro-habits (mindfulness, hydration, breathing) through tactical UI feedback.
* **🗓️ 52-Week Consistency Matrix:** GitHub-style interactive heatmap visualizing a year of emotional data, powered by complex Django aggregation pipelines.
* **⚡ Asynchronous Processing:** Heavy ML inference and data aggregation are offloaded to Celery background workers and Redis to maintain a blazing-fast user experience.

## 🛠️ Tech Stack & Architecture

### Backend (Core API & AI)
* **Framework:** Python, Django, Django REST Framework (DRF)
* **Database:** PostgreSQL (Cloud-ready, UUID primary keys, composite indexing)
* **Authentication:** SimpleJWT (JSON Web Tokens), Custom Role-Based User Model
* **Machine Learning:** Scikit-learn, Pandas, NLTK (for sentiment analysis)
* **Asynchronous Tasks:** Celery, Redis

cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

### Frontend (Web Client)
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS (Custom "Zen Garden" & "Clinical Chrome" themes)
* **Data Visualization:** Chart.js, react-chartjs-2, Custom CSS Grid Heatmaps
* **Routing & State:** React Router DOM, Axios

cd frontend_web
npm install
npm run dev

### PostgreSQL credentials (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT)
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

## 🏗️ Local Development Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/MindAI.git](https://github.com/yourusername/MindAI.git)
cd MindAI

Authored and Architected by Vaishnav Shah.
