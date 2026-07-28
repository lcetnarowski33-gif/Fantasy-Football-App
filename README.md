# 🏈 Fantasy League Analytics

A professional, high-performance Fantasy Football Analytics web application combining the best elements of **ESPN, Sleeper, and Pro Football Focus (PFF)** software. Built with modern dark-mode aesthetics, responsive component architecture, interactive Chart.js visualizations, modular Node.js Express backend, relational SQL database readiness, and an **Instant Real-Time ESPN Fantasy API Sync Engine**.

---

## 🌟 Key Features

### 1. 🏠 Home Dashboard
- **League Standings & Power Rankings**
- **Live Scores & Matchup Highlights**
- **Playoff Picture & Division Breakdown**
- **Weekly Awards & High Score Highlights**
- **Real-Time Score & Transaction Ticker**

### 2. 📊 League Page
- Comprehensive 10-Team Manager Table
- Win/Loss Record, Points For (PF), Points Against (PA)
- **Max PF** (Best Possible Scoring Output) & Bench Points
- **Luck Rating** (Calculated schedule variance vs expected wins)
- **Elo Ratings** & Strength of Schedule (SOS)
- **Playoff & Championship Odds %**

### 3. 🛡️ Team Page
- Roster & Bench breakdown
- Advanced PFF Manager Metrics (Optimal Lineup %, Manager Efficiency, Boom/Bust %, Ceiling/Floor bounds)
- Positional Strength Radar Profiles

### 4. 👤 Player Page & PFF Analytics
- Photo, Position, NFL Team, Bye Week, Status
- **Fantasy Points Over Expectation (FPOE)**
- **Target Share %, Snap Share %, Red Zone Touches**
- Rest of Season (ROS) Projections & Matchup Grades

### 5. 📈 Interactive Analytics Hub
- Playoff Probability Bar Charts
- Scoring Trend & Rolling Average Line Charts
- Positional Scoring Radar Profiles

### 6. 🤼 Head-to-Head Manager Rivalry
- Compare any 2 managers side-by-side
- All-Time Win/Loss Records, PPG, Elo ratings
- Rivalry matchup simulator

### 7. 🏆 League Records & Hall of Fame
- All-Time Highest & Lowest Weekly Scores
- Longest Winning & Losing Streaks
- Championship History & Draft Steals

### 8. 🔄 Trade Center & Analyzer
- Interactive 2-Side Trade Calculator
- PFF-Style Trade Grades (A+ to F)
- Trade History Log & League Veto Tracker

### 9. 📋 Draft Center
- Interactive Draft Matrix Board
- Steal & Reach Detector Badges (+/- Rounds Value)
- ADP (Average Draft Position) Comparison & Keeper Locks

### 10. ⚔️ Live Matchup Center
- Real-time Win Probability Gauge
- Weather & Stadium Impact Alerts
- Injury Status Tracker

---

## ⚡ ESPN Fantasy API Live Sync

This application features an automated, real-time proxy for the official ESPN Fantasy API v3.

### How to Connect your ESPN League:
1. Click the **"Connect ESPN League"** pill button in the top navigation bar.
2. Enter your **ESPN League ID** (found in your ESPN league URL: `.../leagues/123456789`).
3. Select the **Season Year** (e.g. `2024` or `2025`).
4. **For Private Leagues**:
   - Open ESPN in Chrome -> Press F12 -> Go to Application / Storage -> Cookies -> `espn.com`.
   - Copy your `SWID` cookie (e.g. `{12345678-ABCD-EF12-3456-7890ABCDEF12}`).
   - Copy your `espn_s2` cookie string.
5. Click **"Sync ESPN Data Now"**.
6. The entire application (Standings, Matchups, Team Rosters, Analytics) will **update instantly and automatically**!

---

## 📁 Directory Structure & Architecture

```
Fantasy Football App/
├── package.json                   # Node.js dependencies & scripts
├── server.js                      # Express backend, API routes & SSE instant update stream
├── schema.sql                     # Relational SQL Database Schema (PostgreSQL/SQLite)
├── README.md                      # Project documentation
├── index.html                     # Application HTML shell & CDN imports
└── src/
    ├── backend/
    │   └── services/
    │       └── espnAdapter.js     # ESPN API v3 fetcher & normalizer
    ├── css/
    │   ├── main.css               # Dark theme variables, glassmorphism reset
    │   ├── components.css         # Navbar, header, ticker, modal dialog styles
    │   └── pages.css              # View layouts, tables, trade matrix, draft grid
    └── js/
        ├── app.js                 # SPA main entrypoint
        ├── store.js               # Reactive state manager
        ├── data/
        │   └── mockData.js        # Comprehensive fantasy mock dataset
        ├── components/
        │   ├── Header.js          # Navigation bar component
        │   ├── Ticker.js          # Live scores ticker
        │   ├── SearchModal.js     # Global search modal (Cmd+K)
        │   ├── EspnSyncModal.js   # ESPN live sync modal
        │   └── ChartManager.js    # Chart.js helper suite
        └── views/
            ├── HomeView.js        # Dashboard view
            ├── LeagueView.js      # League standings matrix
            ├── TeamView.js        # Team & roster inspector
            ├── PlayerView.js      # Player PFF analytics view
            ├── AnalyticsView.js   # Chart analytics hub
            ├── H2HView.js         # Manager rivalry engine
            ├── RecordsView.js     # League hall of fame
            ├── TradeView.js       # Trade analyzer & grades
            ├── DraftView.js       # Draft board matrix
            └── MatchupView.js     # Live matchup breakdown
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v16+ recommended) installed on your system.

### Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Start the application server
npm start
```

Open your browser and navigate to:
**`http://localhost:3000`**
