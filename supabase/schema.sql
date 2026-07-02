-- ============================================================================
-- SMART SCOUT IN — Esquema completo de Supabase
-- ============================================================================
-- Fecha de generación : 2026-07-02
-- Versión             : 1.0.0
-- Descripción         : Esquema DDL + Storage + RLS + Datos de ejemplo (seed)
--
-- ⚠️  Ejecutar en el Editor SQL de Supabase en el orden en que aparece.
--     Cada sección está separada para facilitar la depuración.
-- ============================================================================


-- ════════════════════════════════════════════════════════════════════════════
-- 0. EXTENSIONES NECESARIAS
-- ════════════════════════════════════════════════════════════════════════════
-- uuid-ossp ya viene habilitada en Supabase, pero por seguridad:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ════════════════════════════════════════════════════════════════════════════
-- 1. TIPOS ENUMERADOS (ENUMS)
-- ════════════════════════════════════════════════════════════════════════════

-- Pie preferido del jugador
CREATE TYPE preferred_foot_enum AS ENUM ('left', 'right', 'both');

-- Posición del jugador en el campo
CREATE TYPE position_enum AS ENUM (
  'GK',  -- Goalkeeper
  'CB',  -- Centre-back
  'FB',  -- Full-back
  'DM',  -- Defensive midfielder
  'CM',  -- Central midfielder
  'AM',  -- Attacking midfielder
  'W',   -- Winger
  'ST'   -- Striker
);

-- Grupo al que pertenece una métrica
CREATE TYPE metric_group_enum AS ENUM ('offensive', 'defensive', 'possession');


-- ════════════════════════════════════════════════════════════════════════════
-- 2. TABLAS
-- ════════════════════════════════════════════════════════════════════════════

-- --------------------------------------------------------------------------
-- 2.1  clubs — Clubes / equipos
-- --------------------------------------------------------------------------
CREATE TABLE clubs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  country    TEXT NOT NULL,
  badge_url  TEXT,                            -- URL del escudo en Storage bucket "club-badges"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  clubs IS 'Equipos de fútbol registrados en la plataforma.';
COMMENT ON COLUMN clubs.badge_url IS 'Ruta al escudo del club almacenado en el bucket "club-badges" de Supabase Storage.';


