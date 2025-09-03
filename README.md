# i-Instructor - 24/7 Peer Learning Platform

A modern peer-to-peer learning platform that connects students with qualified instructors for instant academic support.

## Features

### Authentication & Security
- **Firebase Authentication** with Google Sign-in
- Email/password authentication with secure password reset
- Real-time user status tracking
- Profile management with avatar support
- Email verification and account security

### Core Platform Features
- **Instant Help**: Get connected with instructors in 2 minutes
- **Multiple Subjects**: Mathematics, Computer Science, Physics, Chemistry, Biology, English, and more
- **Flexible Pricing**: Pay-as-you-go or monthly subscription plans
- **Real-time Communication**: Text, audio, and video chat with shared whiteboard
- **Knowledge Base**: Community-driven solutions and guides
- **Session Management**: Schedule, track, and review learning sessions

### User Roles
- **Learners**: Get instant help, schedule sessions, access knowledge base
- **Instructors**: Teach students, manage sessions, track earnings

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with responsive design
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password and Google providers
   - Enable Firestore Database
   - Update `src/config/firebase.ts` with your Firebase configuration

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Firebase Setup

### Authentication Setup
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Email/Password provider
3. Enable Google provider and configure OAuth consent screen
4. Add your domain to authorized domains

### Firestore Database Setup
1. Create a Firestore database in production mode
2. Set up the following collections:
   - `users` - User profiles and preferences
   - `sessions` - Learning session data
   - `knowledge` - Community knowledge base items

### Security Rules
Configure Firestore security rules to ensure data privacy and security.

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   ├── dashboard/       # User dashboards
│   ├── landing/         # Landing page sections
│   └── knowledge/       # Knowledge base components
├── contexts/            # React contexts
├── config/              # Configuration files
├── types/               # TypeScript type definitions
└── main.tsx            # Application entry point
```

## Key Features Implementation

### Real-time Authentication
- Automatic session management with Firebase Auth
- Google OAuth integration for seamless sign-in
- Profile synchronization between Firebase Auth and Firestore

### User Experience
- Responsive design for all device sizes
- Intuitive navigation and user flows
- Real-time status indicators
- Progressive web app capabilities

### Security & Privacy
- Row-level security with Firestore rules
- Secure authentication flows
- Data encryption in transit and at rest
- Privacy-focused user data handling

## Contributing

This platform is designed to help students across Bangladesh and globally access quality education support. Contributions are welcome to improve the learning experience for all users.

## License

This project is built for educational purposes and community benefit.