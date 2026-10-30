# 🚀 LeetSync Pro — Browser Extension Deployment & Publishing Guide

LeetSync Pro is built using the **Manifest V3** cross-browser WebExtension standard. It supports **Google Chrome**, **Brave**, **Opera**, **Mozilla Firefox**, and **Microsoft Edge**.

---

## 💻 Part 1: How to Load & Test Locally (Developer Mode)

### 1. Google Chrome & Brave
1. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Brave: `brave://extensions/`
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` directory from this project.
5. Pin **LeetSync Pro** to your browser toolbar.

### 2. Opera / Opera GX
1. Open Opera and enter `opera://extensions` in the URL bar.
2. Toggle on **Developer Mode** in the upper right.
3. Click **Load unpacked extension**.
4. Choose the `extension/` folder.

### 3. Mozilla Firefox
1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Under *Temporary Extensions*, click **Load Temporary Add-on...**.
3. Select the `extension/manifest.json` file.
4. The extension is now loaded and will intercept accepted submissions on `leetcode.com`.

---

## 🌐 Part 2: How to Package & Publish Live to Web Stores

### Step 1: Create the Extension Zip File
Compress the contents of the `extension/` folder into a `.zip` archive:
- **Important**: Make sure `manifest.json` is at the root of the `.zip` (do not zip the parent folder itself).

---

### Step 2: Publish to Chrome Web Store (Covers Chrome & Brave)
1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Register as a Chrome Web Store developer ($5 one-time registration fee).
3. Click **+ New Item** and upload your `leetsync-pro.zip`.
4. Fill in:
   - **Title**: LeetSync Pro
   - **Summary**: Auto-sync accepted LeetCode submissions to GitHub with intelligent categorization.
   - **Category**: Developer Tools / Productivity
   - **Icons & Screenshots**: Upload 128x128 icon and 1280x800 screenshots.
   - **Privacy Policy**: State that code is only synced to the user's GitHub repository and never stored on third-party tracking servers.
5. Submit for Review (approval typically takes 24–48 hours).
6. Once live, both **Chrome** and **Brave** users can install it directly from the Chrome Web Store!

---

### Step 3: Publish to Mozilla Firefox (AMO)
1. Go to the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/).
2. Log in with your Mozilla account.
3. Click **Submit a New Add-on**.
4. Choose **On this site** (publicly listed).
5. Upload your `.zip` archive.
6. The automated AMO validator will check the `manifest.json` (Gecko settings `leetsync-pro@ishank.dev` are already pre-configured).
7. Submit for review (Firefox reviews are usually very fast, often automated or completed within hours).

---

### Step 4: Publish to Opera Add-ons
1. Visit the [Opera Add-ons Developer Portal](https://addons.opera.com/developer/).
2. Sign in with your Opera account.
3. Click **Submit New Extension** and upload the `.zip` archive.
4. Fill out the extension description and screenshots.
5. Submit for moderation.
*(Note: Opera users can also install directly from the Chrome Web Store if they have the "Install Chrome Extensions" feature enabled).*

---

## ⚡ How It Works on LeetCode
1. Solve any problem on [leetcode.com](https://leetcode.com/problems/).
2. Submit your solution.
3. When the **Accepted** badge appears, the content script automatically captures:
   - Problem Title, Difficulty, and Topic Tags
   - Selected language (Python, C++, Java, JS/TS, Go, Rust, etc.)
   - Source code from Monaco Editor
4. Passes the data to the LeetSync engine to categorize and push to your GitHub solutions repository!