-- --------------------------------------------------------------------------
-- 2.2  players — Jugadores
-- --------------------------------------------------------------------------
CREATE TABLE players (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  nationality     TEXT NOT NULL,
  birth_date      DATE,
  preferred_foot  preferred_foot_enum NOT NULL DEFAULT 'right',
  position        position_enum NOT NULL,
  shirt_number    SMALLINT CHECK (shirt_number BETWEEN 1 AND 99),
  club_id         UUID REFERENCES clubs(id) ON DELETE SET NULL,
  photo_url       TEXT,                       -- URL de la foto en Storage bucket "player-photos"
  minutes_played  INT NOT NULL DEFAULT 0,
  league          TEXT,
  overall_rating  NUMERIC(5, 2) CHECK (overall_rating BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  players IS 'Ficha completa de cada jugador con datos deportivos y foto.';
COMMENT ON COLUMN players.overall_rating IS 'Valoración global del jugador (0-100), calculada o manual.';
COMMENT ON COLUMN players.photo_url IS 'Ruta a la foto del jugador en el bucket "player-photos".';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- --------------------------------------------------------------------------
-- 2.3  metrics — Catálogo de métricas de scouting
-- --------------------------------------------------------------------------
CREATE TABLE metrics (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code  TEXT NOT NULL UNIQUE,                 -- Código corto (ej: "build_play")
  label TEXT NOT NULL,                        -- Nombre visible (ej: "Build Play")
  "group" metric_group_enum NOT NULL          -- offensive / defensive / possession
);

COMMENT ON TABLE  metrics IS 'Catálogo maestro de métricas que componen el informe de scouting.';
COMMENT ON COLUMN metrics.code IS 'Identificador snake_case único para uso programático.';
COMMENT ON COLUMN metrics."group" IS 'Clasificación de la métrica: offensive, defensive o possession.';


-- --------------------------------------------------------------------------
-- 2.4  player_metrics — Valor de cada métrica por jugador
-- --------------------------------------------------------------------------
CREATE TABLE player_metrics (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  metric_id  UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  value      NUMERIC(7, 2) NOT NULL,          -- Valor absoluto de la métrica
  percentile INT CHECK (percentile BETWEEN 0 AND 99),  -- Percentil 0-99

  UNIQUE (player_id, metric_id)               -- Un registro por jugador y métrica
);

COMMENT ON TABLE player_metrics IS 'Intersección jugador-métrica con valor absoluto y percentil.';


-- --------------------------------------------------------------------------
-- 2.5  game_models — Modelos de juego
-- --------------------------------------------------------------------------
CREATE TABLE game_models (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  formation   TEXT,                           -- Ej: "4-3-3", "3-5-2"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE game_models IS 'Modelos tácticos de juego que el scout puede asignar a plantillas.';


-- --------------------------------------------------------------------------
-- 2.6  templates — Plantillas tácticas guardadas
-- --------------------------------------------------------------------------
CREATE TABLE templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  game_model_id UUID REFERENCES game_models(id) ON DELETE SET NULL,
  formation     TEXT,
  data          JSONB,                        -- Posiciones y jugadores en el campo
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  templates IS 'Plantillas tácticas guardadas por el scout, con posiciones y jugadores.';
COMMENT ON COLUMN templates.data IS 'JSON con coordenadas de posiciones y jugadores asignados en el campo.';

CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- --------------------------------------------------------------------------
-- 2.7  videos — Partidos / clips de vídeo analizados
-- --------------------------------------------------------------------------
CREATE TABLE videos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  youtube_url TEXT,
  player_id   UUID REFERENCES players(id) ON DELETE SET NULL,  -- Opcional
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE videos IS 'Vídeos de partidos o clips para análisis táctico.';


-- --------------------------------------------------------------------------
-- 2.8  video_tags — Etiquetas / marcas temporales en vídeos
-- --------------------------------------------------------------------------
CREATE TABLE video_tags (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id          UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp_seconds INT NOT NULL CHECK (timestamp_seconds >= 0),
  event_type        TEXT NOT NULL,            -- Ej: "goal", "assist", "press", "recovery"
  note              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE video_tags IS 'Tags de eventos en un momento concreto del vídeo.';


-- --------------------------------------------------------------------------
-- 2.9  video_drawings — Dibujos sobre fotogramas del vídeo
-- --------------------------------------------------------------------------
CREATE TABLE video_drawings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id          UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp_seconds INT NOT NULL CHECK (timestamp_seconds >= 0),
  canvas_json       JSONB NOT NULL,           -- Serialización del canvas de fabric.js
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  video_drawings IS 'Dibujos tácticos superpuestos sobre fotogramas del vídeo.';
COMMENT ON COLUMN video_drawings.canvas_json IS 'Estado serializado del canvas de fabric.js (objetos, colores, etc.).';


-- --------------------------------------------------------------------------
-- 2.10 ratings — Valoraciones / notas del scout sobre jugadores
-- --------------------------------------------------------------------------
CREATE TABLE ratings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  scout_notes TEXT,
  score       INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ratings IS 'Valoraciones y notas del scout sobre un jugador.';


-- ════════════════════════════════════════════════════════════════════════════
-- 3. ÍNDICES ADICIONALES
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_players_club_id     ON players(club_id);
CREATE INDEX idx_players_position    ON players(position);
CREATE INDEX idx_players_nationality ON players(nationality);
CREATE INDEX idx_player_metrics_player ON player_metrics(player_id);
CREATE INDEX idx_player_metrics_metric ON player_metrics(metric_id);
CREATE INDEX idx_video_tags_video    ON video_tags(video_id);
CREATE INDEX idx_video_drawings_video ON video_drawings(video_id);
CREATE INDEX idx_ratings_player      ON ratings(player_id);
CREATE INDEX idx_templates_model     ON templates(game_model_id);


-- ════════════════════════════════════════════════════════════════════════════
-- 4. STORAGE BUCKETS
-- ════════════════════════════════════════════════════════════════════════════
-- ⚠️  Los buckets se crean con la API de Storage de Supabase.
--     Estas sentencias INSERT funcionan en el Editor SQL de Supabase.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('player-photos', 'player-photos', true),    -- Público de lectura
  ('club-badges',   'club-badges',   true),    -- Público de lectura
  ('match-videos',  'match-videos',  false);   -- Privado

-- --------------------------------------------------------------------------
-- Políticas de Storage — player-photos (público de lectura)
-- --------------------------------------------------------------------------
CREATE POLICY "Lectura pública de fotos de jugadores"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-photos');

CREATE POLICY "Upload fotos autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'player-photos');

CREATE POLICY "Update fotos autenticado"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'player-photos');

CREATE POLICY "Delete fotos autenticado"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'player-photos');

-- --------------------------------------------------------------------------
-- Políticas de Storage — club-badges (público de lectura)
-- --------------------------------------------------------------------------
CREATE POLICY "Lectura pública de escudos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'club-badges');

CREATE POLICY "Upload escudos autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'club-badges');

CREATE POLICY "Update escudos autenticado"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'club-badges');

CREATE POLICY "Delete escudos autenticado"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'club-badges');

