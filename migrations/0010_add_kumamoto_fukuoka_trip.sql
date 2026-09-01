UPDATE trips
SET sort_order = sort_order + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE sort_order >= 2;

INSERT INTO trips (
  id, eyebrow, title, short_title, period, start_date, end_date, status,
  cover_path, cover_alt, summary, route_label, overview_map_embed,
  overview_map_external, sort_order, map_provider
) VALUES (
  'kumamoto-fukuoka-2026',
  'KUMAMOTO · FUKUOKA 2026',
  '熊本・福冈
5 天 4 晚',
  '熊本・福冈北九州记',
  '2026.06.18 — 06.22',
  '2026-06-18',
  '2026-06-22',
  '已归档',
  '/images/kumamoto-castle.jpg',
  '修复后的熊本城',
  '从香港飞抵福冈后直奔熊本，在城郭、美术馆、咖啡与夜色之间停留两晚，再回到福冈漫步天神。茶泡饭、熊本咖啡和返程前那片铺满羊奶芝士的吐司，成为这趟北九州短旅最鲜明的味觉记忆。',
  '香港 → 福冈机场 → 熊本 → 福冈・天神 → 香港',
  'https://maps.google.com/maps?saddr=Fukuoka+Airport&daddr=Kumamoto+Station+to%3AKumamoto+Castle+to%3AKumamoto+Museum+of+Art+to%3AHakata+Station+to%3ATenjin+Fukuoka+to%3AFukuoka+Airport&output=embed',
  'https://www.google.com/maps/dir/Fukuoka+Airport/Kumamoto+Station/Kumamoto+Castle/Kumamoto+Museum+of+Art/Hakata+Station/Tenjin+Fukuoka/Fukuoka+Airport',
  2,
  'google'
);

INSERT INTO trip_tags (trip_id, sort_order, name) VALUES
  ('kumamoto-fukuoka-2026', 1, '北九州短旅'),
  ('kumamoto-fukuoka-2026', 2, '城郭与美术馆'),
  ('kumamoto-fukuoka-2026', 3, '咖啡与夜生活');

INSERT INTO trip_metrics (trip_id, sort_order, value, label) VALUES
  ('kumamoto-fukuoka-2026', 1, '5', '天'),
  ('kumamoto-fukuoka-2026', 2, '4', '晚'),
  ('kumamoto-fukuoka-2026', 3, '2', '停留城市'),
  ('kumamoto-fukuoka-2026', 4, '3', '咖啡记忆');

INSERT INTO trip_overview_nodes (trip_id, sort_order, label, place_query) VALUES
  ('kumamoto-fukuoka-2026', 1, '福冈机场', 'Fukuoka Airport'),
  ('kumamoto-fukuoka-2026', 2, '熊本站', 'Kumamoto Station'),
  ('kumamoto-fukuoka-2026', 3, '熊本城', 'Kumamoto Castle'),
  ('kumamoto-fukuoka-2026', 4, '熊本美术馆', 'Kumamoto Museum of Art'),
  ('kumamoto-fukuoka-2026', 5, '博多站', 'Hakata Station'),
  ('kumamoto-fukuoka-2026', 6, '天神', 'Tenjin Fukuoka'),
  ('kumamoto-fukuoka-2026', 7, '福冈机场', 'Fukuoka Airport');

