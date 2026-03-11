# 🔒 SECURE SETUP GUIDE - Guest Review Dashboard

## 📂 **File Structure You Need**

```
Your Computer (Local Folder):
├── index.html           ← PUBLIC (goes to GitHub) ✅
├── config.js            ← PRIVATE (stays on your computer) 🔒
├── .gitignore           ← PUBLIC (goes to GitHub) ✅
└── (other files if any)

GitHub (Public Repository):
├── index.html           ✅ VISIBLE
├── .gitignore           ✅ VISIBLE
└── (other files)

❌ config.js is NOT on GitHub
```

---

## 🚀 **STEP-BY-STEP SETUP**

### **STEP 1: Download the Files**

Download these 3 files:
1. `config.js` - Contains your Firebase credentials
2. `index-clean.html` - Rename to `index.html`
3. `.gitignore` - Tells Git to ignore config.js

**All files are in:** `/mnt/user-data/outputs/`

---

### **STEP 2: Prepare Your Local Folder**

On your computer:

1. **Create a new folder** (example: `Guest-Review-Dashboard`)
   ```
   C:\Users\YourName\Documents\Guest-Review-Dashboard
   ```

2. **Put these files IN the folder:**
   ```
   config.js              ← Copy from outputs
   index.html             ← Rename from index-clean.html
   .gitignore             ← Copy from outputs
   ```

3. **Verify files are there:**
   - `ls` (Mac/Linux) or `dir` (Windows)
   - Should show: `config.js`, `index.html`, `.gitignore`

---

### **STEP 3: Initialize Git (First Time Only)**

Open Terminal/Command Prompt in your folder:

```bash
# Navigate to your folder
cd Guest-Review-Dashboard

# Initialize Git
git init

# Add all files
git add .

# Check what's being added
git status
```

**You should see:**
```
✅ index.html
✅ .gitignore
❌ config.js (NOT listed - .gitignore hides it!)
```

If you see `config.js` in the list, ❌ **STOP!** 
- Delete `.gitignore`
- Re-download it from outputs
- It might have been edited

---

### **STEP 4: Connect to GitHub**

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/Guest-Review-Dashboard.git

# Verify connection
git remote -v
```

Replace `YOUR-USERNAME` with your GitHub username.

---

### **STEP 5: First Commit & Push**

```bash
# Create commit with message
git commit -m "Initial commit: Guest Review Dashboard with secure config"

# Push to GitHub
git push -u origin main
```

If you get error about "main" vs "master":
```bash
git branch -M main
git push -u origin main
```

---

### **STEP 6: Verify GitHub is Secure**

Go to **GitHub** → Your repository → **View Files**

You should see:
```
✅ index.html  (can view the code)
✅ .gitignore  (can view - shows config.js is ignored)
❌ config.js is NOT visible (not on GitHub!)
```

**Open index.html in browser** to see the code:
- Search for "firebaseConfig"
- You should see: `<script src="config.js"></script>`
- NO actual API key visible ✅

---

## 🔄 **DAILY WORKFLOW (After Setup)**

Every time you make changes:

```bash
# 1. Check what changed
git status

# 2. Add changes
git add .

# 3. Commit with message
git commit -m "Updated reviews page"

# 4. Push to GitHub
git push
```

**Important:**
- `config.js` is NEVER pushed (it's in .gitignore)
- `index.html` is pushed every time
- Both files must be in your LOCAL folder for app to work

---

## ⚠️ **CRITICAL CHECKLIST**

- [ ] `config.js` file is on your computer (NOT on GitHub)
- [ ] `.gitignore` file contains `config.js`
- [ ] `index.html` has `<script src="config.js"></script>` at top
- [ ] GitHub repository shows index.html but NOT config.js
- [ ] App loads successfully (Firebase Connected ✓)
- [ ] You can add properties and reviews

---

## 🚨 **EMERGENCY: If config.js Accidentally Pushed**

If you see `config.js` on GitHub:

```bash
# Remove from GitHub (but keep locally)
git rm --cached config.js

# Commit the removal
git commit -m "Remove config.js from GitHub"

# Push
git push

# Then IMMEDIATELY CHANGE your Firebase credentials in the Console!
```

**Link:** https://console.firebase.google.com/

---

## 📞 **Troubleshooting**

**Q: App says "config.js not found"**
- A: Make sure config.js is in the SAME folder as index.html on your computer

**Q: App works locally but not on GitHub Pages**
- A: GitHub Pages doesn't serve .gitignored files
- Need to either:
  1. Keep config.js locally & use locally only
  2. OR use environment variables (advanced)

**Q: I pushed config.js by accident!**
- See "EMERGENCY" section above
- Then regenerate your Firebase API key immediately

---

## ✅ **You're All Set!**

Your dashboard is:
- ✅ Secured (no credentials on GitHub)
- ✅ Professional (clean code structure)
- ✅ Maintainable (easy to update)
- ✅ Scalable (ready for SaaS)

Enjoy! 🎉
