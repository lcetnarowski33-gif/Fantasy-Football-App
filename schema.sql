-- Fantasy League Analytics - Database Schema
-- Compatible with PostgreSQL / SQLite for production backend persistence

CREATE TABLE IF NOT EXISTS leagues (
    league_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    season INT NOT NULL,
    total_teams INT DEFAULT 10,
    scoring_type VARCHAR(32) DEFAULT 'PPR', -- PPR, HALF_PPR, STANDARD
    espn_league_id VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS managers (
    manager_id VARCHAR(64) PRIMARY KEY,
    league_id VARCHAR(64) REFERENCES leagues(league_id),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    joined_season INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    team_id VARCHAR(64) PRIMARY KEY,
    league_id VARCHAR(64) REFERENCES leagues(league_id),
    manager_id VARCHAR(64) REFERENCES managers(manager_id),
    name VARCHAR(255) NOT NULL,
    abbrev VARCHAR(8),
    logo_url TEXT,
    division_id INT DEFAULT 1,
    division_name VARCHAR(128) DEFAULT 'Division 1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
    player_id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(16) NOT NULL, -- QB, RB, WR, TE, K, D/ST
    nfl_team VARCHAR(16) NOT NULL,
    bye_week INT,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, QUESTIONABLE, OUT, IR
    photo_url TEXT,
    espn_player_id VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS team_rosters (
    roster_id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) REFERENCES teams(team_id),
    player_id VARCHAR(64) REFERENCES players(player_id),
    slot VARCHAR(16) NOT NULL, -- QB, RB1, RB2, WR1, WR2, TE, FLEX, K, DST, BENCH, IR
    season INT NOT NULL,
    week INT NOT NULL,
    is_keeper BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS matchups (
    matchup_id VARCHAR(64) PRIMARY KEY,
    league_id VARCHAR(64) REFERENCES leagues(league_id),
    season INT NOT NULL,
    week INT NOT NULL,
    home_team_id VARCHAR(64) REFERENCES teams(team_id),
    away_team_id VARCHAR(64) REFERENCES teams(team_id),
    home_score DECIMAL(7, 2) DEFAULT 0.00,
    away_score DECIMAL(7, 2) DEFAULT 0.00,
    home_projected DECIMAL(7, 2) DEFAULT 0.00,
    away_projected DECIMAL(7, 2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    is_playoff BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS draft_picks (
    pick_id VARCHAR(64) PRIMARY KEY,
    league_id VARCHAR(64) REFERENCES leagues(league_id),
    season INT NOT NULL,
    round INT NOT NULL,
    pick_number INT NOT NULL,
    overall_pick INT NOT NULL,
    team_id VARCHAR(64) REFERENCES teams(team_id),
    player_id VARCHAR(64) REFERENCES players(player_id),
    is_keeper BOOLEAN DEFAULT FALSE,
    adp DECIMAL(5, 1),
    grade VARCHAR(8) -- A+, A, B, C, REACH, STEAL
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(64) PRIMARY KEY,
    league_id VARCHAR(64) REFERENCES leagues(league_id),
    season INT NOT NULL,
    week INT NOT NULL,
    type VARCHAR(32) NOT NULL, -- TRADE, WAIVER, FREE_AGENT, DROP
    team_id VARCHAR(64) REFERENCES teams(team_id),
    secondary_team_id VARCHAR(64),
    player_id VARCHAR(64) REFERENCES players(player_id),
    bid_amount DECIMAL(6, 2) DEFAULT 0,
    status VARCHAR(32) DEFAULT 'EXECUTED', -- EXECUTED, VETOED, PENDING
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS advanced_team_stats (
    stat_id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) REFERENCES teams(team_id),
    season INT NOT NULL,
    week INT NOT NULL,
    points_for DECIMAL(7, 2),
    points_against DECIMAL(7, 2),
    max_points DECIMAL(7, 2),
    bench_points DECIMAL(7, 2),
    manager_efficiency DECIMAL(5, 2), -- (actual / max_possible) * 100
    luck_rating DECIMAL(5, 2),
    elo_rating INT DEFAULT 1500,
    playoff_odds DECIMAL(5, 2),
    championship_odds DECIMAL(5, 2)
);

CREATE TABLE IF NOT EXISTS player_weekly_stats (
    stat_id VARCHAR(64) PRIMARY KEY,
    player_id VARCHAR(64) REFERENCES players(player_id),
    season INT NOT NULL,
    week INT NOT NULL,
    fantasy_points DECIMAL(6, 2),
    projected_points DECIMAL(6, 2),
    fpoe DECIMAL(6, 2), -- Fantasy Points Over Expectation
    snap_share DECIMAL(5, 2),
    target_share DECIMAL(5, 2),
    redzone_touches INT,
    touches INT
);