INSERT INTO trip_days (
  id, trip_id, day_number, title, subtitle, image_path, image_alt, stay,
  stay_arrival, transport, duration
) VALUES
  (
    'kumamoto-fukuoka-2026:day:1', 'kumamoto-fukuoka-2026', 1,
    '香港 → 福冈 → 熊本',
    '从香港机场飞抵福冈，落地当天没有停留，继续搭车南下熊本。',
    '/images/fukuoka-airport.jpg', '福冈机场',
    '熊本市区', '熊本站', '航班 + 地铁 / 巴士 + 九州新干线',
    '跨境飞行与福冈至熊本转场'
  ),
  (
    'kumamoto-fukuoka-2026:day:2', 'kumamoto-fukuoka-2026', 2,
    '熊本城与夜香木',
    '白天走进熊本城，喝一杯记住这座城的咖啡；入夜后在夜香木酒吧收尾。',
    '/images/kumamoto-castle.jpg', '修复后的熊本城',
    '熊本市区', NULL, '市电 + 步行', '熊本市区慢行一日'
  ),
  (
    'kumamoto-fukuoka-2026:day:3', 'kumamoto-fukuoka-2026', 3,
    '熊本美术馆 → 福冈',
    '上午留给熊本美术馆，午后北上福冈，并用一碗茶泡饭结束转场日。',
    '/images/kumamoto-museum.jpg', '熊本县立美术馆',
    '福冈市区', '博多站', '市电 + 九州新干线 + 地铁', '熊本至博多约 40 分钟'
  ),
  (
    'kumamoto-fukuoka-2026:day:4', 'kumamoto-fukuoka-2026', 4,
    '福冈天神漫步',
    '在天神街区慢慢逛店、走路，也把时间留给福冈的咖啡。',
    '/images/fukuoka-tenjin.jpg', '福冈天神街区',
    '福冈市区', NULL, '地铁 + 步行', '天神街区慢行一日'
  ),
  (
    'kumamoto-fukuoka-2026:day:5', 'kumamoto-fukuoka-2026', 5,
    '福冈 → 香港',
    '返程前喝了旅途中最出名的一杯咖啡，配一片铺着宽宽羊奶芝士的吐司，再从福冈飞回香港。',
    '/images/coffee-toast-illustration.jpg', '咖啡与吐司示意图',
    '返程', NULL, '地铁 + 航班', '市区至机场约 15 分钟，不含候机与飞行'
  );

INSERT INTO day_route_nodes (day_id, sort_order, label, place_query) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '香港国际机场', 'Hong Kong International Airport'),
  ('kumamoto-fukuoka-2026:day:1', 2, '福冈机场', 'Fukuoka Airport'),
  ('kumamoto-fukuoka-2026:day:1', 3, '博多站', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:1', 4, '熊本站', 'Kumamoto Station'),
  ('kumamoto-fukuoka-2026:day:2', 1, '熊本市区', 'Kumamoto City Center'),
  ('kumamoto-fukuoka-2026:day:2', 2, '熊本城', 'Kumamoto Castle'),
  ('kumamoto-fukuoka-2026:day:2', 3, '熊本咖啡店', 'Kumamoto coffee'),
  ('kumamoto-fukuoka-2026:day:2', 4, '夜香木', 'Yakoboku Kumamoto'),
  ('kumamoto-fukuoka-2026:day:2', 5, '熊本市区', 'Kumamoto City Center'),
  ('kumamoto-fukuoka-2026:day:3', 1, '熊本市区', 'Kumamoto City Center'),
  ('kumamoto-fukuoka-2026:day:3', 2, '熊本美术馆', 'Kumamoto Museum of Art'),
  ('kumamoto-fukuoka-2026:day:3', 3, '熊本站', 'Kumamoto Station'),
  ('kumamoto-fukuoka-2026:day:3', 4, '博多站', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:4', 1, '福冈市区', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:4', 2, '天神', 'Tenjin Fukuoka'),
  ('kumamoto-fukuoka-2026:day:4', 3, '天神咖啡店', 'Tenjin coffee Fukuoka'),
  ('kumamoto-fukuoka-2026:day:4', 4, '福冈市区', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:5', 1, '福冈市区', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:5', 2, '返程咖啡店', 'Fukuoka coffee cheese toast'),
  ('kumamoto-fukuoka-2026:day:5', 3, '福冈机场', 'Fukuoka Airport'),
  ('kumamoto-fukuoka-2026:day:5', 4, '香港国际机场', 'Hong Kong International Airport');

INSERT INTO day_route_legs (day_id, sort_order, mode) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '航班'),
  ('kumamoto-fukuoka-2026:day:1', 2, '地铁 / 巴士'),
  ('kumamoto-fukuoka-2026:day:1', 3, '九州新干线'),
  ('kumamoto-fukuoka-2026:day:2', 1, '市电 + 步行'),
  ('kumamoto-fukuoka-2026:day:2', 2, '步行'),
  ('kumamoto-fukuoka-2026:day:2', 3, '步行'),
  ('kumamoto-fukuoka-2026:day:2', 4, '步行 / 市电'),
  ('kumamoto-fukuoka-2026:day:3', 1, '市电 + 步行'),
  ('kumamoto-fukuoka-2026:day:3', 2, '市电'),
  ('kumamoto-fukuoka-2026:day:3', 3, '九州新干线'),
  ('kumamoto-fukuoka-2026:day:4', 1, '地铁'),
  ('kumamoto-fukuoka-2026:day:4', 2, '步行'),
  ('kumamoto-fukuoka-2026:day:4', 3, '地铁 / 步行'),
  ('kumamoto-fukuoka-2026:day:5', 1, '步行 / 地铁'),
  ('kumamoto-fukuoka-2026:day:5', 2, '地铁'),
  ('kumamoto-fukuoka-2026:day:5', 3, '航班');

