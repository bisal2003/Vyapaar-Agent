# 💬 WhatsApp Clone - Full Stack Real-Time Chat Application

A professional, feature-rich WhatsApp clone built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time messaging, authentication, and a pixel-perfect WhatsApp Web UI.

![WhatsApp Clone](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)

## ✨ Features

### 🔐 Authentication & Security
- **Secure Authentication** - JWT-based authentication with HTTP-only cookies
- **Password Encryption** - Bcrypt password hashing
- **Protected Routes** - Middleware-based route protection

### 💬 Real-Time Messaging
- **Instant Messaging** - Real-time chat powered by Socket.io
- **Online Status** - See who's online in real-time
- **Read Receipts** - Double checkmarks for delivered messages
- **Image Sharing** - Send and receive images via Cloudinary

### 🎨 WhatsApp Web UI
- **Pixel-Perfect Design** - Authentic WhatsApp Web interface
- **Dark Theme** - Professional dark color scheme
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Smooth Animations** - Polished transitions and interactions

### 👤 User Features
- **Profile Management** - Update profile picture and view account info
- **User Search** - Search through contacts
- **Online Filter** - Filter to show only online users
- **Chat History** - Persistent message storage

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Token-based authentication
- **Cloudinary** - Image upload and storage
- **Bcrypt** - Password hashing

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Socket.io-client** - WebSocket client
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd fullstack-vibetalk
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/whatsapp-clone

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
# Backend API URL
VITE_API_URL=http://localhost:5001
```

### 4. Run the Application

**Development Mode:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Production Mode:**
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves frontend)
cd ../backend
npm start
```

Access the application at: `http://localhost:5173` (dev) or `http://localhost:5001` (production)

## 🎯 Usage

1. **Sign Up** - Create a new account with email and password
2. **Login** - Sign in to your account
3. **Update Profile** - Click on your profile picture to update it
4. **Start Chatting** - Select a user from the sidebar to start a conversation
5. **Send Messages** - Type and send text or image messages
6. **Real-Time Updates** - See online status and receive messages instantly

## 📁 Project Structure

```
fullstack-vibetalk/
├── backend/
│   ├── src/
│   │   ├── controller/        # Request handlers
│   │   ├── lib/               # Utilities (DB, Socket, Cloudinary)
│   │   ├── middleware/        # Auth middleware
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   └── index.js           # Server entry point
│   ├── .env.example           # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── lib/               # Axios & utilities
│   │   ├── pages/             # Page components
│   │   ├── store/             # Zustand stores
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── .env.example           # Environment variables template
│   └── package.json
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CLIENT_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (optional, auto-detected)

## 🚀 Deployment

### Deploy to Production

1. **Set environment variables** in your hosting platform
2. **Build frontend**: `cd frontend && npm run build`
3. **Deploy backend** with built frontend files
4. **Configure MongoDB Atlas** for production database
5. **Set up Cloudinary** for image storage

### Recommended Platforms
- **Backend**: Render, Railway, Heroku, DigitalOcean
- **Database**: MongoDB Atlas
- **Images**: Cloudinary

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@chinmoy-2004](https://github.com/chinmoy-2004)

## 🙏 Acknowledgments

- WhatsApp for the UI/UX inspiration
- Socket.io for real-time communication
- Cloudinary for image hosting
- MongoDB for the database solution

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

⭐ Star this repo if you found it helpful!
