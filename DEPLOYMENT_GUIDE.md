# GitHub Pages Deployment Guide

## Quick Start (5 minutes)

### 1. Create GitHub Repository

```bash
# Create new repo on GitHub first via web interface
# Then clone it locally
git clone https://github.com/YOUR_USERNAME/guest-review-dashboard.git
cd guest-review-dashboard
```

### 2. Copy Project Files

```bash
# Copy all project files to the repository directory
cp -r /path/to/dashboard/* .

# Files should be in root:
ls -la
# index.html
# css/style.css
# js/*.js
# data-model.md
# etc.
```

### 3. Configure Firebase

Edit `js/firebase.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Push to GitHub

```bash
git add .
git commit -m "Initial commit: Guest Review Dashboard"
git push origin main
```

### 5. Enable GitHub Pages

1. Go to repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar under "Code and automation")
4. Set **Source** to "Deploy from a branch"
5. Set **Branch** to "main"
6. Click **Save**
7. Wait 1-2 minutes
8. Your site is live at: `https://YOUR_USERNAME.github.io/guest-review-dashboard/`

---

## Detailed Deployment Steps

### Step 1: Initialize Git Repository

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/guest-review-dashboard.git
git push -u origin main
```

### Step 2: Verify File Structure

GitHub Pages requires correct structure:

```
your-repo/
├── index.html                 (MUST be in root)
├── css/
│   └── style.css
├── js/
│   ├── firebase.js
│   ├── api.js
│   ├── dashboard.js
│   ├── properties.js
│   ├── reviews.js
│   ├── actions.js
│   └── utils.js
├── data-model.md
├── SETUP_GUIDE.md
└── DEPLOYMENT_GUIDE.md
```

### Step 3: Update GitHub Pages Settings

1. Navigate to Repository Settings
2. Find "Pages" under "Code and automation"
3. **Source**: Select "Deploy from a branch"
4. **Branch**: Select "main" and "/ (root)"
5. Click **Save**

### Step 4: Wait for Deployment

GitHub Pages deploys automatically:
- Check **Actions** tab to see deployment progress
- Green checkmark = successful deployment
- Red X = check build logs

### Step 5: Verify Site is Live

```bash
# After deployment (1-2 mins):
https://YOUR_USERNAME.github.io/guest-review-dashboard/
```

The dashboard should load and show Firebase configuration prompt if not set up.

---

## CORS & Domain Configuration

### Add GitHub Pages Domain to Firebase

1. Go to Firebase Console
2. Settings → Project Settings → Authorized Domains
3. Add your GitHub Pages domain:
   - `your-username.github.io`
4. Save

This prevents CORS errors when loading from GitHub Pages.

---

## Testing After Deployment

### 1. Test Dashboard Loading

- [ ] Page loads at GitHub Pages URL
- [ ] Layout displays correctly
- [ ] CSS styling applies (not just plain HTML)
- [ ] JavaScript doesn't show errors in console (F12)

### 2. Test Firebase Connection

- [ ] Firebase initializes (check console)
- [ ] "✓ Firebase initialized successfully" appears
- [ ] No authentication errors

### 3. Test Core Features

- [ ] Dashboard shows KPI cards
- [ ] Can navigate between pages
- [ ] Can add new property
- [ ] Can add new review
- [ ] Data persists to Firestore

### 4. Test UI Features

- [ ] Dark mode toggle works
- [ ] Sidebar navigation works
- [ ] Forms submit without errors
- [ ] Charts render correctly

---

## Update Deployments

### Make Changes Locally

1. Edit files (e.g., `js/dashboard.js`)
2. Test locally if possible
3. Commit and push:

```bash
git add .
git commit -m "Feature: Add new KPI card"
git push origin main
```

### GitHub Pages Auto-Updates

- Your changes deploy automatically
- Usually takes 1-2 minutes
- Check Actions tab for status

### Cache-Busting

If changes don't show:

1. **Hard refresh** browser (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache**
3. **Wait 5 minutes** for GitHub to propagate
4. **Try incognito mode** to avoid browser cache

---

## Using a Custom Domain (Optional)

### 1. Point Domain to GitHub Pages

Add DNS records to your domain registrar:

**Option A: APEX Domain (example.com)**
```
A records pointing to:
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153
```

**Option B: Subdomain (dashboard.example.com)**
```
CNAME record:
dashboard.example.com → your-username.github.io
```

### 2. Update GitHub Pages Settings

1. In Repository Settings → Pages
2. Set **Custom domain** to your domain
3. GitHub automatically creates CNAME file
4. Enable **Enforce HTTPS**

### 3. Verify DNS

```bash
# Check DNS propagation
nslookup your-domain.com
```

Typically takes 15-30 minutes for DNS to propagate.

---

## Troubleshooting Deployment

### Page shows 404

**Solution:**
1. Make sure `index.html` is in repository root (not in subfolder)
2. Verify **Pages** settings point to correct branch and directory
3. Try force-pushing: `git push -f origin main`

### Changes not showing

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Wait 5 minutes for propagation
4. Try different browser

### CSS not loading (unstyled page)

**Solution:**
1. Check browser console for 404 on CSS files
2. Verify `css/style.css` path is correct
3. Confirm CSS file exists in repository
4. Check file permissions

### JavaScript not working

**Solution:**
1. Open browser console (F12)
2. Look for error messages
3. Check for CORS errors (Firebase credentials issue)
4. Verify module imports in `index.html`

### Firebase initialization fails

**Solution:**
1. Check `js/firebase.js` has correct credentials
2. Verify Firebase project exists
3. Ensure Firestore database is created
4. Check security rules allow your domain

### Data not saving

**Solution:**
1. Confirm Firebase credentials are correct
2. Check Firestore security rules
3. Add GitHub Pages domain to Firebase Authorized Domains
4. Check browser console for error details

---

## Performance Optimization

### 1. Minify Assets (Optional)

```bash
# Install minifier
npm install -g minifier

