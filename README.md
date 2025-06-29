# 🔄 Real-Time Chat Application with Socket.io

[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19800769&assignment_repo_type=AssignmentRepo)

A fully-featured real-time chat application built with Socket.io, React, and Express.js that demonstrates bidirectional communication between clients and server.

## 🚀 Features

### ✅ Core Functionality (Task 1 & 2)
- **Real-time messaging** with Socket.io
- **User authentication** (username-based)
- **Global Brozone** - default chat room for all users
- **Topic-specific channels** (#frontend-bros, #backend-bros, #bug-hunters, #help-im-dying)
- **Online/offline status** indicators
- **Message timestamps** and sender information
- **Typing indicators** when users are composing messages

### ✅ Advanced Chat Features (Task 3)
- **Private messaging** between users
- **Multiple chat rooms/channels** with room creation
- **File and image sharing** (up to 5MB)
- **Message reactions** (👍, ❤️, 😂, etc.) with emoji picker
- **Read receipts** for message delivery confirmation
- **User-friendly UI** with modern design

### ✅ Real-Time Notifications (Task 4)
- **New message notifications** with sound alerts
- **Join/leave room notifications** with user status updates
- **Unread message count** badges on rooms and users
- **Browser notifications** using Web Notifications API
- **Customizable notification settings** (sound/browser)

### ✅ Performance & UX Optimization (Task 5)
- **Message search functionality** with real-time filtering
- **Automatic reconnection logic** for handling disconnections
- **Responsive design** that works on desktop and mobile
- **File upload progress indicators**
- **Optimized Socket.io** with rooms and namespaces
- **Message delivery acknowledgment**
- **Mobile-friendly sidebar** with overlay navigation

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications
- **Emoji Picker React** - Emoji support
- **Date-fns** - Date formatting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **Multer** - File upload handling
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ChatArea.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── PrivateChat.jsx
│   │   │   ├── SearchMessages.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/        # React Context
│   │   │   └── ChatContext.jsx
│   │   ├── socket/         # Socket.io client
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── server/                 # Express backend
    ├── uploads/            # File upload directory
    ├── server.js          # Main server file
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd week-5-web-sockets-assignment
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the server** (in the server directory)
   ```bash
   npm run dev
   # Server will run on http://localhost:8000
   ```

2. **Start the client** (in the client directory, new terminal)
   ```bash
   npm run dev
   # Client will run on http://localhost:3000
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## 🎯 How to Use

### Getting Started
1. Enter a username to join the chat
2. You'll automatically join the "Global Brozone" room
3. Start sending messages and see them appear in real-time

### Chat Features
- **Send Messages**: Type in the input field and press Enter
- **Upload Files**: Click the paperclip icon to upload images or documents
- **Add Reactions**: Hover over messages and click the smile icon
- **Search Messages**: Click the search icon to filter messages
- **Private Chat**: Click on any online user to start a private conversation
- **Create Rooms**: Click the + button in the rooms section

### Settings
- Toggle sound notifications on/off
- Enable/disable browser notifications
- Customize your chat experience

## 📱 Mobile Support

The application is fully responsive and works great on mobile devices:
- Collapsible sidebar with hamburger menu
- Touch-friendly interface
- Optimized message layout for small screens
- Mobile keyboard support

## 🔧 API Endpoints

### Socket Events

#### Client → Server
- `user join` - Join chat with user info
- `message` - Send a message to a room
- `private message` - Send a private message
- `typing` - Indicate user is typing
- `stop typing` - Stop typing indicator
- `create room` - Create a new chat room
- `join room` - Join an existing room
- `message reaction` - Add/remove message reaction
- `mark messages read` - Mark messages as read
- `get conversation history` - Get private chat history
- `get rooms` - Get available rooms list

#### Server → Client
- `user authenticated` - User login confirmation
- `room joined` - Successfully joined a room
- `new message` - New message received
- `new private message` - New private message
- `users online` - Online users list update
- `user typing` - User typing notification
- `user stopped typing` - Stop typing notification
- `message reaction updated` - Reaction update
- `unread count updated` - Unread message count

### HTTP Endpoints
- `POST /upload` - File upload endpoint (max 5MB)

## 🧪 Features Demonstrated

### Task 1: Project Setup ✅
- [x] Node.js server with Express
- [x] Socket.io server configuration
- [x] React front-end application
- [x] Socket.io client setup
- [x] Client-server connection

### Task 2: Core Chat Functionality ✅
- [x] Username-based authentication
- [x] Global Brozone
- [x] Topic channels (#frontend-bros, #backend-bros, #bug-hunters, #help-im-dying)
- [x] Messages with sender name and timestamp
- [x] Typing indicators
- [x] Online/offline status

### Task 3: Advanced Chat Features ✅
- [x] Private messaging
- [x] Multiple chat rooms
- [x] "User is typing" indicator
- [x] File and image sharing
- [x] Read receipts
- [x] Message reactions

### Task 4: Real-Time Notifications ✅
- [x] New message notifications
- [x] Join/leave notifications
- [x] Unread message count
- [x] Sound notifications
- [x] Browser notifications

### Task 5: Performance & UX Optimization ✅
- [x] Message search functionality
- [x] Reconnection logic
- [x] Socket.io optimization (rooms)
- [x] Message delivery acknowledgment
- [x] Responsive design

## 🎨 Screenshots

*Add screenshots of your application here*

## 🚢 Deployment

### Deploying the Server
The server can be deployed to platforms like:
- **Render**: `https://render.com`
- **Railway**: `https://railway.app`
- **Heroku**: `https://heroku.com`

### Deploying the Client
The client can be deployed to:
- **Vercel**: `https://vercel.com`
- **Netlify**: `https://netlify.com`
- **GitHub Pages**: For static builds

### Environment Variables
Update the `SERVER_URL` in `client/src/socket/socket.js` to point to your deployed server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📚 Documentation References

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for real-time communication**
