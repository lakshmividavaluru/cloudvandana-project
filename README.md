# SF Validation Rule Manager

A React web application to manage Salesforce Validation Rules on the Account object using OAuth 2.0 and the Tooling API.

## Features

- 🔐 **OAuth 2.0 Login** — Securely connect to any Salesforce org
- ⟳ **Fetch Rules** — Load all Account Validation Rules from your org
- 📋 **View Status** — See Active / Inactive state for each rule
- ⚡ **Toggle Rules** — Enable or disable individual rules or all at once
- 🚀 **Deploy Changes** — Push all pending changes to Salesforce in one click

---

## Prerequisites

- Node.js v18+
- A [Salesforce Developer Org](https://developer.salesforce.com/signup)
- 4–5 Validation Rules on the **Account** object (see below)
- A **Connected App** in Salesforce

---

## Salesforce Setup

### 1. Create Validation Rules on Account

Go to: **Setup → Object Manager → Account → Validation Rules → New**

Create at least 4 rules, for example:

| Rule Name | Formula | Error Message |
|-----------|---------|---------------|
| Phone_Required | `ISBLANK(Phone)` | Phone number is required |
| Website_Format | `NOT(CONTAINS(Website, "http"))` | Website must start with http |
| Revenue_Positive | `AnnualRevenue <= 0` | Annual Revenue must be greater than 0 |
| BillingCity_Required | `ISBLANK(BillingCity)` | Billing City is required |
| Employees_Positive | `NumberOfEmployees <= 0` | Number of Employees must be positive |

### 2. Create a Connected App

1. Go to **Setup → App Manager → New Connected App**
2. Fill in:
   - **Connected App Name**: SF Rule Manager
   - **API Name**: SF_Rule_Manager
   - **Contact Email**: your email
3. Enable **OAuth Settings**:
   - **Callback URL**: `http://localhost:3000/oauth/callback`
   - **Selected OAuth Scopes**: `full`, `refresh_token / offline_access`, `Perform requests at any time (refresh_token)`
4. Save and wait ~10 minutes for it to activate
5. Go to **Manage → Edit Policies** → set Permitted Users to **All users may self-authorize**
6. Note the **Consumer Key** and **Consumer Secret**

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/lakshmividavaluru/sf-validation-manager.git
cd sf-validation-manager
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SF_LOGIN_URL=https://login.salesforce.com
VITE_SF_CLIENT_ID=your_consumer_key
VITE_SF_CLIENT_SECRET=your_consumer_secret
VITE_SF_REDIRECT_URI=http://localhost:3000/oauth/callback
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/lakshmividavaluru/sf-validation-manager.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → import `sf-validation-manager`
3. Add Environment Variables (same as your `.env` but update `VITE_SF_REDIRECT_URI` to your Vercel URL):
   ```
   VITE_SF_LOGIN_URL = https://login.salesforce.com
   VITE_SF_CLIENT_ID = your_consumer_key
   VITE_SF_CLIENT_SECRET = your_consumer_secret
   VITE_SF_REDIRECT_URI = https://your-app.vercel.app/oauth/callback
   ```
4. Click **Deploy**

### 3. Update Salesforce Connected App

After deployment, add your Vercel callback URL to the Connected App:
- **Setup → App Manager → SF Rule Manager → Edit**
- Add `https://your-app.vercel.app/oauth/callback` to Callback URLs

---

## Tech Stack

- **React 18** with Vite
- **Salesforce OAuth 2.0** Web Server Flow
- **Salesforce Tooling API** v59.0
- **Vercel** for hosting

---

## Project Structure

```
src/
├── components/
│   ├── LoginPage.jsx       # OAuth login screen
│   ├── LoginPage.css
│   ├── Dashboard.jsx       # Main app with rules management
│   ├── Dashboard.css
│   ├── RuleCard.jsx        # Individual rule card with toggle
│   ├── RuleCard.css
│   ├── OAuthCallback.jsx   # Handles OAuth redirect
│   ├── Toast.jsx           # Notification component
│   └── Toast.css
├── services/
│   ├── salesforceAuth.js   # OAuth 2.0 flow
│   └── toolingAPI.js       # Tooling API calls
├── App.jsx
├── App.css
└── main.jsx
```

---

## Submission

Send the following to **careers@cloudvandana.com**:
- Live app URL: `https://your-app.vercel.app`
- GitHub repo: `https://github.com/lakshmividavaluru/sf-validation-manager`
- Updated resume