-- --------------------------------------------------------------------------
-- Políticas de Storage — match-videos (privado, solo autenticados)
-- --------------------------------------------------------------------------
CREATE POLICY "Lectura vídeos autenticado"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'match-videos');

CREATE POLICY "Upload vídeos autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'match-videos');

CREATE POLICY "Update vídeos autenticado"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'match-videos');

CREATE POLICY "Delete vídeos autenticado"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'match-videos');


-- ════════════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════════════════
-- Activamos RLS en TODAS las tablas.
-- Para el MVP: authenticated puede leer y escribir; anon solo lectura.
-- ⚠️  Después del MVP, restringir con auth.uid() — ver comentarios al final.

-- Habilitar RLS
ALTER TABLE clubs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_models     ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_drawings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings         ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- 5.1  Políticas para rol ANON — Solo lectura (SELECT)
-- --------------------------------------------------------------------------
CREATE POLICY "anon_read_clubs"          ON clubs          FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_players"        ON players        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_metrics"        ON metrics        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_player_metrics" ON player_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_game_models"    ON game_models    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_templates"      ON templates      FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_videos"         ON videos         FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_video_tags"     ON video_tags     FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_video_drawings" ON video_drawings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_ratings"        ON ratings        FOR SELECT TO anon USING (true);

-- --------------------------------------------------------------------------
-- 5.2  Políticas para rol AUTHENTICATED — Lectura + Escritura completa
-- --------------------------------------------------------------------------

-- SELECT
CREATE POLICY "auth_read_clubs"          ON clubs          FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_players"        ON players        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_metrics"        ON metrics        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_player_metrics" ON player_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_game_models"    ON game_models    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_templates"      ON templates      FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_videos"         ON videos         FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_video_tags"     ON video_tags     FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_video_drawings" ON video_drawings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_ratings"        ON ratings        FOR SELECT TO authenticated USING (true);

-- INSERT
CREATE POLICY "auth_insert_clubs"          ON clubs          FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_players"        ON players        FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_metrics"        ON metrics        FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_player_metrics" ON player_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_game_models"    ON game_models    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_templates"      ON templates      FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_videos"         ON videos         FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_video_tags"     ON video_tags     FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_video_drawings" ON video_drawings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_ratings"        ON ratings        FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE
CREATE POLICY "auth_update_clubs"          ON clubs          FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_players"        ON players        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_metrics"        ON metrics        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_player_metrics" ON player_metrics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_game_models"    ON game_models    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_templates"      ON templates      FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_videos"         ON videos         FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_video_tags"     ON video_tags     FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_video_drawings" ON video_drawings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_ratings"        ON ratings        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- DELETE
CREATE POLICY "auth_delete_clubs"          ON clubs          FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_players"        ON players        FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_metrics"        ON metrics        FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_player_metrics" ON player_metrics FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_game_models"    ON game_models    FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_templates"      ON templates      FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_videos"         ON videos         FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_video_tags"     ON video_tags     FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_video_drawings" ON video_drawings FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_ratings"        ON ratings        FOR DELETE TO authenticated USING (true);