INSERT INTO day_timeline_items (day_id, sort_order, time_label, title, note) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '白天', '香港机场出发', '从香港搭乘航班前往福冈。'),
  ('kumamoto-fukuoka-2026:day:1', 2, '抵达后', '福冈机场 → 博多站', '完成入境后进入市区换乘。'),
  ('kumamoto-fukuoka-2026:day:1', 3, '当天', '博多 → 熊本', '继续南下，当晚入住熊本市区。'),
  ('kumamoto-fukuoka-2026:day:2', 1, '白天', '熊本城', '把在熊本的完整白天留给城郭与周边街区。'),
  ('kumamoto-fukuoka-2026:day:2', 2, '下午', '熊本咖啡', '喝到一杯颇有熊本代表性的咖啡，具体店名待补。'),
  ('kumamoto-fukuoka-2026:day:2', 3, '晚上', '夜香木酒吧', '在熊本的夜色与酒吧氛围中结束当天。'),
  ('kumamoto-fukuoka-2026:day:3', 1, '上午', '熊本美术馆', '离开熊本前看一场展览，具体馆名待补。'),
  ('kumamoto-fukuoka-2026:day:3', 2, '下午', '熊本 → 福冈', '搭乘九州新干线回到博多。'),
  ('kumamoto-fukuoka-2026:day:3', 3, '晚上', '茶泡饭', '在福冈吃了一碗茶泡饭，为转场日收尾。'),
  ('kumamoto-fukuoka-2026:day:4', 1, '白天', '天神漫步', '在商场、街巷与店铺之间随意走走。'),
  ('kumamoto-fukuoka-2026:day:4', 2, '下午', '福冈咖啡时间', '在天神停下来喝咖啡，具体店名待补。'),
  ('kumamoto-fukuoka-2026:day:4', 3, '晚上', '福冈夜色', '继续在市中心散步后返回住宿。'),
  ('kumamoto-fukuoka-2026:day:5', 1, '上午', '返程前的名店咖啡', '喝咖啡，并点了铺着宽大片羊奶芝士的吐司。'),
  ('kumamoto-fukuoka-2026:day:5', 2, '之后', '前往福冈机场', '结束市区停留，搭地铁前往机场。'),
  ('kumamoto-fukuoka-2026:day:5', 3, '当天', '返回香港', '从福冈起飞，完成这趟北九州短旅。');

INSERT INTO places (id, name, type, image_path) VALUES
  ('place-kumamoto-fukuoka-fuk-airport', '福冈机场', '抵达门户', '/images/fukuoka-airport.jpg'),
  ('place-kumamoto-fukuoka-kumamoto-city', '熊本市区', '旅程落脚地', '/images/kumamoto-shimotori-night.jpg'),
  ('place-kumamoto-fukuoka-castle', '熊本城', '城郭', '/images/kumamoto-castle.jpg'),
  ('place-kumamoto-fukuoka-yakoboku', '夜香木', '酒吧与咖啡', '/images/kumamoto-shimotori-night.jpg'),
  ('place-kumamoto-fukuoka-museum', '熊本美术馆', '美术馆', '/images/kumamoto-museum.jpg'),
  ('place-kumamoto-fukuoka-hakata', '博多', '转场与餐饮', '/images/hakata-station.jpg'),
  ('place-kumamoto-fukuoka-tenjin', '天神', '城市漫步', '/images/fukuoka-tenjin.jpg'),
  ('place-kumamoto-fukuoka-coffee-walk', '福冈咖啡时间', '咖啡', '/images/coffee-toast-illustration.jpg'),
  ('place-kumamoto-fukuoka-cheese-toast', '羊奶芝士吐司', '味觉记忆', '/images/coffee-toast-illustration.jpg'),
  ('place-kumamoto-fukuoka-return', '福冈机场返程', '返程', '/images/fukuoka-airport.jpg');

