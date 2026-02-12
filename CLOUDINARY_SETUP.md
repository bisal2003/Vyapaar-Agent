# 🌤️ Cloudinary Setup Guide (5 Minutes)

## Why You Need This
Cloudinary is a FREE cloud service that stores your images and files. The placeholder credentials in your `.env` file won't work - you need real ones.

## 📝 Quick Setup Steps

### 1. Create Free Cloudinary Account
1. Go to: **https://cloudinary.com/users/register_free**
2. Sign up (completely FREE - no credit card required)
3. Verify your email

### 2. Get Your Credentials
1. After login, you'll see your **Dashboard**
2. Look for the **Account Details** section
3. You'll see three important values:
   - **Cloud Name** (e.g., `dxxxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvw`)

### 3. Update Your .env File
1. Open: `backend/.env`
2. Replace the placeholder values:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=Abc123Xyz456Def789Ghi012
```

### 4. Restart Your Backend Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
cd backend
npm run dev
```

## ✅ Test It
1. Go to your app: `http://localhost:5173`
2. Login
3. Try sending an image or file
4. It should work now! 🎉

## 🆓 Free Tier Limits
- **25 GB storage**
- **25 GB bandwidth/month**
- **Unlimited transformations**
- Perfect for development and small projects!

## 🔒 Security Note
- Never commit your `.env` file to Git
- The `.gitignore` already excludes it
- Keep your API Secret private

## 📸 What Gets Stored
- User profile pictures
- Chat images
- Shared files (PDFs, documents, videos)
- Everything is automatically optimized and delivered via CDN

---

**Need Help?** Check Cloudinary docs: https://cloudinary.com/documentation
