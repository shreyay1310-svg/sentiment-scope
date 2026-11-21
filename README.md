# Sentiment Scope – AI-Powered Sentiment Analysis Platform

Sentiment Scope is a premium, enterprise-grade, modern, and fully responsive AI-powered sentiment analysis SaaS web application. Built with **React.js**, **Tailwind CSS**, **Python FastAPI**, **VADER NLP**, and **WebSocket live streams**, Sentiment Scope translates unstructured customer feedback into real-time actionable business intelligence.

---

## 🌟 Key Features & Modules

### 1. Dashboard (Pixel-Perfect Reference Alignment)
- **4 Statistics Cards**: Positive (58%, ↑+12%), Negative (18%, ↓-5%), Neutral (24%, ↑+3%), Total Analyses (1,248, ↑+28%).
- **Analyze Sentiment Quick Console**: Interactive text box with live character counting (up to 5,000 characters), neural inference preview, and instant analysis drawer.
- **Key Insights**: AI-generated highlights on customer satisfaction, weekly trajectory, and topic distribution.
- **Quick Actions**: One-click shortcuts for Customer Reviews, Social Media Sentiment, and Dataset Uploads.
- **Sentiment Distribution Donut Chart**: Centered percentage visualization with color-coded category legends.
- **Sentiment Trend Line Chart**: Interactive 7-day and 30-day sentiment trajectories.
- **Recent Analyses Table**: Interactive audit logs with quick detail inspector and record deletion.

### 2. Analyze Text Module
- Large multi-line text input with live character counter.
- One-click sample text scenario presets (Customer praise, mixed feedback, service grievances).
- Emotion detection breakdown across 6 emotional dimensions (**Joy**, **Sadness**, **Anger**, **Fear**, **Trust**, **Surprise**).
- Important keywords extraction with polarity weighting.
- Natural AI-generated synthesized explanations.
- Text classification spectrum visualization (Positive, Neutral, Negative, Compound score, Subjectivity).
- Automatic persistence to database and live feed injection.

### 3. Analyze Files & Datasets Module
- Multi-format ingestion: **CSV**, **XLSX**, **TXT**, and **PDF**.
- Drag-and-drop file upload with format and file size validation (up to 25 MB).
- Automatic text column detection with custom column selector override.
- Batch processing with dynamic progress bar and real-time counter.
- Enriched dataset download in **CSV** or **Excel (.xlsx)** with row-by-row sentiment labels, confidence scores, and compound ratings.

### 4. Real-Time Monitoring Module
- Live sentiment statistics and live donut distribution.
- Live incoming stream feed with pause, resume, and sentiment filtering.
- **WebSocket integration** (`/ws/live`) with automatic reconnect.
- **Clear Distinction Banner**: Transparent toggle between **Synthetic Demonstration Stream** and **Connected Live Data Sources** (eliminating fake live data ambiguity).
- Interactive Live Stream Event Injector for testing real-time ingestion.

### 5. Reports & Intelligence Module
- Consolidated reports for **Daily**, **Weekly**, and **Monthly** intervals.
- Period-over-period trend trajectory calculations.
- Most discussed keywords frequency distribution.
- One-click native exports:
  - 📄 **Executive PDF Report** (generated via ReportLab)
  - 📊 **Excel Spreadsheet (.xlsx)** (generated via OpenPyXL / Pandas)
  - 📑 **Raw CSV Export**

### 6. Analysis History & Audit Trail Module
- Searchable and paginated table of all single-text and batch dataset analyses.
- Filter by sentiment (**All**, **Positive**, **Neutral**, **Negative**).
- Full record detail modal (revealing original text, classification details, emotion breakdown, and keywords).
- Safe record deletion with confirmation dialog.

### 7. AI Insights Module
- Narrative synthesis explaining overall customer sentiment.
- Satisfaction drivers and complaint clustering.
- Strategic timeline recommendations (Immediate, Strategic, Long-term).

### 8. Settings & Account Management
- User profile editing (name, custom avatar URL).
- Change password with confirmation validation.
- Notification preferences toggles (Weekly digest, Negative grievance spike alert).
- Full cloud data portability: download a complete JSON backup of all analyses and datasets.

### 9. Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication** (`HS256`) with persistent session tokens.
- Protected client-side routing.
- Three access tiers:
  - 👑 **Super Admin**: Full access to global analytics, all records, and configuration.
  - 🛡️ **Admin**: Supervisor access to team datasets and reports.
  - 👤 **User**: Isolated personal analysis history and datasets.
- Pre-seeded evaluation accounts with one-click quick login.

---

## 🔑 Pre-Seeded Evaluation Credentials

You can use the one-click quick login buttons on the login page or enter these credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `shreya@sentimentscope.com` | `Password123!` |
| **Admin** | `admin@sentimentscope.com` | `AdminPassword123!` |
| **Standard User** | `user@sentimentscope.com` | `UserPassword123!` |

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + Vite 8
  - Tailwind CSS v4
  - React Router v7
  - Recharts (Donut, Line, and Bar charts)
  - Lucide React Icons
  - Axios HTTP Client
- **Backend**:
  - Python FastAPI + Uvicorn
  - VADER Sentiment Analysis with domain-boosted lexicon
  - Emotion Detection Engine
  - Native WebSockets (`/ws/live`)
  - ReportLab (PDF generation) & Pandas / OpenPyXL (Excel/CSV processing)
  - PyJWT & Bcrypt Security
- **Database**:
  - Out-of-the-box zero-config persistent SQLite / JSON store (`backend/data/sentiment_scope.db`).
  - Seamless production **MongoDB** support via `MONGODB_URI` in `.env`.

---

## 🚀 Quick Start Guide

### 1. Launch with One Click (Windows)
Double-click `start.bat` or run in PowerShell:
```powershell
.\run_dev.ps1
```

### 2. Manual Start

#### Backend:
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API and Swagger docs will be live at:
- API Base: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`

#### Frontend:
```bash
cd frontend
npm run dev
```
The frontend application will be live at:
- Web App: `http://localhost:5173`

---

## 🧪 Automated Test Suite

A complete verification suite is included in `tests/test_suite.py`. Run it at any time with:
```bash
python tests/test_suite.py
```
This automatically tests:
1. User authentication & JWT generation
2. Multi-class NLP sentiment accuracy & confidence scores
3. Dynamic dashboard summary statistics & trends
4. History audit retrieval & record detail inspector
5. Executive report metrics & period comparisons
6. CSV dataset parsing, column auto-detection, and row enrichment
7. Profile updates & JSON cloud data export
