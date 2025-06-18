[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19800769&assignment_repo_type=AssignmentRepo)
# Real-Time Chat Application with Socket.io

## Project Overview
This is a real-time chat application built with Socket.io, React, and Node.js that demonstrates bidirectional communication between clients and server.

## Features Implemented

### Core Chat Functionality
- User authentication (username-based)
- Global chat room for all users
- Private messaging between users
- Display messages with sender's name and timestamp
- Show typing indicators when a user is composing a message
- Online/offline status for users

### Advanced Chat Features
- Multiple chat rooms/channels with join/leave functionality
- "User is typing" indicator
- Message reactions (like, love, smile, celebrate)
- Read receipts for messages
- Room-based conversations
- File and image sharing
- Message search functionality
- Message pagination for loading older messages

### Real-Time Notifications
- Browser notifications for new messages
- Sound notifications for new messages
- In-app notifications
- Notify when users join or leave chat rooms

### UX Optimization
- Responsive design
- Automatic scrolling to latest messages
- Connection status indicators
- User-friendly interface

## Setup Instructions

1. Clone the repository:
```
git clone https://github.com/PLP-MERN-Stack-Development/week-5-web-sockets-assignment-AlphaC137.git
```

2. Install server dependencies:
```
cd server
npm install
```

3. Install client dependencies:
```
cd client
npm install
```

4. Start the server:
```
cd server
npm run dev
```

5. Start the client:
```
cd client
npm run dev
```

6. Access the application at: http://localhost:5173

## Technologies Used
- **Frontend**: React, Socket.io-client, React Router, date-fns
- **Backend**: Node.js, Express, Socket.io
- **Development**: Vite (for React app)

## Implementation Details

### Socket.io Server
The server handles various socket events including:
- User connections/disconnections
- Message sending/receiving
- Private messaging
- Typing indicators
- Room management
- Message reactions
- Read receipts

### React Client
The client provides a user interface for:
- User authentication
- Message display and composition
- User list with online status
- Room selection and management
- Message reactions
- Notifications

## Screenshots

![Login Screen](./screenshots/login-screen.png)
*Login screen with username authentication**

![Chat Interface](./screenshots/chat-interface.png)
*Main chat interface showing messages, user list, and rooms*

![Private Messaging](./screenshots/private-messaging.png)
*Private messaging between users*

![Message Reactions](./screenshots/message-reactions.png)
*Message reactions feature with emoji options*

![Notifications](./screenshots/notifications.png)
*Real-time notifications when receiving new messages*

**Note to submit:** Please take screenshots of each of these features and save them in the screenshots folder with the filenames mentioned above.

## Future Improvements
- Enhanced user authentication with JWT
- Advanced search filters with date ranges and message types
- Message pagination for loading older messages
- File and image sharing
- User profiles with avatars
- Mobile app using React Native

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
