# BroZ Real-Time Chat Application

A feature-rich real-time chat application built with Socket.io, React, Express.js, and MongoDB. This application demonstrates modern web development practices with real-time bidirectional communication, JWT authentication, and an intuitive user interface.

## Features

### Core Features
- **Real-time Messaging**: Instant message delivery using Socket.io
- **User Authentication**: Secure JWT-based login and registration
- **Multiple Chat Rooms**: Join different themed chat rooms (General, Random, Tech Talk)
- **Private Messaging**: Direct messages between users
- **Online Presence**: See who's currently online
- **Typing Indicators**: See when someone is typing

### Advanced Features
- **Bro Mode**: Transform messages with fun "bro" language 
- **File Upload**: Share images and files with 5MB size limit and preview
- **Delivery/Read Receipts**: Message status indicators (sent/delivered/read)
- **Browser Notifications**: Desktop notifications for new messages
- **Sound Notifications**: Audio alerts for incoming messages
- **Unread Count**: Tab title shows unread message count
- **Daily "Bro" Greetings**: Automatic daily greetings in private chats
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **Socket.io Client**: Real-time communication
- **React Router**: Client-side routing
- **Axios**: HTTP requests
- **CSS3**: Modern styling with Flexbox/Grid

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **Socket.io**: Real-time bidirectional communication
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone Repository
```bash
git clone https://github.com/PLP-MERN-Stack-Development/week-5-web-sockets-assignment-AlphaC137
cd week-5-web-sockets-assignment-AlphaC137
```

### 2. Server Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URL and JWT secret
```

**Server Environment Variables (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/broz-chat
JWT_SECRET=your-secret-jwt-key
NODE_ENV=development
```

### 3. Client Setup
```bash
cd client
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL
```

**Client Environment Variables (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
Make sure MongoDB is running locally or update the `MONGODB_URI` in the server's `.env` file to point to your MongoDB instance.

### 5. Start the Application
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

The application will be available at:
- **Client**: http://localhost:5173
- **Server**: http://localhost:5000

## Usage

### Getting Started
1. **Register**: Create a new account or login with existing credentials
2. **Join Rooms**: Select from General, Random, or Tech Talk rooms
3. **Chat**: Send messages, files, and interact with other users
4. **Private Messages**: Click on any online user to start a private conversation
5. **Bro Mode**: Toggle the 😎 Bro Mode for fun message transformations

### Key Features Guide

#### File Sharing
- Click the attachment button
- Select any file (max 5MB)
- Images show instant preview
- Files can be downloaded by recipients

#### Bro Mode 😎
- Transforms regular messages into "bro-friendly" language
- Automatically activated for private chats with daily "Bro" greetings
- Toggle on/off in any chat room

#### Notifications
- Browser notifications for new messages (when tab is not visible)
- Sound notifications (can be toggled)
- Unread count in browser tab title

## Project Structure

```
week-5-web-sockets-assignment-AlphaC137/
├── server/
│   ├── config/, models/, routes/, middleware/, socket/
│   ├── server.js
│   └── .env
├── client/
│   ├── src/
│   │   ├── pages/, components/, context/, socket/, utils/
│   │   └── main.jsx
│   └── .env
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Messages
- `GET /api/messages` - Get room messages
- `GET /api/messages/private/:userId` - Get private messages
- `PUT /api/messages/:messageId/read` - Mark message as read
- `PUT /api/messages/:messageId/react` - React to message

### Users
- `GET /api/users` - Get all users
- `GET /api/users/online` - Get online users
- `PUT /api/users/profile` - Update user profile

## Socket.io Events

### Client → Server
- `join_room` - Join a chat room
- `chat message` - Send room message
- `private_message` - Send private message
- `send_file` - Upload file to room
- `private_file` - Send file privately
- `typing` - Typing indicator
- `mark_delivered` - Mark message as delivered
- `mark_seen` - Mark message as read

### Server → Client
- `receive_message` - New room message
- `private_message` - New private message
- `user_list` - Updated online users
- `user_joined` - User joined notification
- `user_left` - User left notification
- `typing_users` - Typing indicators
- `auto_delivery_confirm` - Auto delivery confirmation
- `message_delivery_update` - Delivery status update
- `message_read_update` - Read status update

## Screenshots

### Main Chat Interface
![Chat Interface](./docs/screenshots/chat-interface.png)

### Private Messaging
![Private Messages](./docs/screenshots/private-messages.png)

### Bro Mode
![Bro Mode](./docs/screenshots/bro-mode.png)

### File Sharing
![File Upload](./docs/screenshots/file-upload.png)

## Authors

- **Sydwell Lebeloane** - *Initial work* - [YourGitHub](https://github.com/alphac137)

## Acknowledgments

- Socket.io team for excellent real-time communication library
- React team for the amazing frontend framework
- MongoDB for flexible document database
- All the open-source contributors who made this project possible