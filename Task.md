/*

🧑‍💻 Feature Expansion Prompt for Copilot
📛 App Name: DevBro

🛑 IMPORTANT: Do NOT modify or remove any core logic or existing functionality already working from the assignment.
Only add or extend features mentioned below. Maintain all established socket connections, state, and rendering.

🎯 ADD/EXTEND FEATURES:

1. 🌍 GLOBAL CHATROOM:
- Replace the default "general" room with a channel called "Global Brozone"
- Users should automatically join this chatroom on login

2. 🧵 TOPIC CHANNELS:
- Add the following chat rooms accessible via dropdown or sidebar:
  - #frontend-bros
  - #backend-bros
  - #bug-hunters
  - #help-im-dying

3. 💬 PRIVATE MESSAGES:
- When a new private chat is started each day, the first message sent should automatically be "Bro"
- Append date-check to enforce "new day" rule

4. ⌨️ TYPING INDICATOR:
- Change typing status to: "Bro is typing…"

5. 🔘 BRO MODE:
- Add a toggle for “Bro Mode”
- When enabled, disable the normal message input
- Show a large “BRO” button instead
- Clicking sends "Bro" with optional mood emojis like:
  - “Bro. 😩”
  - “BRO! 🔥”
  - “brooo... 😭”

6. 🧑 AVATAR:
- Add avatar per user using the **first letter of their username**
- Display beside their messages in all chats

-------------------
🎒 ADVANCED FEATURES:

7. 🔐 PRIVATE DMs:
- When a user clicks another user's name, open a private room (socket.io room with both user IDs)

8. 🛋 MULTIPLE CHATROOMS:
- Use Socket.io rooms
- Support multiple public chatrooms (dropdown or sidebar list)

9. ✅ READ RECEIPTS:
- ✔️ = message delivered
- ✔✔️ = message seen
- Use socket events and user active status to toggle between them

10. 📎 FILE / IMAGE SHARING:
- Enable `input type="file"`
- Send file as Base64 via socket
- Allow `.js`, `.py`, `.json`, images, and display inline when possible

11. 😀 MESSAGE REACTIONS:
- Add emoji picker per message
- Emit emoji reaction via socket
- Display reactions inline below the message

-------------------
🔔 REAL-TIME NOTIFICATIONS:

12. 📢 NOTIFY ON EVENTS:
- When user receives a message → play sound
- Use **Web Notification API** to show desktop popup
- Show “User XYZ has joined/left the chatroom” in status feed
- Show unread message count in tab title (like: (3) DevBro)

-------------------
⚙️ PERFORMANCE & UX UPGRADES:

13. 📜 PAGINATION:
- Load only the last 20 messages on scroll-down
- Load more on scroll-up (infinite scroll logic)

14. 🔁 RECONNECT LOGIC:
- Handle socket reconnect on network drop or reload

15. 🔍 SEARCH:
- Allow users to search messages in memory
- Optional: add search indexing by keyword

-------------------
😎 EXTRA MESSAGING BEHAVIOR:

16. 🧠 MESSAGE OPTIONS:
- Allow users to:
  - Type normal messages
  - OR click “BRO” button to send “Bro” with mood emojis

17. 🔄 FILE UPLOAD:
- Enable upload of `.js`, `.py`, `.json`, images (via file input)
- Show previews where possible

18. 🚨 BRO SPAM CHECK:
- If a user sends too many “Bro” messages in a short time, show message: “Bro... chill.”

END PROMPT

*/
