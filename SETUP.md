# 🚀 Quick Setup Guide

## Step 1: Set Up Environment Variables

### Backend (.env)
Copy the example file and fill in your credentials:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual values:
- MongoDB URI (local or Atlas)
- JWT Secret (generate a secure random string)
- Cloudinary credentials (sign up at cloudinary.com)

### Frontend (.env) - Optional
```bash
cd frontend
cp .env.example .env
```

## Step 2: Install Dependencies

```bash
# Install all dependencies at once
npm run install:all

# OR install separately
cd backend && npm install
cd ../frontend && npm install
```

## Step 3: Start Development Servers

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 4: Access the App

Open your browser and navigate to:
```
http://localhost:5173
```

## 🎉 You're Ready!

1. Sign up with a new account
2. Update your profile picture
3. Start chatting in real-time!

## 📝 Important Notes

- Make sure MongoDB is running (if using local)
- Port 5001 and 5173 should be available
- For production, build the app: `npm run build`

## 🔧 Troubleshooting

**Port already in use?**
- Change PORT in backend/.env
- Update VITE_API_URL in frontend if needed

**MongoDB connection error?**
- Check your MONGODB_URI is correct
- Ensure MongoDB service is running
- Verify network connection for Atlas

**Images not uploading?**
- Verify Cloudinary credentials
- Check CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET

## 📞 Need Help?

Check the main README.md for detailed documentation or open an issue on GitHub.
