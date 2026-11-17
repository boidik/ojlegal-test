# JurisExpense - Law Firm Expense & Advance Float Management System

A high-reliability, enterprise-grade web application designed specifically for law firms, legal counsels, and litigation chambers. Built with **React 19**, **Google Material UI (MUI)**, **Google Cloud Firestore**, **Firebase Authentication**, **SheetJS (`xlsx`)**, and **jsPDF**.

---

## 🏛️ System Architecture & Portals

### 1. 💼 Staff Portal (`staff`)
- **Case Expense Entry**: Staff associates select pre-approved active cases from the registry and record date, time, expense description, amount, voucher/bill reference, and classification.
- **Advance Float Utilization**: When paying from an advance, staff select from their authorized float, automatically decrementing the balance.
- **Personal Advances Ledger**: Associates can monitor their allocated advances, total expenses absorbed, and remaining usable balance.

### 2. 📊 Accounts Admin Portal (`accounts_admin` - Boss / Managing Partner)
- **High-Level Financial Audit**: Aggregate expenditures, legal vs. technical disbursements breakdown, and firm-wide float balances.
- **Categorical Separation**: Visual separation of Legal expenses (Senior Counsel conference, court petition stamp duty) vs. Technical expenses (Forensic imaging, cloud e-discovery subscriptions) vs. Administrative expenses (Outstation tribunal travel).
- **Multi-Parameter Filter Engine**: Filter by matter/case, staff member, classification type, and custom date ranges.
- **1-Click Certified Reports**:
  - **Excel (`.xlsx`)**: Multi-sheet export with executive financial aggregates, metadata, itemized voucher ledger, and staff advances float.
  - **PDF (`.pdf`)**: Formatted High Court voucher statement with law firm letterhead, case summaries, itemized table, and verification sign-off blocks.
- **Advances Management**: Disburse advances to associates (earmarked for a specific active case or general float).

### 3. ⚙️ Software Admin Master Control (`software_admin` - You)
- **Case Registry Management**: Add, modify, or archive cases (Filing No, Court, Title, Client, Lead Attorney). Inactive cases are automatically hidden from staff expense entry.
- **Category & Audit Classification**: Add, edit, or remove expense categories and classify them (`legal`, `technical`, `administrative`).
- **User Directory & Role Administration**: Manage staff members, assign roles (`staff`, `accounts_admin`, `software_admin`), and send secure password reset emails.
- **Firm Profile & Report Layout**: Configure firm name, tagline, chamber address, contact info, currency symbol (`₹`, `$`, `£`, `€`), PDF title headers, and legal certification disclaimers without modifying code.
- **Google Firebase Integration Panel**: Input and test Firebase credentials directly from the UI with zero code changes, with instant connection verification.
- **Master Voucher Oversight**: Override, edit, or delete any voucher across the entire firm if errors occur.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
# Navigate to project directory
cd lawfirm-expense-system

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

### 2. Immediate Testing Mode (Local Fallback Preview)
The application is pre-seeded with realistic law firm cases, advances, vouchers, and users. You can immediately click **"Switch Role"** in the top navbar or select a persona on the Login page:
- 👑 **Software Admin (You)**
- 💼 **Accounts Admin (Boss - Mr. Vikramaditya Sen)**
- ⚖️ **Legal Staff (Priya Sharma)**

---

## ☁️ Setting Up Google Cloud Firestore & Firebase Auth

To connect your live Google Cloud Firestore database:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g. `lexveritas-law-firm`).
3. (Optional) Disable Google Analytics and click **Create Project**.

### Step 2: Enable Cloud Firestore Database
1. In the Firebase left sidebar, click **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose a location closest to your office (e.g., `asia-south1` for India, `us-central1` for US).
4. Start in **Production Mode** (or Test Mode).
5. Go to the **Rules** tab, paste the contents of `firestore.rules` (included in this repository), and click **Publish**.

### Step 3: Enable Authentication
1. In the Firebase left sidebar, click **Build > Authentication**.
2. Click **Get Started**.
3. In the **Sign-in method** tab:
   - Enable **Google** (Select your project support email and save).
   - Enable **Email/Password**.

### Step 4: Register Web App & Get Credentials
1. Click the **Settings (Gear Icon) > Project Settings** in the top left.
2. Scroll down to **Your apps**, click the Web icon `</>`.
3. Register the app (e.g., `LawFirmExpenseApp`).
4. Copy the `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "lexveritas-law.firebaseapp.com",
     projectId: "lexveritas-law",
     storageBucket: "lexveritas-law.appspot.com",
     messagingSenderId: "1029384756",
     appId: "1:1029384756:web:abcdef..."
   };
   ```

### Step 5: Connect in the Website
You can connect in either of two ways:
1. **Via UI (Zero Rebuild)**: In the website, go to **Software Admin > Firebase & Firestore** (or click the database chip in the top navbar), paste the keys, click **Test Connection**, and click **Save & Connect**.
2. **Via `.env` file**: Create a `.env` file from `.env.example` with your keys.

---

## 📦 Deploying with GitHub

### Option A: GitHub Pages (Automated via GitHub Actions)
1. Initialize Git in the project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Law Firm Expense & Advance Management System"
   ```
2. Create a new repository on your GitHub account (e.g., `lawfirm-expense-system`).
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/lawfirm-expense-system.git
   git branch -M main
   git push -u origin main
   ```
4. In your GitHub repository:
   - Go to **Settings > Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
   - (Optional) Go to **Settings > Secrets and variables > Actions** and add your Firebase variables (`VITE_FIREBASE_API_KEY`, etc.) as secrets if you prefer baking them at build time.
5. The included workflow `.github/workflows/deploy.yml` will automatically build and publish your site!

### Option B: Firebase Hosting (1-Command Direct Google Deployment)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select existing project, set public directory to "dist", configure as single-page app: Yes
npm run build
firebase deploy --only hosting
```

---

## 🛡️ Security & Bar Council Compliance
- All confidential matter names and client identities are safeguarded under strict Firestore role-based rules.
- Software Admin retains master audit and configuration control without any technical coding dependency.
