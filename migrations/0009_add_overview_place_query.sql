ALTER TABLE trip_overview_nodes
ADD COLUMN place_query TEXT;

UPDATE trip_overview_nodes
SET place_query = '乌鲁木齐天山国际机场'
WHERE trip_id = 'yili-loop-2026' AND sort_order = 1;

UPDATE trip_overview_nodes
SET place_query = '西宁曹家堡国际机场'
WHERE trip_id = 'qinghai-hexi-2025' AND sort_order = 1;