INSERT INTO day_places (id, day_id, place_id, sort_order, description) VALUES
  (
    'kumamoto-fukuoka-2026:day:1:place:1',
    'kumamoto-fukuoka-2026:day:1',
    'place-kumamoto-fukuoka-fuk-airport',
    1,
    '福冈机场是这趟北九州旅程的落地点。抵达后没有在福冈停留，而是继续前往博多换乘，直接南下熊本。'
  ),
  (
    'kumamoto-fukuoka-2026:day:1:place:2',
    'kumamoto-fukuoka-2026:day:1',
    'place-kumamoto-fukuoka-kumamoto-city',
    2,
    '熊本是旅程前半段的基地。首日抵达、次日完整游览，再用第三天上午看美术馆，节奏紧凑但不匆忙。'
  ),
  (
    'kumamoto-fukuoka-2026:day:2:place:1',
    'kumamoto-fukuoka-2026:day:2',
    'place-kumamoto-fukuoka-castle',
    1,
    '白天去了熊本城。城郭、石垣与修复中的城市记忆，构成这趟旅程最明确的历史坐标。'
  ),
  (
    'kumamoto-fukuoka-2026:day:2:place:2',
    'kumamoto-fukuoka-2026:day:2',
    'place-kumamoto-fukuoka-yakoboku',
    2,
    '夜里去了夜香木酒吧。当天还喝到一杯很有熊本印象的咖啡，店名与照片留待之后补上。'
  ),
  (
    'kumamoto-fukuoka-2026:day:3:place:1',
    'kumamoto-fukuoka-2026:day:3',
    'place-kumamoto-fukuoka-museum',
    1,
    '离开熊本前的上午去了熊本美术馆。具体馆名尚未记录，先保留这段以展览为主的安静时间。'
  ),
  (
    'kumamoto-fukuoka-2026:day:3:place:2',
    'kumamoto-fukuoka-2026:day:3',
    'place-kumamoto-fukuoka-hakata',
    2,
    '下午搭车回福冈，抵达博多后正式进入旅程后半段；当天吃的茶泡饭也成为转场日的味觉标点。'
  ),
  (
    'kumamoto-fukuoka-2026:day:4:place:1',
    'kumamoto-fukuoka-2026:day:4',
    'place-kumamoto-fukuoka-tenjin',
    1,
    '天神是福冈段的主要步行区域。商场、地下街与街边店铺密集，很适合不设目标地边逛边停。'
  ),
  (
    'kumamoto-fukuoka-2026:day:4:place:2',
    'kumamoto-fukuoka-2026:day:4',
    'place-kumamoto-fukuoka-coffee-walk',
    2,
    '天神的逛街间隙留给了咖啡。具体店名之后可和照片一起补回，让这段城市散步拥有更清晰的坐标。'
  ),
  (
    'kumamoto-fukuoka-2026:day:5:place:1',
    'kumamoto-fukuoka-2026:day:5',
    'place-kumamoto-fukuoka-cheese-toast',
    1,
    '返程日喝到一杯很出名的咖啡，旁边是一片吐司，上面铺着宽而厚的羊奶芝士。这组味道成为旅程最后、也最具体的记忆。'
  ),
  (
    'kumamoto-fukuoka-2026:day:5:place:2',
    'kumamoto-fukuoka-2026:day:5',
    'place-kumamoto-fukuoka-return',
    2,
    '喝完咖啡后前往福冈机场，从北九州飞回香港，五天四晚的熊本—福冈短旅在这里闭合。'
  );