-- ════════════════════════════════════════════════════════════════════════════
-- 6. DATOS DE EJEMPLO (SEED)
-- ════════════════════════════════════════════════════════════════════════════

-- --------------------------------------------------------------------------
-- 6.1  Clubes (5)
-- --------------------------------------------------------------------------
INSERT INTO clubs (id, name, country) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'FC Barcelona',       'Spain'),
  ('a1000000-0000-0000-0000-000000000002', 'Manchester City',    'England'),
  ('a1000000-0000-0000-0000-000000000003', 'Bayern München',     'Germany'),
  ('a1000000-0000-0000-0000-000000000004', 'Paris Saint-Germain','France'),
  ('a1000000-0000-0000-0000-000000000005', 'Juventus FC',        'Italy');


-- --------------------------------------------------------------------------
-- 6.2  Jugadores (8)
-- --------------------------------------------------------------------------
INSERT INTO players (id, first_name, last_name, nationality, birth_date, preferred_foot, position, shirt_number, club_id, minutes_played, league, overall_rating) VALUES
  -- FC Barcelona
  ('b1000000-0000-0000-0000-000000000001', 'Pedri',    'González',   'Spain',    '2002-11-25', 'right', 'CM', 8,  'a1000000-0000-0000-0000-000000000001', 2340, 'La Liga',       88.50),
  ('b1000000-0000-0000-0000-000000000002', 'Lamine',   'Yamal',      'Spain',    '2007-07-13', 'left',  'W',  19, 'a1000000-0000-0000-0000-000000000001', 2100, 'La Liga',       85.00),
  -- Manchester City
  ('b1000000-0000-0000-0000-000000000003', 'Phil',     'Foden',      'England',  '2000-05-28', 'left',  'AM', 47, 'a1000000-0000-0000-0000-000000000002', 2560, 'Premier League', 89.00),
  ('b1000000-0000-0000-0000-000000000004', 'Rodri',    'Hernández',  'Spain',    '1996-06-22', 'right', 'DM', 16, 'a1000000-0000-0000-0000-000000000002', 2780, 'Premier League', 91.50),
  -- Bayern München
  ('b1000000-0000-0000-0000-000000000005', 'Jamal',    'Musiala',    'Germany',  '2003-02-26', 'right', 'AM', 42, 'a1000000-0000-0000-0000-000000000003', 2410, 'Bundesliga',     87.00),
  -- PSG
  ('b1000000-0000-0000-0000-000000000006', 'Warren',   'Zaïre-Emery','France',   '2006-03-08', 'right', 'CM', 33, 'a1000000-0000-0000-0000-000000000004', 1890, 'Ligue 1',        83.00),
  -- Juventus
  ('b1000000-0000-0000-0000-000000000007', 'Kenan',    'Yıldız',     'Turkey',   '2005-05-04', 'left',  'W',  10, 'a1000000-0000-0000-0000-000000000005', 2050, 'Serie A',        81.50),
  -- Jugador libre (sin club)
  ('b1000000-0000-0000-0000-000000000008', 'Florian',  'Wirtz',      'Germany',  '2003-05-03', 'right', 'AM', 10, NULL,                                   2680, 'Bundesliga',     90.00);


