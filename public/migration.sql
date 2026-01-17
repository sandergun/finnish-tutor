ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;

CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    achievement_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (telegram_id, achievement_id)
);
