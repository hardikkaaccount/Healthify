# Rainscare - Health & Nutrition App

A comprehensive health and nutrition tracking application with AI-powered food analysis and personalized recommendations.

## 🏗️ Architecture

This is a monorepo containing both frontend and backend applications:

- **Frontend**: React.js application with Firebase Authentication
- **Backend**: Node.js/Express.js REST API server
- **Database**: Firebase Firestore
- **AI**: Google Gemini AI for food analysis and recommendations

## 📁 Project Structure

```
rainscare/
├── client/                   # React.js frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services and utilities
│   │   ├── firebase/        # Firebase configuration
│   │   └── ...
│   ├── public/
│   └── package.json
├── backend/                  # Node.js/Express backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   └── server.js        # Main server file
│   └── package.json
├── admin/                    # Admin panel application
│   ├── src/
│   └── package.json
├── tests/                    # All test files organized
│   ├── backend-tests/       # Backend-specific tests
│   ├── test-*.js           # Main test files
│   ├── run-*test*.ps1      # Test runners
│   └── README.md           # Test documentation
├── functions/               # Firebase Cloud Functions
├── docker-compose.yml       # Docker configuration
├── package.json            # Root package.json for monorepo
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Firebase project with Firestore enabled
- Google Gemini API key (optional, for rainscare features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rainscare
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   
   # API Keys
   GEMINI_API_KEY=your-gemini-api-key
   EDAMAM_APP_ID=your-edamam-app-id
   EDAMAM_APP_KEY=your-edamam-app-key
   SPOONACULAR_API_KEY=your-spoonacular-api-key
   ```

   **Frontend** (`frontend/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   
   # Firebase Client SDK
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start them separately
   npm run dev:backend    # Backend on http://localhost:5000
   npm run dev:frontend   # Frontend on http://localhost:3000
   ```

## 🔧 Development

### Available Scripts

**Root level:**
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run install:all` - Install dependencies for all packages
- `npm run clean` - Remove all node_modules directories

**Backend:**
- `npm run dev:backend` - Start backend development server
- `npm run start:backend` - Start backend production server

**Frontend:**
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production

### API Documentation

The backend API provides the following endpoints:

#### Authentication
- `POST /api/auth/verify-token` - Verify Firebase ID token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Food & Nutrition
- `GET /api/food/search` - Search food database
- `GET /api/food/nutrition/:foodId` - Get nutrition information
- `POST /api/food/diary` - Add food diary entry
- `GET /api/food/diary` - Get food diary entries
- `GET /api/food/analytics` - Get nutrition analytics

#### Recipes
- `GET /api/recipes/search` - Search recipes by ingredients
- `GET /api/recipes/:recipeId` - Get recipe details
- `POST /api/recipes/favorites` - Add recipe to favorites
- `GET /api/recipes/favorites/list` - Get favorite recipes

#### Health Metrics
- `POST /api/health/metrics` - Save health metrics
- `GET /api/health/metrics` - Get health metrics
- `POST /api/health/goals` - Set health goals
- `GET /api/health/progress` - Get progress analysis

#### Healthify Features
- `POST /api/rainscare/analyze-food-image` - Analyze food from image
- `POST /api/rainscare/analyze-food-name` - Analyze food by name
- `POST /api/rainscare/generate-recipe` - Generate rainscare recipe
- `POST /api/rainscare/chat` - Chat with rainscare nutritionist

#### User Management
- `GET /api/user/profile` - Get extended user profile
- `GET /api/user/activity` - Get user activity summary
- `GET /api/user/export` - Export user data

## 🔐 Authentication

The app uses Firebase Authentication for user management:

1. **Frontend**: Firebase Client SDK handles user authentication
2. **Backend**: Firebase Admin SDK verifies ID tokens
3. **API Security**: All protected routes require valid Firebase ID token

## 🗄️ Database Schema

### Firestore Collections

- `users` - User profiles and settings
- `foodDiary` - Food diary entries
- `healthMetrics` - Health measurements and metrics
- `favoriteRecipes` - User's favorite recipes
- `sharedRecipes` - Community shared recipes
- `userGoals` - User's health and nutrition goals
- `userPreferences` - User preferences and settings

## 🤖 Healthify Features

The app integrates with Google Gemini Healthify for:

- **Food Image Analysis**: Analyze nutrition from food photos
- **Recipe Generation**: Create healthy recipes from ingredients
- **Nutrition Advice**: Personalized nutrition recommendations
- **Meal Planning**: Healthify-generated meal plans
- **Health Coaching**: Interactive nutrition chatbot

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Build and Start**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy** the `build` folder to your hosting service

### Recommended Hosting

- **Backend**: Railway, Render, or Google Cloud Run
- **Frontend**: Vercel, Netlify, or Firebase Hosting
- **Database**: Firebase Firestore (already configured)

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore database
3. Enable Authentication (Email/Password)
4. Generate service account key for backend
5. Get web app config for frontend

### API Keys Setup

- **Gemini AI**: Get API key from Google AI Studio
- **Edamam**: Register for food database API
- **Spoonacular**: Register for recipe API

## 📱 Features

### Core Features
- ✅ User authentication and profiles
- ✅ Food diary and nutrition tracking
- ✅ Health metrics monitoring
- ✅ Recipe search and favorites
- ✅ Healthify-powered food analysis
- ✅ Personalized recommendations
- ✅ Progress tracking and analytics

### Healthify-Powered Features
- 🤖 Food image recognition and analysis
- 🤖 Personalized recipe generation
- 🤖 Nutrition advice chatbot
- 🤖 Meal planning assistance
- 🤖 Health condition-specific recommendations

### Community Features
- 👥 Recipe sharing
- 👥 Community recipes
- 👥 User activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Migration from Previous Version

If you're migrating from the previous single-app structure:

1. **Environment Variables**: Update your `.env` files according to the new structure
2. **API Calls**: Frontend now calls the backend API instead of direct Firebase/external APIs
3. **Authentication**: Authentication flow remains the same but tokens are now verified by the backend
4. **Data**: All existing Firestore data remains compatible

---

**Happy Coding! 🚀**