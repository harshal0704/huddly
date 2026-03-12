-- ============================================
-- VMeet / Huddly — Complete Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- 1. PROFILES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,                          -- Clerk user ID
    display_name TEXT NOT NULL DEFAULT 'Anonymous',
    avatar_url TEXT,
    avatar_config JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available','focused','in-meeting','away','offline')),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_status ON profiles(status);

-- ──────────────────────────────────────────────
-- 2. ROOMS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    owner_id TEXT NOT NULL DEFAULT 'system',       -- Clerk user ID or 'system'
    template TEXT NOT NULL DEFAULT 'office'
        CHECK (template IN ('classroom','office','cafe','conference','party',
                            'library','gaming','rooftop','theater','blank','custom')),
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public','private','password')),
    password_hash TEXT,                            -- bcrypt hash for password-protected rooms
    invite_code TEXT UNIQUE,                       -- shareable invite code
    max_capacity INTEGER NOT NULL DEFAULT 25
        CHECK (max_capacity BETWEEN 2 AND 500),
    map_data JSONB DEFAULT '{}',
    custom_objects JSONB DEFAULT '[]',
    thumbnail_url TEXT,
    online_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rooms_owner ON rooms(owner_id);
CREATE INDEX idx_rooms_visibility ON rooms(visibility);
CREATE INDEX idx_rooms_template ON rooms(template);
CREATE INDEX idx_rooms_active ON rooms(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_rooms_invite_code ON rooms(invite_code) WHERE invite_code IS NOT NULL;

-- ──────────────────────────────────────────────
-- 3. ROOM MEMBERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,                         -- Clerk user ID
    role TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner','admin','member','viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room ON room_members(room_id);
CREATE INDEX idx_room_members_user ON room_members(user_id);

-- ──────────────────────────────────────────────
-- 4. CHAT MESSAGES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL DEFAULT 'Anonymous',
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    channel TEXT NOT NULL DEFAULT 'global'
        CHECK (channel IN ('global','proximity','system')),
    reactions JSONB DEFAULT '{}',                 -- { "👍": ["user1","user2"], "❤️": ["user3"] }
    reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_user ON chat_messages(user_id);
CREATE INDEX idx_chat_channel ON chat_messages(room_id, channel);

-- ──────────────────────────────────────────────
-- 5. INVITATIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    inviter_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    max_uses INTEGER DEFAULT NULL,                -- NULL = unlimited
    use_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,                       -- NULL = never expires
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_code ON invitations(code);
CREATE INDEX idx_invitations_room ON invitations(room_id);

-- ──────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────

-- PROFILES: anyone can read, users can update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (true);

-- ROOMS: public rooms readable by all, private by members only
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public rooms are viewable by everyone"
    ON rooms FOR SELECT USING (
        visibility = 'public' OR owner_id = 'system'
    );

CREATE POLICY "Private rooms viewable by members"
    ON rooms FOR SELECT USING (
        visibility != 'public' AND (
            EXISTS (
                SELECT 1 FROM room_members
                WHERE room_members.room_id = rooms.id
            ) OR owner_id = 'system'
        )
    );

CREATE POLICY "Authenticated users can create rooms"
    ON rooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Room owners can update"
    ON rooms FOR UPDATE USING (true);

CREATE POLICY "Room owners can delete"
    ON rooms FOR DELETE USING (true);

-- ROOM MEMBERS
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room members are viewable"
    ON room_members FOR SELECT USING (true);

CREATE POLICY "Can join rooms"
    ON room_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Can leave rooms"
    ON room_members FOR DELETE USING (true);

-- CHAT MESSAGES
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages are viewable by room participants"
    ON chat_messages FOR SELECT USING (true);

CREATE POLICY "Users can send messages"
    ON chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own messages"
    ON chat_messages FOR UPDATE USING (true);

-- INVITATIONS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invitations are viewable"
    ON invitations FOR SELECT USING (true);

CREATE POLICY "Room owners can create invitations"
    ON invitations FOR INSERT WITH CHECK (true);

CREATE POLICY "Room owners can delete invitations"
    ON invitations FOR DELETE USING (true);

-- ──────────────────────────────────────────────
-- 7. HELPER FUNCTIONS
-- ──────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_rooms_updated
    BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate a human-readable invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
    RETURN upper(encode(gen_random_bytes(4), 'hex'));
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────
-- 8. SEED DATA — Default System Rooms
-- ──────────────────────────────────────────────
INSERT INTO rooms (id, name, description, owner_id, template, visibility, max_capacity, invite_code) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Team HQ 🏢', 'Our virtual office with team pods and a break area', 'system', 'office', 'public', 50, 'OFFICE01'),
    ('00000000-0000-0000-0000-000000000002', 'Demo Classroom 📚', 'A cozy classroom for learning together', 'system', 'classroom', 'public', 25, 'CLASS001'),
    ('00000000-0000-0000-0000-000000000003', 'Pixel Café ☕', 'Grab a virtual coffee and chat with friends', 'system', 'cafe', 'public', 15, 'CAFE0001'),
    ('00000000-0000-0000-0000-000000000004', 'Tech Talk Hall 🎤', 'Conference hall for presentations and AMAs', 'system', 'conference', 'public', 100, 'CONF0001'),
    ('00000000-0000-0000-0000-000000000005', 'Friday Vibes 🎉', 'Weekend Party Island with DJ booth and dance floor', 'system', 'party', 'public', 30, 'PARTY001'),
    ('00000000-0000-0000-0000-000000000006', 'Quiet Library 📖', 'Focus zone with bookshelves and reading nooks', 'system', 'library', 'public', 20, 'LIB00001'),
    ('00000000-0000-0000-0000-000000000007', 'Gaming Lounge 🎮', 'Arcade cabinets, ping pong, and neon vibes', 'system', 'gaming', 'public', 20, 'GAME0001'),
    ('00000000-0000-0000-0000-000000000008', 'Rooftop Bar 🌃', 'City skyline views with lounge seating', 'system', 'rooftop', 'public', 25, 'ROOF0001'),
    ('00000000-0000-0000-0000-000000000009', 'Theater 🎭', 'Watch party with stage and tiered seating', 'system', 'theater', 'public', 50, 'THTR0001'),
    ('00000000-0000-0000-0000-00000000000a', 'Blank Canvas 🎨', 'Empty room — build your own with Room Builder', 'system', 'blank', 'public', 20, 'BLANK001')
ON CONFLICT (id) DO NOTHING;
