# 🔍 How to Debug Your Vercel Internal Server Error

## What I Just Did

I've added **two powerful debugging tools**:

1. **Extensive logging** in the login endpoint
2. **Test endpoint** at `/api/test` to check your environment

## 🚀 Step-by-Step Debugging Process

### Step 1: Deploy the Code with Debugging

```bash
git add .
git commit -m "Add debugging tools for Vercel"
git push
```

Wait for Vercel to deploy (usually 1-2 minutes).

---

### Step 2: Test the Test Endpoint

Once deployed, open your browser and go to:

```
https://your-app.vercel.app/api/test
```

This will show you:
- ✅ Environment variables status
- ✅ Database connection status
- ✅ User count (if database works)
- ❌ Any errors

**Example Good Response:**
```json
{
  "status": "ok",
  "checks": {
    "timestamp": "2026-01-07T14:42:32.000Z",
    "environment": "production",
    "hasDbUrl": true,
    "hasJwtSecret": true,
    "dbUrlPreview": "postgresql://neondb_owner:npg..."
  },
  "database": {
    "connected": true,
    "error": null,
    "userCount": 3
  }
}
```

**Example Bad Response (Missing Env Var):**
```json
{
  "status": "ok",
  "checks": {
    "hasDbUrl": false,  ← PROBLEM!
    "hasJwtSecret": true
  },
  "database": {
    "connected": false,
    "error": "Missing DATABASE_URL env var"
  }
}
```

**Example Bad Response (Database Error):**
```json
{
  "database": {
    "connected": false,
    "error": "Can't reach database server"  ← PROBLEM!
  }
}
```

---

### Step 3: Check Vercel Logs

#### Method 1: Vercel Dashboard (Easiest)

1. Go to **https://vercel.com/dashboard**
2. Click on **your project**
3. Click on the **latest deployment**
4. Click on **"Functions"** tab
5. You'll see a list like:
   - `/api/auth/login`
   - `/api/test`
   - etc.
6. Click on **`/api/auth/login`**
7. Click on **"Logs"** or **"Real-time"**
8. Now try to **login on your site**
9. **Watch the logs** appear

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# View logs in real-time
vercel logs --follow
```

Keep this terminal open, then try to login on your site.

---

### Step 4: Try to Login

Go to your Vercel site and try to login:

```
https://your-app.vercel.app/login
```

Use credentials:
- Email: `admin@example.com`
- Password: `admin123`

---

### Step 5: Read the Logs

The logs will show EXACTLY what's happening:

#### Example 1: Success
```
=== LOGIN REQUEST STARTED ===
Environment check: { hasDbUrl: true, hasJwtSecret: true, nodeEnv: 'production' }
Request body parsed successfully
Email received: present
Password received: present
Trimmed email: admin@example.com
Starting database lookup...
Database lookup result: User found
Starting password verification...
Password verification result: Valid
Starting JWT token generation...
JWT token generated successfully
Creating response...
Setting cookie...
=== LOGIN SUCCESS ===
```

#### Example 2: Environment Variable Missing
```
=== LOGIN REQUEST STARTED ===
Environment check: { hasDbUrl: false, hasJwtSecret: true, nodeEnv: 'production' }
=== UNEXPECTED ERROR ===
Error details: { message: "Missing DATABASE_URL env var" }
```
**FIX:** Add DATABASE_URL in Vercel settings

#### Example 3: Database Connection Error
```
=== LOGIN REQUEST STARTED ===
Environment check: { hasDbUrl: true, hasJwtSecret: true, nodeEnv: 'production' }
Request body parsed successfully
Email received: present
Password received: present
Trimmed email: admin@example.com
Starting database lookup...
DATABASE ERROR: {
  message: "Can't reach database server at ep-lucky-boat-ahvybth7-pooler.c-3.us-east-1.aws.neon.tech",
  name: "PrismaClientKnownRequestError"
}
```
**FIX:** Check database connection string or database status

#### Example 4: Prisma Client Not Generated
```
=== UNEXPECTED ERROR ===
Error details: {
  message: "@prisma/client did not initialize yet. Please run `prisma generate`"
}
```
**FIX:** Check build script in package.json

#### Example 5: Wrong Password Hash
```
Starting password verification...
BCRYPT ERROR: {
  message: "Invalid salt version"
}
```
**FIX:** Password hash is corrupted or invalid format

---

## 🎯 Common Problems & Solutions

### Problem 1: Environment Variables Not Set

**Symptom:**
- Test endpoint shows `"hasDbUrl": false`
- Logs show "Missing DATABASE_URL env var"

**Solution:**
1. Go to Vercel Dashboard
2. Project → Settings → Environment Variables
3. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://neondb_owner:npg_JU79DjcCbpSW@ep-lucky-boat-ahvybth7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
4. Add:
   - **Name:** `NEXTAUTH_SECRET`
   - **Value:** `u1leKi32dE4RVwT8DyfOzM5AjsHQ6NYa`
5. **Redeploy** (Vercel should auto-redeploy, or push a new commit)

### Problem 2: Database Can't Connect

**Symptom:**
- Test endpoint shows connection error
- Logs show "Can't reach database server"

**Solution:**
1. Check if your Neon database is active (not paused)
2. Go to Neon dashboard: https://console.neon.tech/
3. Check if your database is running
4. Verify the connection string is correct
5. Make sure it does NOT have `channel_binding=require`

### Problem 3: Prisma Client Not Generated

**Symptom:**
- Logs show "@prisma/client did not initialize yet"

**Solution:**
Check `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build --webpack"
  }
}
```
Make sure `prisma generate` runs BEFORE `next build`.

### Problem 4: User Not Found

**Symptom:**
- Test endpoint shows `"userCount": 0`
- Logs show "User not found - returning 401"

**Solution:**
Your database has no users. Run the seed script:
```bash
npx tsx prisma/seed.ts
```

Then check your production database has users.

---

## 📋 Checklist

Before we can fix the issue, we need to know:

- [ ] What does `/api/test` endpoint show?
- [ ] What do the Vercel logs show when you try to login?
- [ ] Are environment variables set in Vercel?
- [ ] Is your database active and accessible?

---

## 🆘 Next Steps

1. **Deploy the code** (with debugging tools)
2. **Visit** `https://your-app.vercel.app/api/test`
3. **Copy the response** and share it with me
4. **Try to login** and check Vercel logs
5. **Copy the error logs** and share them with me

With this information, I can tell you EXACTLY what's wrong! 🎯

---

## Quick Commands

```bash
# Deploy
git add .
git commit -m "Add debugging tools"
git push

# Watch logs (Vercel CLI)
vercel logs --follow

# Test endpoint
curl https://your-app.vercel.app/api/test

# Test login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```
