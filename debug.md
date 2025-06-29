/*

🧪 Final QA & Debugging Prompt: DevBro Week 5 Assignment

⚠️ IMPORTANT:
The core features of the chat app are already implemented — DO NOT remove or refactor them.
Only fix bugs, connect disconnected parts, and ensure everything functions correctly.

🔍 OBJECTIVE:
Go through the entire React + Socket.io chat application and ensure every feature is fully connected and working on both client and server.

🧠 CHECKLIST OF WHAT TO FIX / VERIFY:

===================
🛠️ Project Setup
- Confirm Socket.io server is running properly
- Confirm React frontend connects to the server via socket
- Ensure ports match and server auto-restarts with changes

===================
💬 Core Chat Functionality
- Users can enter a username and get authenticated (no JWT required unless already added)
- All users auto-join a **global chatroom** (e.g. "Global Brozone")
- Messages are sent + received instantly
- Messages show:
  - Username
  - Timestamp
- "Bro is typing…" indicator works in global + private chats
- Online/offline status updates correctly on connect/disconnect

===================
👥 Advanced Chat Features
- Private messages work between any 2 users (check room logic + socket events)
- Topic channels exist and switching between them updates the active room
- File/image sharing works:
  - Upload button functional
  - Images show in chat
- Read receipts show correctly:
  - ✔ = delivered
  - ✔✔ = seen
- Emoji reactions on messages work

===================
🔔 Real-Time Notifications
- Notification sound plays on new message
- Web Notification API works (check permissions + fallback)
- Join/leave messages show correctly
- Tab title updates with unread message count (e.g. `(3) DevBro`)

===================
⚙️ UX & Performance
- Pagination works:
  - Only last 20 messages load initially
  - Scroll up loads older messages
- Reconnection logic is working
- Message search is functional
- Mobile responsiveness looks good
- No major crashes, infinite loops, or broken state issues

===================
😎 Custom Logic
- “Bro Mode” toggle disables typing, shows only BRO button
- “Bro” messages can be sent with mood emojis (🔥 😭 😩 etc.)
- Auto “Bro” message sent on new private chat per day
- Typing indicator uses custom message: “Bro is typing…”
- User avatar shows first letter of username
- Spam protection: If too many “Bro”s sent, show “Bro... chill.”

===================
✅ Final Cleanup
- No broken UI elements
- All Socket.io events emit/listen correctly on both ends
- All features in assignment are working, visible, and testable
- Code has basic error handling (console logs or toast)
- Loading states are handled (e.g. when switching rooms or fetching messages)

END PROMPT

*/
