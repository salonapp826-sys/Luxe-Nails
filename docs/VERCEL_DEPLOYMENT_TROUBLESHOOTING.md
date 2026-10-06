# Vercel Deployment Troubleshooting & GitHub Ownership Guide

This guide details how to resolve and prevent deployment blocks on Vercel's **Hobby (Free) Plan**, specifically regarding contributor and organization authorization restrictions.

---

## 1. The Common Error

```text
The deployment was blocked because the commit author does not have contributing access to the project on Vercel.
The Hobby Plan does not support collaboration for private repositories.
```

---

## 2. Root Cause Analysis

Vercel Hobby accounts are strictly provisioned for personal, non-commercial use by a single individual. Vercel enforces the following rules:

1. **Private GitHub Organization Repositories**:
   - Private repositories owned by a **GitHub Organization** (e.g., `diamondmediapromotion-del/LuxeNails`) are treated as team repositories.
   - When deployed from a personal Vercel Hobby account, any commit made by organization members or automated bots is flagged as "unlicensed collaboration."

2. **Commit Author Mismatch**:
   - Commits authored by AI generators (e.g., `OnSpaceAI`), secondary email addresses, or unverified GitHub accounts do not match the single Vercel account owner.

3. **Co-Authored-By Header Tags**:
   - If a commit message contains `Co-authored-by:` metadata pointing to another user or bot, Vercel treats the commit as having multiple contributors.

---

## 3. Pre-Deployment Verification Checklist

Before pushing commits intended for Vercel Hobby production deployments:

| Check | Requirement | How to Verify |
| :--- | :--- | :--- |
| **Git User Name** | Must match verified GitHub username | `git config user.name` |
| **Git User Email** | Must match verified GitHub account email | `git config user.email` |
| **Commit Author** | Matches Vercel's connected GitHub login | `git log -n 1 --pretty=fuller` |
| **No Co-Authors** | No secondary `Co-authored-by:` lines | Inspect commit body in `git log` |
| **Pre-Build Health** | Environment vars and routes verified | `npm run check:env` |

---

## 4. Resolution Paths

### Option A: Transfer Repository to Personal GitHub Account (Recommended for Privacy)
If you want to keep the repository **100% private** without upgrading to Vercel Pro:

1. **Transfer in GitHub**:
   - Navigate to **GitHub Repository $\rightarrow$ Settings $\rightarrow$ Danger Zone $\rightarrow$ Transfer ownership**.
   - Enter your personal GitHub username connected to your Vercel account.
   - Confirm the transfer. *(GitHub preserves all branches, commits, PRs, and sets up automatic URL redirects).*
2. **Reconnect in Vercel**:
   - In **Vercel Dashboard $\rightarrow$ [Project] $\rightarrow$ Settings $\rightarrow$ Git**, disconnect and reconnect the newly transferred personal repository (`your-username/LuxeNails`).
3. **Trigger Deployment**:
   - Push a fresh commit or click **Redeploy** on the Vercel Deployments tab.

---

### Option B: Make Repository Public (Fastest 1-Click Fix)
If the project does not contain proprietary backend secrets:

1. Navigate to **GitHub Repository $\rightarrow$ Settings $\rightarrow$ Danger Zone $\rightarrow$ Change repository visibility**.
2. Select **Make Public**.
3. In Vercel, click **Redeploy** on the latest deployment. Public repositories have zero contributor restrictions on the Hobby plan.

---

### Option C: Align Local Git Author Identity (For Personal Repositories)
To ensure all local commits are authored under your verified identity:

```bash
# 1. Set global or repository-specific identity
git config user.name "diamondmediapromotion-del"
git config user.email "diamondmediapromotion@gmail.com"

# 2. Check the current configuration
git config -l | grep user

# 3. Create a clean commit under your identity
git add -A
git commit -m "chore: update application" --author="diamondmediapromotion-del <diamondmediapromotion@gmail.com>"

# 4. Push to production branch
git push origin main
```

---

### Option D: Reconnect GitHub Authentication in Vercel
If permissions or OAuth scopes become stale:

1. Go to **[Vercel Account Settings](https://vercel.com/account) $\rightarrow$ Authentication $\rightarrow$ GitHub**.
2. Click **Disconnect**, then click **Connect GitHub**.
3. Grant access to your personal account and any required organizations.
4. Return to your project and trigger a **Redeploy**.

---

## 5. Automated Environment Dry-Run Validation

The project includes an automated pre-build validation check:

```bash
npm run check:env
```

This script verifies:
- `VITE_SUPABASE_URL` format and accessibility.
- `VITE_SUPABASE_ANON_KEY` validity.
- `vercel.json` SPA rewrite rules (`/(.*) -> /index.html`).
- `index.html` root mounting element presence.