-- --------------------------------------------------------------------------
-- 6.3  Catálogo de métricas (13 métricas)
-- --------------------------------------------------------------------------
INSERT INTO metrics (id, code, label, "group") VALUES
  -- Ofensivas (9)
  ('c1000000-0000-0000-0000-000000000001', 'build_play',          'Build Play',          'offensive'),
  ('c1000000-0000-0000-0000-000000000002', 'link_up_play',        'Link Up Play',        'offensive'),
  ('c1000000-0000-0000-0000-000000000003', 'progression_play',    'Progression Play',    'offensive'),
  ('c1000000-0000-0000-0000-000000000004', 'open_play_creation',  'Open Play Creation',  'offensive'),
  ('c1000000-0000-0000-0000-000000000005', 'set_play_creation',   'Set Play Creation',   'offensive'),
  ('c1000000-0000-0000-0000-000000000006', 'open_play_finishing', 'Open Play Finishing',  'offensive'),
  ('c1000000-0000-0000-0000-000000000007', 'set_play_finishing',  'Set Play Finishing',   'offensive'),
  ('c1000000-0000-0000-0000-000000000008', 'finishing_crosses',   'Finishing Crosses',    'offensive'),
  ('c1000000-0000-0000-0000-000000000009', 'threat',              'Threat',               'offensive'),
  -- Defensivas (4)
  ('c1000000-0000-0000-0000-000000000010', 'open_play_defending', 'Open Play Defending',  'defensive'),
  ('c1000000-0000-0000-0000-000000000011', 'defending_box',       'Defending Box',        'defensive'),
  ('c1000000-0000-0000-0000-000000000012', 'defending_own_half',  'Defending Own Half',   'defensive'),
  ('c1000000-0000-0000-0000-000000000013', 'defending_oppo_half', 'Defending Oppo Half',  'defensive');


-- --------------------------------------------------------------------------
-- 6.4  Métricas de ejemplo para cada jugador (8 jugadores × 13 métricas = 104 filas)
-- --------------------------------------------------------------------------

-- Pedri González (CM - Barcelona)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 82.30, 90),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 79.10, 85),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 76.40, 82),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 71.20, 75),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 45.00, 40),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000006', 38.50, 35),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007', 30.00, 28),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000008', 22.10, 20),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000009', 65.70, 68),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000010', 60.00, 62),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000011', 55.30, 55),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000012', 58.90, 60),
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000013', 68.20, 72);

-- Lamine Yamal (W - Barcelona)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 55.00, 50),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 72.40, 78),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 80.10, 88),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 85.00, 92),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 60.20, 58),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000006', 68.30, 72),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000007', 42.50, 38),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000008', 55.60, 52),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000009', 82.40, 90),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000010', 35.20, 30),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000011', 28.00, 22),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000012', 32.10, 28),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000013', 40.50, 36);

-- Phil Foden (AM - Manchester City)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 70.50, 72),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 80.30, 86),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 78.90, 84),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 83.20, 90),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005', 55.00, 50),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000006', 75.40, 80),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000007', 48.00, 42),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008', 52.30, 48),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 80.10, 87),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000010', 42.50, 38),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000011', 38.20, 32),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000012', 40.00, 35),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000013', 50.50, 48);

-- Rodri Hernández (DM - Manchester City)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 88.20, 95),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 75.00, 80),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 82.10, 88),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 55.30, 52),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000005', 40.00, 35),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000006', 32.20, 28),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000007', 25.00, 20),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000008', 18.50, 15),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000009', 48.70, 45),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000010', 85.00, 92),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000011', 80.40, 88),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000012', 82.00, 90),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000013', 78.30, 85);

-- Jamal Musiala (AM - Bayern München)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 65.00, 65),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 82.50, 90),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 78.00, 83),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000004', 80.30, 88),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 48.00, 42),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000006', 72.10, 76),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000007', 40.00, 35),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000008', 45.50, 40),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000009', 76.80, 82),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000010', 45.00, 40),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000011', 40.20, 35),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000012', 42.00, 38),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000013', 52.30, 50);