# Minify CSS
minifier css/style.css > css/style.min.css

# Update index.html to use .min.css
```

### 2. Image Optimization

If you add images:
```bash
# Use optimized image formats (WebP, JPEG)
# Compress images before adding to repo
```

### 3. Monitor Performance

- Use Chrome DevTools (F12 → Performance tab)
- Test with GitHub Pages' CDN from different locations
- Monitor load time

---

## SSL/HTTPS Enforcement

GitHub Pages automatically provides HTTPS:

1. Go to Repository Settings → Pages
2. Enable **"Enforce HTTPS"**
3. Site is now accessible via: `https://your-username.github.io/guest-review-dashboard/`

---

## Keeping Repository Clean

### .gitignore (Optional)

```bash
# Create .gitignore to exclude unnecessary files
cat > .gitignore << EOF
node_modules/
.env
.env.local
*.swp
*.swo
.DS_Store
EOF
```

### Remove Large Files

If you accidentally commit large files:

```bash
# Remove from git history
git rm -r --cached node_modules/
git commit -m "Remove node_modules"
git push origin main
```

---

## Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firebase credentials added to `js/firebase.js`
- [ ] All project files in repository root
- [ ] `index.html` is in root directory
- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled in Settings
- [ ] Custom domain configured (if using)
- [ ] HTTPS enforced
- [ ] GitHub Pages domain added to Firebase
- [ ] Dashboard loads without errors
- [ ] Firebase initializes successfully
- [ ] Can add data and view in Firestore

---

## Rollback Deployment

If something goes wrong, revert to previous version:

```bash
# List recent commits
git log --oneline -5

# Revert to previous commit
git revert <COMMIT_HASH>
git push origin main

# Or reset to specific point
git reset --hard <COMMIT_HASH>
git push -f origin main
```

---

## Monitoring & Maintenance

### Weekly Checks

- [ ] Dashboard loads without errors
- [ ] Firestore has new data
- [ ] No error messages in console
- [ ] Performance is acceptable

### Monthly Tasks

- [ ] Review Firebase security rules
- [ ] Check Firestore usage/costs
- [ ] Backup critical data
- [ ] Review action items from issues

---

## Advanced: CI/CD with GitHub Actions (Optional)

### Automated Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

This automatically deploys on every push to main.

---

## Support & Documentation

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Troubleshoot GitHub Pages Build Failures](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-jekyll-build-errors-for-github-pages-sites)
- [Firebase Hosting (Alternative)](https://firebase.google.com/docs/hosting)

---

## Migration to Production

When moving to production:

1. **Use Firebase Hosting** instead of GitHub Pages (better performance)
2. **Implement user authentication**
3. **Update security rules** for production
4. **Add monitoring** and alerting
5. **Backup Firestore** regularly
6. **Use custom domain** with SSL
7. **Add user management** via Firebase Console

See `data-model.md` for SaaS scaling recommendations.