INSERT INTO day_place_details (day_place_id, sort_order, label, text) VALUES
  ('kumamoto-fukuoka-2026:day:1:place:1', 1, '记录', '2026 年 6 月 18 日从香港飞抵福冈。'),
  ('kumamoto-fukuoka-2026:day:1:place:1', 2, '下一站', '落地后经博多前往熊本。'),
  ('kumamoto-fukuoka-2026:day:1:place:2', 1, '停留', '6 月 18 日晚至 6 月 20 日下午。'),
  ('kumamoto-fukuoka-2026:day:1:place:2', 2, '关键词', '城郭、美术馆、咖啡与夜生活。'),
  ('kumamoto-fukuoka-2026:day:2:place:1', 1, '日期', '2026 年 6 月 19 日白天。'),
  ('kumamoto-fukuoka-2026:day:2:place:1', 2, '印象', '熊本历史与城市修复的核心地点。'),
  ('kumamoto-fukuoka-2026:day:2:place:2', 1, '日期', '2026 年 6 月 19 日晚上。'),
  ('kumamoto-fukuoka-2026:day:2:place:2', 2, '待补', '咖啡店名、酒单与照片。'),
  ('kumamoto-fukuoka-2026:day:3:place:1', 1, '日期', '2026 年 6 月 20 日上午。'),
  ('kumamoto-fukuoka-2026:day:3:place:1', 2, '待补', '美术馆具体名称与展览名称。'),
  ('kumamoto-fukuoka-2026:day:3:place:2', 1, '日期', '2026 年 6 月 20 日下午抵达。'),
  ('kumamoto-fukuoka-2026:day:3:place:2', 2, '晚餐', '茶泡饭。'),
  ('kumamoto-fukuoka-2026:day:4:place:1', 1, '日期', '2026 年 6 月 21 日。'),
  ('kumamoto-fukuoka-2026:day:4:place:1', 2, '方式', '步行为主，边逛边喝咖啡。'),
  ('kumamoto-fukuoka-2026:day:4:place:2', 1, '区域', '福冈天神。'),
  ('kumamoto-fukuoka-2026:day:4:place:2', 2, '待补', '咖啡店名与点单。'),
  ('kumamoto-fukuoka-2026:day:5:place:1', 1, '日期', '2026 年 6 月 22 日。'),
  ('kumamoto-fukuoka-2026:day:5:place:1', 2, '点单', '咖啡与羊奶芝士吐司。'),
  ('kumamoto-fukuoka-2026:day:5:place:1', 3, '待补', '咖啡店名与照片。'),
  ('kumamoto-fukuoka-2026:day:5:place:2', 1, '路线', '福冈 → 香港。'),
  ('kumamoto-fukuoka-2026:day:5:place:2', 2, '状态', '旅程结束，照片待上传。');

INSERT INTO day_tips (day_id, sort_order, text) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '首日核心是完成香港—福冈—熊本的连续转场。'),
  ('kumamoto-fukuoka-2026:day:1', 2, '航班号、车次与住宿名称尚未补入记录。'),
  ('kumamoto-fukuoka-2026:day:2', 1, '熊本城安排在白天，夜香木安排在晚上。'),
  ('kumamoto-fukuoka-2026:day:2', 2, '熊本咖啡店名待根据照片或消费记录补全。'),
  ('kumamoto-fukuoka-2026:day:3', 1, '熊本美术馆具体馆名待确认。'),
  ('kumamoto-fukuoka-2026:day:3', 2, '茶泡饭记录在 6 月 20 日的福冈转场日。'),
  ('kumamoto-fukuoka-2026:day:4', 1, '6 月 21 日按福冈天神漫步日整理。'),
  ('kumamoto-fukuoka-2026:day:4', 2, '当天咖啡店与购物地点可随照片继续补充。'),
  ('kumamoto-fukuoka-2026:day:5', 1, '羊奶芝士吐司是返程日上午最鲜明的餐饮记忆。'),
  ('kumamoto-fukuoka-2026:day:5', 2, '返港航班号与咖啡店名尚待补全。');

INSERT INTO food_guides (day_id, area, note) VALUES
  ('kumamoto-fukuoka-2026:day:1', '福冈机场 · 博多 · 熊本', '首日以连续转场为主，餐饮细节尚未记录。'),
  ('kumamoto-fukuoka-2026:day:2', '熊本市区', '一杯熊本咖啡与夜香木酒吧，组成当天从午后到深夜的味觉线索。'),
  ('kumamoto-fukuoka-2026:day:3', '熊本 · 博多', '当天最明确的一餐是抵达福冈后吃到的茶泡饭。'),
  ('kumamoto-fukuoka-2026:day:4', '福冈天神', '逛天神时停下来喝咖啡，店名与点单待补。'),
  ('kumamoto-fukuoka-2026:day:5', '福冈市区', '返程前的名店咖啡与羊奶芝士吐司，是整趟旅程最后的味觉记忆。');

INSERT INTO food_specialties (day_id, sort_order, name, description) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '转场简餐', '落地日的饮食细节尚未记录，之后可按照片补回。'),
  ('kumamoto-fukuoka-2026:day:2', 1, '熊本咖啡', '旅途中喝到的熊本知名咖啡，具体店名与豆种待补。'),
  ('kumamoto-fukuoka-2026:day:2', 2, '夜香木酒吧', '熊本夜晚的酒吧停留，也是当天行程的收尾。'),
  ('kumamoto-fukuoka-2026:day:3', 1, '茶泡饭', '热茶或高汤淋在米饭与配料上，清爽地结束转场日。'),
  ('kumamoto-fukuoka-2026:day:4', 1, '天神咖啡', '逛街途中喝到的福冈咖啡，具体点单待补。'),
  ('kumamoto-fukuoka-2026:day:5', 1, '羊奶芝士吐司', '宽大片羊奶芝士覆盖吐司，咸香与咖啡构成返程前的组合。'),
  ('kumamoto-fukuoka-2026:day:5', 2, '名店咖啡', '6 月 22 日返港前喝到，具体店名待补。');

