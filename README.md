# Podcast Management Platform

A full-stack web application for podcast management with AI-powered features, built with React.js frontend and Express.js + MongoDB backend.

## 🚀 Features

### Authentication System
- **JWT-based authentication** with secure token management
- **Beautiful split-screen login/register** design matching Ques.AI branding
- **Form validation** with real-time error feedback
- **Protected routes** with automatic redirects

### Project Management
- **Create and manage podcast projects**
- **Episode management** with transcript support
- **User-specific data isolation**
- **Real-time project statistics**

### Modern UI/UX
- **Responsive design** for desktop and mobile
- **Purple gradient theme** matching Ques.AI brand
- **Smooth animations** and transitions
- **Clean, modern interface**

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **CSS Grid/Flexbox** - Layout system

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## 📁 Project Structure


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vinay02022/project_skail
   cd ProjectAD98
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://vinay_123:vinay_123@project.exuhvf5.mongodb.net/?retryWrites=true&w=majority&appName=project
   JWT_SECRET=a5feffc70e32c627a1a3131b062ade533abe4ed9449ecf8a7bacb4d8bbd87d0406b72d64021176682466014c9618fca483f99872a309b57c09b5bd3e33375c44
   JWT_EXPIRES_IN=7d
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/projects` - Get user's projects (protected)
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/:id/episodes` - Get project episodes (protected)

### Episodes
- `POST /api/episodes` - Create new episode (protected)
- `PUT /api/episodes/:id` - Update episode (protected)


### Project Model
```javascript
{
  name: String (required, max: 100)
  userId: ObjectId (ref: User)
  episodeCount: Number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

### Episode Model
```javascript
{
  name: String (required, max: 200)
  transcript: String (required)
  projectId: ObjectId (ref: Project)
  createdAt: Date
  updatedAt: Date
}
```


---

**Built with ❤️ for Ques.AI** #   p r o j e c t _ s k a i l 
 
 
