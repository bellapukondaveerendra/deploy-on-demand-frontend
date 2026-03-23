# Deploy-On-Demand — Frontend

React SPA for the Deploy-On-Demand platform. Provides authentication, a deployment dashboard, Docker log viewing, scheduling, and subscription management.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (Create React App) |
| Routing | React Router v7 |
| HTTP | axios |
| Animation | Framer Motion |
| Date picking | react-datepicker |
| Icons | react-icons (Font Awesome) |
| Payments | @paypal/react-paypal-js |
| Fonts | Syne (display) + Space Mono (monospace) via Google Fonts |

---

## Project Structure

```
frontend/src/
├── index.js              # React root, mounts <App />
├── index.css             # Design system — CSS variables, reset, shared utilities
├── App.js                # Router + route definitions
├── App.css               # Global overrides (DatePicker dark theme)
├── PrivateRoute.js       # Auth guard for protected routes
│
└── pages/
    ├── HomePage.js       # Landing page with animated canvas + terminal mockup
    ├── HomePage.css
    ├── LoginPage.js      # Login form
    ├── SignupPage.js     # Sign-up form with client-side validation
    ├── AuthPages.css     # Shared styles for Login + Signup
    ├── MainDashboard.js  # App shell — sidebar, tab routing, all protected views
    ├── MainDashboard.css
    ├── Dashboard.js      # Deploy form (new deployment tab content)
    ├── Dashboard.css
    ├── Subscription.js   # Free vs Premium plan comparison + PayPal buttons
    └── Subscription.css
```

---

## Setup

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:9000`

### Install and run

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`.

### Available scripts

| Script | Description |
|---|---|
| `npm start` | Development server with hot reload |
| `npm run build` | Production build to `/build` |
| `npm test` | Jest test runner |

---

## Routes

| Path | Component | Protected | Description |
|---|---|---|---|
| `/` | `HomePage` | No | Landing page |
| `/login` | `LoginPage` | No | Login form |
| `/signup` | `SignupPage` | No | Sign-up form |
| `/maindashboard` | `MainDashboard` | **Yes** | Main app shell |
| `/dashboard` | `Dashboard` | **Yes** | Standalone deploy form |
| `/subscription` | `Subscription` | **Yes** | Plan comparison + payment |

`PrivateRoute` checks `sessionStorage.getItem("isLoggedIn") === "true"` and redirects to `/login` if not authenticated.

---

## Auth Flow

On successful login or signup, the following are written to `sessionStorage`:

| Key | Value |
|---|---|
| `isLoggedIn` | `"true"` |
| `token` | JWT access token |
| `user_id` | UUID |
| `username` | Display name |
| `email` | Email address |

Every protected API call includes:
```
Authorization: Bearer <token>
```

On logout, `sessionStorage.clear()` is called and the user is redirected to `/`.

---

## Pages

### `HomePage`
- Animated particle canvas background (pure Canvas API, no library)
- Terminal mockup showing a sample deploy flow
- Feature cards with scroll-triggered fade-in (Framer Motion)
- Navigation to `/login` and `/signup`

### `LoginPage` / `SignupPage`
- Shared `AuthPages.css` design
- Client-side validation on signup (password match, min length)
- Error messages surfaced from backend response `detail` field
- Redirect to `/maindashboard` on success

### `MainDashboard`
The main app shell. Manages its own tab state — no URL-based sub-routing.

**Sidebar tabs:**

| Tab key | Content |
|---|---|
| `home` | Deployment stats overview + quick action buttons |
| `new` | Renders `<Dashboard />` deploy form inline |
| `deployments` | Full deployment history with actions |
| `subscription` | Renders `<Subscription />` inline |

**Deployment list actions:**
- 🔗 Open public URL in new tab
- 👁 View Docker logs (modal)
- 🔄 Redeploy (confirmation modal with checkbox)
- 🗑 Delete (window.confirm)

**Limit handling:** When the free tier limit is reached, "New Deployment" and "Redo" open a popup directing the user to upgrade.

### `Dashboard`
Deploy form with the following fields:

| Field | Always shown | Notes |
|---|---|---|
| Deployment Name | ✅ | Free text |
| GitHub Repo URL | ✅ | HTTPS or SSH, normalised on backend |
| Branch | ✅ | Defaults to `main` |
| Project Type | ✅ | Static/Frontend or Backend Service |
| Entry File | Backend only | Shown when Backend Service is selected |
| .env file? | ✅ | Toggle + file upload when Yes |

On error, the actual Docker build output is shown in a preformatted block (not a generic message).

### `Subscription`
- Monthly / Yearly plan toggle
- Free tier feature list (non-clickable)
- Premium tier with PayPal button
- If already subscribed, shows active plan details instead of the comparison

---

## Design System

All design tokens are CSS custom properties in `src/index.css`. Import this file once in `index.js` — all pages inherit the tokens automatically.

### Colour tokens

```css
--bg-base        /* #080b10  — page background */
--bg-surface     /* #0d1117  — card background */
--bg-elevated    /* #161b22  — raised elements */
--bg-overlay     /* #1c2230  — modals */

--text-primary   /* #e6edf3 */
--text-secondary /* #8b949e */
--text-muted     /* #484f58 */

--accent         /* #7c3aed  — primary purple */
--accent-light   /* #a78bfa */
--accent-dim     /* rgba(124,58,237,.12) — tinted backgrounds */
--accent-glow    /* rgba(124,58,237,.35) — box-shadow glow */

--green          /* #3fb950 */
--red            /* #f85149 */
--yellow         /* #d29922 */
--blue           /* #58a6ff */
```

### Typography

```css
--font-display  /* 'Syne'       — headings, brand, numbers */
--font-mono     /* 'Space Mono' — body, inputs, code, labels */
```

### Shared utility classes

| Class | Usage |
|---|---|
| `.btn-primary` | Purple filled button |
| `.btn-ghost` | Bordered transparent button |
| `.btn-danger` | Red tinted button |
| `.badge` | Pill badge (combine with modifier) |
| `.badge-success` | Green |
| `.badge-pending` | Yellow |
| `.badge-failed` | Red |
| `.badge-running` | Blue |

---

## Adding a New Page

1. Create `src/pages/MyPage.js` and `src/pages/MyPage.css`
2. Add a route in `App.js`:
```jsx
import MyPage from "./pages/MyPage";

// inside <Routes>
<Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
```
3. If it should appear in the sidebar, add an entry to `navItems` in `MainDashboard.js`:
```js
{ id: "mypage", label: "My Page", icon: <FaStar /> }
```
4. Add the corresponding render block in `MainDashboard`'s content area:
```jsx
{tab === "mypage" && <MyPage />}
```

---

## API Integration

All API calls use axios with the JWT from `sessionStorage`:

```js
const token = sessionStorage.getItem("token");

const res = await axios.get("http://localhost:9000/some-endpoint", {
  headers: { Authorization: `Bearer ${token}` },
});
```

The base URL `http://localhost:9000` is used directly in each page. If you want to centralise it, create `src/api.js`:

```js
// src/api.js
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:9000" });

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Then replace `axios.get(...)` with `api.get(...)` throughout.