INSERT INTO restaurants (id, name, map_query) VALUES
  ('restaurant-kumamoto-fukuoka-transit', '转场途中餐饮', 'Hakata Station restaurants'),
  ('restaurant-kumamoto-fukuoka-coffee', '熊本咖啡店（待补店名）', 'Kumamoto coffee'),
  ('restaurant-kumamoto-fukuoka-yakoboku', '夜香木', 'Yakoboku Kumamoto'),
  ('restaurant-kumamoto-fukuoka-ochazuke', '茶泡饭店（待补店名）', 'ochazuke Hakata Fukuoka'),
  ('restaurant-kumamoto-fukuoka-tenjin-coffee', '天神咖啡店（待补店名）', 'Tenjin coffee Fukuoka'),
  ('restaurant-kumamoto-fukuoka-cheese-toast', '返程咖啡店（待补店名）', 'Fukuoka coffee cheese toast');

INSERT INTO day_restaurants (day_id, restaurant_id, sort_order, note, source_id) VALUES
  ('kumamoto-fukuoka-2026:day:1', 'restaurant-kumamoto-fukuoka-transit', 1, '首日餐饮细节待补', NULL),
  ('kumamoto-fukuoka-2026:day:2', 'restaurant-kumamoto-fukuoka-coffee', 1, '熊本知名咖啡，具体店名待补', NULL),
  ('kumamoto-fukuoka-2026:day:2', 'restaurant-kumamoto-fukuoka-yakoboku', 2, '6 月 19 日晚到访的酒吧', NULL),
  ('kumamoto-fukuoka-2026:day:3', 'restaurant-kumamoto-fukuoka-ochazuke', 1, '6 月 20 日吃的茶泡饭', NULL),
  ('kumamoto-fukuoka-2026:day:4', 'restaurant-kumamoto-fukuoka-tenjin-coffee', 1, '天神漫步时的咖啡，店名待补', NULL),
  ('kumamoto-fukuoka-2026:day:5', 'restaurant-kumamoto-fukuoka-cheese-toast', 1, '名店咖啡与宽大片羊奶芝士吐司，店名待补', NULL);

INSERT INTO media_credits (trip_id, sort_order, subject, attribution, source_url) VALUES
  (
    'kumamoto-fukuoka-2026', 1, '熊本城',
    'Tokyo-Good · CC BY-SA 4.0 · resized',
    'https://commons.wikimedia.org/wiki/File:Kumamoto_Castle_20210724.jpg'
  ),
  (
    'kumamoto-fukuoka-2026', 2, '福冈机场',
    'Drivephotographer · CC0 · resized',
    'https://commons.wikimedia.org/wiki/File:Fukuoka_Airport.jpg'
  ),
  (
    'kumamoto-fukuoka-2026', 3, '熊本下通夜景',
    'Fabimaru · CC BY-SA 3.0 · resized',
    'https://commons.wikimedia.org/wiki/File:Shimot%C5%8Dri_arcade_Kumamoto.JPG'
  ),
  (
    'kumamoto-fukuoka-2026', 4, '熊本县立美术馆',
    'Drivephotographer · CC0 · resized',
    'https://commons.wikimedia.org/wiki/File:Kumamoto_Prefectural_Art_Museum.jpg'
  ),
  (
    'kumamoto-fukuoka-2026', 5, '博多站',
    'そらみみ · CC BY-SA 4.0 · resized',
    'https://commons.wikimedia.org/wiki/File:Hakata_Station_20180306.jpg'
  ),
  (
    'kumamoto-fukuoka-2026', 6, '福冈天神',
    'Hirho · CC BY-SA 4.0 · resized',
    'https://commons.wikimedia.org/wiki/File:Fukuoka_Prefectural_Road_Route_602_view_south_from_Tenjin-Hashiguchi_Intersection_Tenjin-1_and_2-ch%C5%8Dme_Ch%C5%AB%C5%8D-ku_Fukuoka_City_20221229.jpg'
  ),
  (
    'kumamoto-fukuoka-2026', 7, '咖啡与吐司示意图',
    'Kykk wiki · CC0 · resized · illustrative image',
    'https://commons.wikimedia.org/wiki/File:Rich_morning_TakagiCoffee.jpg'
  );
