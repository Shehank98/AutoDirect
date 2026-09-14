-- DirectAuto Import — PostgreSQL schema
-- Rebuilt from the legacy MySQL car_auction database.
-- Data lives in Postgres; images are stored in Firebase Storage (we keep the URLs here),
-- and authentication is handled by Firebase Auth (we key user profiles by the Firebase UID).

-- ---------- Taxonomy / reference tables ----------

CREATE TABLE IF NOT EXISTS vehicle_type (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    image       TEXT DEFAULT '',
    status      SMALLINT NOT NULL DEFAULT 1,     -- 1 = show, 0 = hide
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_manufacturer (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    image       TEXT DEFAULT '',
    is_featured BOOLEAN NOT NULL DEFAULT false,  -- shown under footer "Top Categories"
    status      SMALLINT NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_model (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    manufacturer_id INTEGER NOT NULL REFERENCES vehicle_manufacturer(id) ON DELETE CASCADE,
    status          SMALLINT NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_color (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(10) DEFAULT '',
    status      SMALLINT NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_feature (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    image       TEXT DEFAULT '',
    status      SMALLINT NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Vehicles ----------

CREATE TABLE IF NOT EXISTS vehicle (
    id                   SERIAL PRIMARY KEY,
    vehicle_type         INTEGER REFERENCES vehicle_type(id) ON DELETE SET NULL,
    vehicle_manufacturer INTEGER REFERENCES vehicle_manufacturer(id) ON DELETE SET NULL,
    vehicle_model        INTEGER REFERENCES vehicle_model(id) ON DELETE SET NULL,
    seo_url              VARCHAR(255) NOT NULL UNIQUE,
    main_color           INTEGER REFERENCES vehicle_color(id) ON DELETE SET NULL,
    other_color          TEXT DEFAULT '',
    description          VARCHAR(500) DEFAULT '',
    year                 VARCHAR(100) DEFAULT '',
    chassi_id            VARCHAR(100) DEFAULT '',
    conditions           VARCHAR(500) DEFAULT '',
    seats                INTEGER,
    doors                INTEGER,
    passengers           INTEGER,
    engine_capacity      VARCHAR(20) DEFAULT '',
    mileage              VARCHAR(20) DEFAULT '',
    fuel_type            VARCHAR(20) DEFAULT '',
    transmission         VARCHAR(20) DEFAULT '',
    drive_type           VARCHAR(20) DEFAULT '',
    auction_grade        VARCHAR(50) DEFAULT '',
    grade                VARCHAR(50) DEFAULT '',
    price                NUMERIC(12,2),                 -- new: optional listing price
    images               JSONB NOT NULL DEFAULT '[]',   -- array of Firebase Storage image URLs
    feature_ids          JSONB NOT NULL DEFAULT '[]',   -- array of vehicle_feature ids
    is_featured          BOOLEAN NOT NULL DEFAULT false,
    is_latest            BOOLEAN NOT NULL DEFAULT false,
    status               SMALLINT NOT NULL DEFAULT 1,    -- 1 = published, 0 = draft/hidden
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vehicle_status       ON vehicle(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_manufacturer ON vehicle(vehicle_manufacturer);
CREATE INDEX IF NOT EXISTS idx_vehicle_model        ON vehicle(vehicle_model);
CREATE INDEX IF NOT EXISTS idx_vehicle_type         ON vehicle(vehicle_type);

-- ---------- Customer-facing data ----------

-- User profiles are keyed by the Firebase Auth UID (Firebase owns the credentials).
CREATE TABLE IF NOT EXISTS profiles (
    uid         VARCHAR(128) PRIMARY KEY,
    name        VARCHAR(200) DEFAULT '',
    email       VARCHAR(200) DEFAULT '',
    phone       VARCHAR(50) DEFAULT '',
    address     VARCHAR(500) DEFAULT '',
    is_admin    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inquiries (
    id          SERIAL PRIMARY KEY,
    vehicle_id  INTEGER REFERENCES vehicle(id) ON DELETE SET NULL,
    uid         VARCHAR(128),                  -- Firebase UID if the sender was logged in
    name        VARCHAR(200) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    phone       VARCHAR(50) DEFAULT '',
    message     TEXT NOT NULL,
    status      SMALLINT NOT NULL DEFAULT 0,   -- 0 = new, 1 = read/handled
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_inquiries (
    id          SERIAL PRIMARY KEY,
    uid         VARCHAR(128),
    name        VARCHAR(200) DEFAULT '',
    email       VARCHAR(200) DEFAULT '',
    make        VARCHAR(100) NOT NULL,
    model       VARCHAR(100) NOT NULL,
    year        VARCHAR(10) DEFAULT '',
    color       VARCHAR(100) DEFAULT '',
    grade       VARCHAR(50) DEFAULT '',
    message     TEXT DEFAULT '',
    status      SMALLINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletters (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) DEFAULT '',
    email       VARCHAR(200) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
