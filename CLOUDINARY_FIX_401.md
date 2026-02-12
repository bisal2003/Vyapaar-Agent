# Fix Cloudinary 401 Unauthorized Errors

## The Issue
Files are uploading successfully but returning **401 Unauthorized** when trying to view or download them.

## Root Cause
Your Cloudinary account has **Strict Transformations** or **Restricted Media** enabled, which blocks public access to uploaded files.

## Solution: Update Cloudinary Settings

### Option 1: Disable Strict Transformations (Recommended)

1. Go to **Cloudinary Dashboard**: https://cloudinary.com/console
2. Click **Settings** (gear icon) in the top right
3. Go to **Security** tab
4. Find **Strict Transformations**
5. **UNCHECK** "Enable strict transformations"
6. Click **Save**

### Option 2: Enable Public Read Access

1. Go to **Cloudinary Dashboard**: https://cloudinary.com/console
2. Click **Settings** → **Upload**
3. Under **Upload presets**, click **Add upload preset** or edit **ml_default**
4. Set:
   - **Signing Mode**: Unsigned
   - **Access Mode**: Public
   - **Delivery Type**: Upload
5. Click **Save**

### Option 3: Update Media Library Settings

1. Go to **Cloudinary Dashboard**: https://cloudinary.com/console
2. Click **Settings** → **Security**
3. Under **Allowed fetch domains**, add: `*` (or your specific domain)
4. Under **Delivery URL**, ensure **Secure URLs** is checked
5. **UNCHECK** "Restrict media delivery to authenticated users"
6. Click **Save**

## Quick Test After Fixing

1. Restart your backend server
2. Upload a **NEW** file (old files will still be private)
3. Try to view/download it
4. Should work now! ✅

## If Still Not Working

Your account might be on a plan that requires authentication. In that case:

### Use Signed URLs (Alternative Solution)

We can generate signed URLs that authenticate automatically. This requires code changes but works with any Cloudinary plan.

**Let me know if you need this implementation!**

## Verification

After making changes in Cloudinary:
1. Upload a test file
2. Copy the URL from the console log
3. Paste in browser
4. Should load immediately (not 401)

---

**Most Common Fix**: Disable "Strict Transformations" in Settings → Security
