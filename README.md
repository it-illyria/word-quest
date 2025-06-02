# 🧠 WordQuest - Vocabulary Quiz App

**WordQuest** is a React-based vocabulary quiz application that helps users improve their word knowledge through engaging solo and real-time battle modes. It features a smooth UI with animations, live performance tracking, and a responsive design.

---

## 🚀 Features

- 🎮 **Solo & Battle Modes**: Practice on your own or compete with others in real-time.
- ✨ **Smooth Animations**: Framer Motion-enhanced transitions for an interactive experience.
- 📊 **Results Tracking**: View past quiz scores and performance stats.
- 📈 **Performance Analysis**: Get insights into your strengths and weaknesses.
- 🔥 **Streak System**: Keep your learning streak alive!
- 💡 **Responsive UI**: Fully functional across desktops and mobile devices.

---

## 🛠️ Technologies Used

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Socket.IO (for multiplayer)
- LocalStorage (for saving results)

---

## 📦 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/it-illyria/word-quest.git
cd word-quest
```

2. **Install dependencies:**
``` bash
 npm install
```

3. **Start the development server:**
```bash
 npm run start
```
>The app will be available at http://localhost:3000 (or whatever React outputs).
---
## 🔧 Folder Structure

```json
"src/"
├── components/        # UI components like Quiz, QuestionCard, ResultPanel
├   ├── animations/
├   ├   ├──index.ts
├   ├   ├──MotionCombined.tsx
├   ├   ├──MotionFade.tsx
├   ├   ├──MotionScale.tsx
├   ├── BattleLobby.tsx
├   ├── MistakeAnalysis.tsx
├   ├── QuestionCard.tsx
├   ├── Quiz.tsx
├   ├── Result.tsx
├   ├── StreakCounter.tsx
├   ├── CategorySelection.tsx
├   ├── Difficulty.tsx
├   ├── HomePage.tsx
├   ├── Welcome.tsx
├   ├── TicTacToe.tsx
├   ├── Badges.tsx
├   ├── Progress.tsx
├   ├── Dashboard.tsx
├── data/        # Fake Backend
├   ├── questions.json
├── Services/        # Project Services
├   ├── animations.ts
├   ├── mockApi.ts
├   ├── mockSocket.ts
├   ├── quiz-service.ts
├   ├── type.ts
├── assets/            # Static assets like images, icons
├── .env.development/            # Environmnet config
├── App.js            # Root component
└── index.js           # Entry point
└── index.css           # Styling of the project
├── utils/        # Project Utils
├   ├── categories.ts
```
---
## ✅ Todo / Improvements
- [ ] Add user authentication
- [ ] Deploy to production
- [ ] Add sound effects
- [ ] Leaderboards for battle mode
- [ ] Expand a vocabulary set

---
## 👤 Author

Made with ❤️ by **Simi Lika**
---
## 📄 License
This project is licensed under the MIT License.
```yaml
---
Would you like me to create a version that includes badges (like GitHub stars, license, etc.) or deployment instructions for Vercel/Netlify?
```