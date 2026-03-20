# Deploy-On-Demand 🚀

A self-hosted deployment platform that lets you deploy GitHub repositories (Flask, Node.js, static HTML) to public HTTPS URLs via a one-click interface.

---

## Architecture

```
Frontend (React, port 9000)
    ↕ axios (JWT in Authorization header)
Backend (FastAPI, port 9000)
    ↕ pymongo
MongoDB (localhost:27017)
    + pyngrok → public HTTPS URLs per deployment
    + Docker  → isolated containers per project
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (running)
- MongoDB (running locally)
- [ngrok account](https://dashboard.ngrok.com/) (free tier works)

---

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set SECRET_KEY and NGROK_AUTHTOKEN

# Run
uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

The API will be available at `http://localhost:9000`.  
Interactive docs: `http://localhost:9000/docs`

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:9000`.

---

## Supported Project Types

| Detection         | Runtime        | Container port |
|-------------------|----------------|----------------|
| `app.py` / `main.py` + `requirements.txt` | Flask / FastAPI | 5000 |
| `package.json`    | Node.js        | 9000           |
| `index.html`      | Static (nginx) | 80             |

Each deployment gets its own ngrok HTTPS tunnel. Tunnels are closed when deployments are deleted.

---

## Environment Variables

| Variable         | Default                       | Description                  |
|------------------|-------------------------------|------------------------------|
| `SECRET_KEY`     | (insecure default)            | JWT signing secret           |
| `MONGO_URL`      | `mongodb://localhost:27017`   | MongoDB connection string    |
| `DB_NAME`        | `deploy_on_demand`            | MongoDB database name        |
| `NGROK_AUTHTOKEN`| —                             | ngrok auth token (required)  |

---

## Free vs Premium

| Feature               | Free | Premium |
|-----------------------|------|---------|
| Active deployments    | 3    | ∞       |
| Public URLs (ngrok)   | ✅   | ✅      |
| Docker logs           | ✅   | ✅      |
| Scheduled deployments | ✅   | ✅      |
| Persistent deployments| ❌   | ✅      |
| .env secret storage   | ❌   | ✅      |

---

## Project Structure

```
deploy-on-demand/
├── backend/
│   ├── main.py          # FastAPI app, all endpoints
│   ├── auth.py          # JWT + bcrypt
│   ├── database.py      # MongoDB collections + indexes
│   ├── schemas.py       # Pydantic models
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── App.js
        ├── PrivateRoute.js
        ├── index.css        # Design system tokens
        ├── App.css          # DatePicker overrides
        └── pages/
            ├── HomePage.js / .css
            ├── LoginPage.js
            ├── SignupPage.js
            ├── AuthPages.css
            ├── MainDashboard.js / .css
            ├── Dashboard.js / .css
            └── Subscription.js / .css
```