-- Warren Zaïre-Emery (CM - PSG)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 72.00, 75),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 68.50, 70),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 70.20, 74),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004', 62.00, 62),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 38.50, 32),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006', 45.30, 40),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000007', 32.00, 28),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000008', 28.40, 24),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000009', 58.00, 55),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000010', 68.50, 72),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000011', 62.30, 65),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000012', 65.00, 68),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000013', 70.10, 74);

-- Kenan Yıldız (W - Juventus)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 50.00, 45),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 65.00, 65),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 72.50, 76),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', 70.00, 72),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000005', 52.30, 48),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000006', 62.00, 60),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000007', 38.50, 33),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000008', 48.20, 44),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000009', 68.00, 70),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000010', 38.00, 33),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000011', 32.50, 28),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000012', 35.00, 30),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000013', 42.80, 38);

-- Florian Wirtz (AM - sin club / agente libre)
INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 74.00, 78),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000002', 84.20, 92),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 81.50, 88),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 86.00, 94),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000005', 58.00, 55),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000006', 78.30, 84),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000007', 45.00, 40),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000008', 50.20, 46),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000009', 84.50, 92),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000010', 40.00, 35),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000011', 35.50, 30),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000012', 38.00, 33),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000013', 48.00, 44);


-- --------------------------------------------------------------------------
-- 6.5  Game Models (5)
-- --------------------------------------------------------------------------
INSERT INTO game_models (id, name, description, formation) VALUES
  ('d1000000-0000-0000-0000-000000000001',
   'Juego de posición',
   'Estilo posicional que busca superioridades mediante la ocupación racional del espacio. Foco en posesión, juego interior y salida desde atrás.',
   '4-3-3'),

  ('d1000000-0000-0000-0000-000000000002',
   'Presión alta / Gegenpressing',
   'Recuperación inmediata tras pérdida mediante presión coordinada en campo rival. Transiciones ofensivas ultra-rápidas.',
   '4-2-3-1'),

  ('d1000000-0000-0000-0000-000000000003',
   'Contraataque directo',
   'Bloque defensivo sólido con transiciones rápidas y verticales al recuperar el balón. Pocos pases hasta la portería rival.',
   '4-4-2'),

  ('d1000000-0000-0000-0000-000000000004',
   'Bloque bajo',
   'Defensa profunda con líneas juntas para proteger la portería. Cede posesión y territorio, prioriza solidez defensiva.',
   '5-4-1'),

  ('d1000000-0000-0000-0000-000000000005',
   'Fútbol total',
   'Filosofía de intercambio constante de posiciones. Todos atacan, todos defienden. Alta exigencia física y técnica.',
   '3-4-3');


-- ════════════════════════════════════════════════════════════════════════════
-- 7. NOTAS PARA RESTRICCIÓN POST-MVP
-- ════════════════════════════════════════════════════════════════════════════
-- Cuando añadas autenticación multiusuario, reemplaza las políticas
-- permisivas por políticas basadas en auth.uid(). Ejemplo:
--
-- -- Añadir columna de propietario:
-- ALTER TABLE templates ADD COLUMN user_id UUID REFERENCES auth.users(id);
--
-- -- Reemplazar política de lectura:
-- DROP POLICY "auth_read_templates" ON templates;
-- CREATE POLICY "auth_read_own_templates" ON templates
--   FOR SELECT TO authenticated
--   USING (user_id = auth.uid());
--
-- -- Reemplazar política de escritura:
-- DROP POLICY "auth_insert_templates" ON templates;
-- CREATE POLICY "auth_insert_own_templates" ON templates
--   FOR INSERT TO authenticated
--   WITH CHECK (user_id = auth.uid());
--
-- -- Repetir el mismo patrón para UPDATE y DELETE en cada tabla que
-- -- necesite ser restringida por usuario.
--
-- Para las tablas «globales» (clubs, players, metrics) puedes mantener
-- la lectura abierta y restringir solo la escritura a roles de admin
-- mediante un campo `role` en la tabla profiles o con custom claims en JWT.


-- ════════════════════════════════════════════════════════════════════════════
-- FIN DEL ESQUEMA
-- ════════════════════════════════════════════════════════════════════════════
