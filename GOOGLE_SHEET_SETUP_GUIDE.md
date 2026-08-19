# 📊 Plash Pilates — Google Sheet Integration Step-by-Step Guide

Follow these simple steps (takes ~2 minutes) to connect your website contact/trial booking form directly to Google Sheets.

---

## 🎯 What We Need From You
After following the 5 steps below, you will get a **Web App URL** that looks like this:
```
https://script.google.com/macros/s/AKfycbx.../exec
```
👉 **Just copy that URL and send it to me (or paste it into `index.html` at line ~3380 in `GOOGLE_SCRIPT_WEB_APP_URL`).**

---

## 📝 Step-by-Step Instructions

### Step 1: Create a New Google Sheet
1. Open your browser and go to: **[sheets.new](https://sheets.new)** (or create a new Google Spreadsheet in your Google Drive).
2. Name the spreadsheet at the top-left:
   `Plash Pilates - Trial Bookings & Leads`
3. *(Optional)* Rename the bottom tab from `Sheet1` to `Leads`.

---

### Step 2: Open Google Apps Script
1. In the top menu of your Google Sheet, click **Extensions** > **Apps Script**.
2. A new tab will open with the code editor showing `function myFunction() { ... }`.

---

### Step 3: Paste the Provided Webhook Code
1. Delete everything inside the editor (`Code.gs`).
2. Open the file **`google-apps-script.js`** in your project folder (or copy the code below).
3. Paste the entire code into the Apps Script editor.
4. *(Optional)* On line 20, update the notification email address (`plashpilates@gmail.com`) if you want instant email alerts on every booking.
5. Click the **Save** icon 💾 (or press `Ctrl + S` / `Cmd + S`).

---

### Step 4: Deploy as a Web App (CRITICAL STEP)
1. In the top right corner of Apps Script, click the blue **Deploy** button > click **New deployment**.
2. Next to *Select type*, click the ⚙️ **Gear icon** and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Plash Pilates Webhook`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: **`Anyone`** ⚠️ *(IMPORTANT: This must be set to "Anyone", so visitors on your website can submit without logging into Google).*
4. Click **Deploy**.

---

### Step 5: Authorize Permissions & Copy the Web App URL
1. Google will prompt: *"Authorization required"*. Click **Authorize access** (or *Review permissions*).
2. Choose your Google account.
3. If you see *"Google hasn't verified this app"*:
   - Click **Advanced** (bottom left of modal).
   - Click **Go to Untitled project (unsafe)**.
   - Click **Allow**.
4. You will now see a screen titled **Deployment successfully updated**.
5. Copy the **Web App URL** (under the "Web app" section):
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 🚀 Final Step: Send the URL or Paste it in `index.html`
- **Option A**: Reply to me in the chat with your Web App URL, and I will connect it immediately!
- **Option B**: Open `index.html`, search for `GOOGLE_SCRIPT_WEB_APP_URL`, and paste your URL inside the quotes:
  ```javascript
  const GOOGLE_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
  ```

---

## 📋 What Gets Saved in Your Google Sheet:
Every submission automatically creates a formatted row with:
| Column | Header Name | Example Data |
|---|---|---|
| A | Timestamp (IST) | `19/08/2026, 03:45:00 PM` |
| B | Full Name | `Priya Sharma` |
| C | Email Address | `priya@example.com` |
| D | Phone / WhatsApp | `+91 9876543210` |
| E | Age | `28` |
| F | Preferred Discipline | `Reformer Pilates` |
| G | Preferred Slot | `Morning (7:00 AM - 11:00 AM)` |
| H | Status | `New Lead` |
| I | Notes | *(Space for studio team follow-up notes)* |
