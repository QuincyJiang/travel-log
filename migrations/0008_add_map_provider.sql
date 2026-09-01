ALTER TABLE trips
ADD COLUMN map_provider TEXT NOT NULL DEFAULT 'google'
CHECK (map_provider IN ('google', 'amap'));

UPDATE trips
SET map_provider = 'amap',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN ('yili-loop-2026', 'qinghai-hexi-2025');
