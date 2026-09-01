UPDATE trips
SET summary = '6 月 18 日，我从香港飞到福冈，落地后没有停留，直接坐车去了熊本。接下来的两天，我在熊本城、樱之马场城彩苑和熊本县立美术馆之间慢慢走，也记住了胜烈亭的炸猪排、长崎次郎的老派喫茶、珈琲回廊的咖啡香和夜香木的夜晚。回到福冈后，我在天神散步、吃茶泡饭，最后用 Fuglen Fukuoka 的咖啡和挪威棕色羊奶芝士吐司结束这趟北九州短旅。',
    route_label = '香港 → 福冈机场 → 熊本城・城彩苑 → 熊本县立美术馆 → 福冈・天神 → 香港',
    overview_map_embed = 'https://maps.google.com/maps?saddr=Fukuoka+Airport&daddr=Kumamoto+Station+to%3AKatsuretsutei+Shinshigai+Main+Store+to%3AKumamoto+Castle+to%3ASakuranobaba+Josaien+to%3AKumamoto+Prefectural+Museum+of+Art+to%3AHakata+Station+to%3ATenjin+Fukuoka+to%3AFuglen+Fukuoka+to%3AFukuoka+Airport&output=embed',
    overview_map_external = 'https://www.google.com/maps/dir/Fukuoka+Airport/Kumamoto+Station/Katsuretsutei+Shinshigai+Main+Store/Kumamoto+Castle/Sakuranobaba+Josaien/Kumamoto+Prefectural+Museum+of+Art/Hakata+Station/Tenjin+Fukuoka/Fuglen+Fukuoka/Fukuoka+Airport',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'kumamoto-fukuoka-2026';

DELETE FROM trip_overview_nodes
WHERE trip_id = 'kumamoto-fukuoka-2026';

INSERT INTO trip_overview_nodes (trip_id, sort_order, label, place_query) VALUES
  ('kumamoto-fukuoka-2026', 1, '福冈机场', 'Fukuoka Airport'),
  ('kumamoto-fukuoka-2026', 2, '熊本站', 'Kumamoto Station'),
  ('kumamoto-fukuoka-2026', 3, '胜烈亭', 'Katsuretsutei Shinshigai Main Store Kumamoto'),
  ('kumamoto-fukuoka-2026', 4, '熊本城', 'Kumamoto Castle'),
  ('kumamoto-fukuoka-2026', 5, '樱之马场城彩苑', 'Sakuranobaba Josaien'),
  ('kumamoto-fukuoka-2026', 6, '熊本县立美术馆', 'Kumamoto Prefectural Museum of Art'),
  ('kumamoto-fukuoka-2026', 7, '博多站', 'Hakata Station'),
  ('kumamoto-fukuoka-2026', 8, '天神', 'Tenjin Fukuoka'),
  ('kumamoto-fukuoka-2026', 9, 'Fuglen Fukuoka', 'Fuglen Fukuoka'),
  ('kumamoto-fukuoka-2026', 10, '福冈机场', 'Fukuoka Airport');

UPDATE trip_days
SET subtitle = '从香港飞抵福冈后，我一路换乘到熊本，晚上用胜烈亭的炸猪排为旅程开场。',
    image_path = '/images/tonkatsu-illustration.jpg',
    image_alt = '日式炸猪排定食示意图'
WHERE id = 'kumamoto-fukuoka-2026:day:1';

UPDATE trip_days
SET title = '熊本城・城彩苑与咖啡',
    subtitle = '我从熊本城走到樱之马场城彩苑，再以长崎次郎、珈琲回廊和夜香木串起熊本的午后与夜晚。'
WHERE id = 'kumamoto-fukuoka-2026:day:2';

UPDATE trip_days
SET title = '熊本县立美术馆 → 福冈',
    subtitle = '上午我去了熊本县立美术馆，下午搭新干线回到福冈，晚上吃了一碗茶泡饭。'
WHERE id = 'kumamoto-fukuoka-2026:day:3';

UPDATE trip_days
SET title = '天神散步',
    subtitle = '我把这一天留给天神，在商场、地下街和街边店铺之间随意走，也找了间咖啡店坐下来。'
WHERE id = 'kumamoto-fukuoka-2026:day:4';

UPDATE trip_days
SET title = 'Fuglen Fukuoka → 香港',
    subtitle = '返港前，我去 Fuglen Fukuoka 喝咖啡，配一片盖着挪威棕色羊奶芝士的吐司，为旅程收尾。'
WHERE id = 'kumamoto-fukuoka-2026:day:5';

DELETE FROM day_route_nodes
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

DELETE FROM day_route_legs
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

INSERT INTO day_route_nodes (day_id, sort_order, label, place_query) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '香港国际机场', 'Hong Kong International Airport'),
  ('kumamoto-fukuoka-2026:day:1', 2, '福冈机场', 'Fukuoka Airport'),
  ('kumamoto-fukuoka-2026:day:1', 3, '博多站', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:1', 4, '熊本站', 'Kumamoto Station'),
  ('kumamoto-fukuoka-2026:day:1', 5, '胜烈亭', 'Katsuretsutei Shinshigai Main Store Kumamoto'),
  ('kumamoto-fukuoka-2026:day:2', 1, '熊本市区', 'Kumamoto City Center'),
  ('kumamoto-fukuoka-2026:day:2', 2, '熊本城', 'Kumamoto Castle'),
  ('kumamoto-fukuoka-2026:day:2', 3, '樱之马场城彩苑', 'Sakuranobaba Josaien'),
  ('kumamoto-fukuoka-2026:day:2', 4, '长崎次郎喫茶室', 'Nagasaki Jiro Kissashitsu Kumamoto'),
  ('kumamoto-fukuoka-2026:day:2', 5, '珈琲回廊', 'Coffee Gallery Kumamoto'),
  ('kumamoto-fukuoka-2026:day:2', 6, '夜香木', 'Yakoboku Kumamoto'),
  ('kumamoto-fukuoka-2026:day:2', 7, '熊本市区', 'Kumamoto City Center'),
  ('kumamoto-fukuoka-2026:day:3', 1, '熊本市区', 'Kumamoto City Center'),
  ('kumamoto-fukuoka-2026:day:3', 2, '熊本县立美术馆', 'Kumamoto Prefectural Museum of Art'),
  ('kumamoto-fukuoka-2026:day:3', 3, '熊本站', 'Kumamoto Station'),
  ('kumamoto-fukuoka-2026:day:3', 4, '博多站', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:3', 5, '茶泡饭', 'ochazuke Hakata Fukuoka'),
  ('kumamoto-fukuoka-2026:day:4', 1, '福冈市区', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:4', 2, '天神', 'Tenjin Fukuoka'),
  ('kumamoto-fukuoka-2026:day:4', 3, '福冈市区', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:5', 1, '福冈市区', 'Hakata Station'),
  ('kumamoto-fukuoka-2026:day:5', 2, 'Fuglen Fukuoka', 'Fuglen Fukuoka'),
  ('kumamoto-fukuoka-2026:day:5', 3, '福冈机场', 'Fukuoka Airport'),
  ('kumamoto-fukuoka-2026:day:5', 4, '香港国际机场', 'Hong Kong International Airport');

INSERT INTO day_route_legs (day_id, sort_order, mode) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '航班'),
  ('kumamoto-fukuoka-2026:day:1', 2, '地铁 / 巴士'),
  ('kumamoto-fukuoka-2026:day:1', 3, '九州新干线'),
  ('kumamoto-fukuoka-2026:day:1', 4, '市电 + 步行'),
  ('kumamoto-fukuoka-2026:day:2', 1, '市电 + 步行'),
  ('kumamoto-fukuoka-2026:day:2', 2, '步行'),
  ('kumamoto-fukuoka-2026:day:2', 3, '市电 + 步行'),
  ('kumamoto-fukuoka-2026:day:2', 4, '市电 + 步行'),
  ('kumamoto-fukuoka-2026:day:2', 5, '步行'),
  ('kumamoto-fukuoka-2026:day:2', 6, '步行 / 市电'),
  ('kumamoto-fukuoka-2026:day:3', 1, '市电 + 步行'),
  ('kumamoto-fukuoka-2026:day:3', 2, '市电'),
  ('kumamoto-fukuoka-2026:day:3', 3, '九州新干线'),
  ('kumamoto-fukuoka-2026:day:3', 4, '步行 / 地铁'),
  ('kumamoto-fukuoka-2026:day:4', 1, '地铁'),
  ('kumamoto-fukuoka-2026:day:4', 2, '地铁 / 步行'),
  ('kumamoto-fukuoka-2026:day:5', 1, '步行 / 地铁'),
  ('kumamoto-fukuoka-2026:day:5', 2, '地铁'),
  ('kumamoto-fukuoka-2026:day:5', 3, '航班');

DELETE FROM day_timeline_items
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

INSERT INTO day_timeline_items (day_id, sort_order, time_label, title, note) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '白天', '香港 → 福冈', '我从香港国际机场起飞，在福冈落地。'),
  ('kumamoto-fukuoka-2026:day:1', 2, '抵达后', '福冈机场 → 博多站', '入境后我没有停留，直接进城换乘。'),
  ('kumamoto-fukuoka-2026:day:1', 3, '傍晚', '博多 → 熊本', '九州新干线把这趟旅程从福冈带到熊本。'),
  ('kumamoto-fukuoka-2026:day:1', 4, '晚上', '胜烈亭炸猪排', '酥脆的炸衣、厚实的猪排和整套定食，是抵达熊本后的第一顿正式晚餐。'),
  ('kumamoto-fukuoka-2026:day:2', 1, '上午', '熊本城', '我沿着石垣走进城郭，也看见地震后持续修复的痕迹。'),
  ('kumamoto-fukuoka-2026:day:2', 2, '中午', '樱之马场城彩苑', '从熊本城出来后，我顺路走进城彩苑，在仿古街区里继续感受熊本的历史气氛。'),
  ('kumamoto-fukuoka-2026:day:2', 3, '下午', '长崎次郎喫茶室', '老建筑、木窗与安静的喫茶室，让下午的第一杯咖啡带着很强的年代感。'),
  ('kumamoto-fukuoka-2026:day:2', 4, '傍晚', '珈琲回廊', '我又去了珈琲回廊；老町屋与咖啡香叠在一起，是熊本最鲜明的一段记忆。'),
  ('kumamoto-fukuoka-2026:day:2', 5, '晚上', '夜香木', '夜里我去了夜香木，熊本的一天从城郭、咖啡一路延伸到酒吧。'),
  ('kumamoto-fukuoka-2026:day:3', 1, '上午', '熊本县立美术馆', '离开熊本前，我把上午留给熊本县立美术馆。'),
  ('kumamoto-fukuoka-2026:day:3', 2, '下午', '熊本 → 福冈', '看完展后回到熊本站，搭九州新干线前往博多。'),
  ('kumamoto-fukuoka-2026:day:3', 3, '晚上', '茶泡饭', '到了福冈，我用一碗热茶泡饭结束转场日。'),
  ('kumamoto-fukuoka-2026:day:4', 1, '白天', '天神漫步', '我在商场、地下街和街边小店之间闲逛，没有给自己设定必须完成的清单。'),
  ('kumamoto-fukuoka-2026:day:4', 2, '下午', '咖啡时间', '逛累后找间咖啡店坐下来，让福冈的午后慢一点。'),
  ('kumamoto-fukuoka-2026:day:4', 3, '晚上', '福冈夜色', '入夜后继续在市中心走走，再回到住处。'),
  ('kumamoto-fukuoka-2026:day:5', 1, '上午', 'Fuglen Fukuoka', '返港前，我在这里喝了旅程最后一杯咖啡，配上挪威 Brunost 棕色羊奶芝士吐司。'),
  ('kumamoto-fukuoka-2026:day:5', 2, '之后', '前往福冈机场', '喝完咖啡，我搭地铁去机场。'),
  ('kumamoto-fukuoka-2026:day:5', 3, '当天', '福冈 → 香港', '从福冈起飞，这趟五天四晚的北九州短旅回到香港。');

DELETE FROM day_places
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

DELETE FROM places
WHERE id LIKE 'place-kumamoto-fukuoka-%';

INSERT INTO places (id, name, type, image_path) VALUES
  ('place-kumamoto-fukuoka-airport-arrival', '福冈机场', '抵达门户', '/images/fukuoka-airport.jpg'),
  ('place-kumamoto-fukuoka-katsuretsutei', '胜烈亭 新市街本店', '炸猪排', '/images/tonkatsu-illustration.jpg'),
  ('place-kumamoto-fukuoka-castle', '熊本城', '城郭', '/images/kumamoto-castle.jpg'),
  ('place-kumamoto-fukuoka-josaien', '樱之马场 城彩苑', '历史街区', '/images/kumamoto-josaien.jpg'),
  ('place-kumamoto-fukuoka-nagasaki-jiro', '长崎次郎喫茶室', '喫茶店', '/images/coffee-cup-illustration.jpg'),
  ('place-kumamoto-fukuoka-coffee-gallery', '珈琲回廊', '咖啡', '/images/coffee-cup-illustration.jpg'),
  ('place-kumamoto-fukuoka-yakoboku', '夜香木', '酒吧', '/images/kumamoto-shimotori-night.jpg'),
  ('place-kumamoto-fukuoka-museum', '熊本县立美术馆', '美术馆', '/images/kumamoto-museum.jpg'),
  ('place-kumamoto-fukuoka-hakata', '博多', '转场与餐饮', '/images/hakata-station.jpg'),
  ('place-kumamoto-fukuoka-tenjin', '天神', '城市漫步', '/images/fukuoka-tenjin.jpg'),
  ('place-kumamoto-fukuoka-tenjin-coffee', '天神咖啡时间', '咖啡', '/images/coffee-cup-illustration.jpg'),
  ('place-kumamoto-fukuoka-fuglen', 'Fuglen Fukuoka', '咖啡与吐司', '/images/coffee-toast-illustration.jpg'),
  ('place-kumamoto-fukuoka-airport-return', '福冈机场', '返程', '/images/fukuoka-airport.jpg');

INSERT INTO day_places (id, day_id, place_id, sort_order, description) VALUES
  (
    'kumamoto-fukuoka-2026:day:1:place:1',
    'kumamoto-fukuoka-2026:day:1',
    'place-kumamoto-fukuoka-airport-arrival',
    1,
    '6 月 18 日，我从香港飞到福冈。机场不是当天的终点，入境后我马上前往博多站，继续坐新干线南下熊本。'
  ),
  (
    'kumamoto-fukuoka-2026:day:1:place:2',
    'kumamoto-fukuoka-2026:day:1',
    'place-kumamoto-fukuoka-katsuretsutei',
    2,
    '抵达熊本后的第一顿正式晚餐是胜烈亭。炸猪排外层酥脆，切开后仍然厚实多汁，一整套定食很适合安慰奔波了一天的胃。'
  ),
  (
    'kumamoto-fukuoka-2026:day:2:place:1',
    'kumamoto-fukuoka-2026:day:2',
    'place-kumamoto-fukuoka-castle',
    1,
    '第二天白天，我去了熊本城。黑白相间的天守、陡峭石垣和仍在继续的修复工程，让这里不只是一座历史名城，也是一段正在发生的城市记忆。'
  ),
  (
    'kumamoto-fukuoka-2026:day:2:place:2',
    'kumamoto-fukuoka-2026:day:2',
    'place-kumamoto-fukuoka-josaien',
    2,
    '从熊本城下来就是樱之马场城彩苑。仿古建筑把地方小吃、物产和历史展示放在同一片街区里，也让城郭游览自然延伸到更轻松的午间散步。'
  ),
  (
    'kumamoto-fukuoka-2026:day:2:place:3',
    'kumamoto-fukuoka-2026:day:2',
    'place-kumamoto-fukuoka-nagasaki-jiro',
    3,
    '长崎次郎喫茶室藏在一栋老建筑里。木窗、深色家具和缓慢的时间感，让我觉得自己不是简单来喝咖啡，而是短暂坐进了熊本旧日的生活里。'
  ),
  (
    'kumamoto-fukuoka-2026:day:2:place:4',
    'kumamoto-fukuoka-2026:day:2',
    'place-kumamoto-fukuoka-coffee-gallery',
    4,
    '珈琲回廊把町屋空间与咖啡结合得很自然。走进院落后，街道的喧闹突然退远，空气里只剩木头、庭院和烘焙咖啡的香气。'
  ),
  (
    'kumamoto-fukuoka-2026:day:2:place:5',
    'kumamoto-fukuoka-2026:day:2',
    'place-kumamoto-fukuoka-yakoboku',
    5,
    '晚上去了夜香木。白天的城郭与老街在这里切换成昏暗灯光和酒吧节奏，也让熊本这一天拥有了很完整的昼夜变化。'
  ),
  (
    'kumamoto-fukuoka-2026:day:3:place:1',
    'kumamoto-fukuoka-2026:day:3',
    'place-kumamoto-fukuoka-museum',
    1,
    '6 月 20 日上午，我去了熊本县立美术馆。它就在熊本城一带，安静的展厅让离开熊本前的最后半天从城市散步转入更沉静的观看。'
  ),
  (
    'kumamoto-fukuoka-2026:day:3:place:2',
    'kumamoto-fukuoka-2026:day:3',
    'place-kumamoto-fukuoka-hakata',
    2,
    '下午我从熊本回到福冈。博多站重新成为交通中心，晚上吃到的茶泡饭清淡温热，刚好替长途移动的一天收尾。'
  ),
  (
    'kumamoto-fukuoka-2026:day:4:place:1',
    'kumamoto-fukuoka-2026:day:4',
    'place-kumamoto-fukuoka-tenjin',
    1,
    '6 月 21 日，我在天神闲逛。商场、地下街和街边店铺密集相连，不用规划路线，跟着感兴趣的橱窗走就足够。'
  ),
  (
    'kumamoto-fukuoka-2026:day:4:place:2',
    'kumamoto-fukuoka-2026:day:4',
    'place-kumamoto-fukuoka-tenjin-coffee',
    2,
    '逛累后，我在天神找地方喝了杯咖啡。没有景点清单，也不用赶车，这段普通的休息反而很像我记忆里的福冈。'
  ),
  (
    'kumamoto-fukuoka-2026:day:5:place:1',
    'kumamoto-fukuoka-2026:day:5',
    'place-kumamoto-fukuoka-fuglen',
    1,
    '返港前，我去了 Fuglen Fukuoka。咖啡旁边是一片吐司，上面覆盖着宽宽的 Brunost；这种挪威棕色羊奶芝士带着焦糖般的甜香，成了整趟旅程最后、也最鲜明的一口。'
  ),
  (
    'kumamoto-fukuoka-2026:day:5:place:2',
    'kumamoto-fukuoka-2026:day:5',
    'place-kumamoto-fukuoka-airport-return',
    2,
    '喝完咖啡，我搭地铁前往福冈机场。五天里从机场到熊本、再从福冈回到机场，北九州短旅在这里完整闭合。'
  );

INSERT INTO day_place_details (day_place_id, sort_order, label, text) VALUES
  ('kumamoto-fukuoka-2026:day:1:place:1', 1, '日期', '2026 年 6 月 18 日'),
  ('kumamoto-fukuoka-2026:day:1:place:1', 2, '路线', '香港 → 福冈 → 熊本'),
  ('kumamoto-fukuoka-2026:day:1:place:2', 1, '点单', '炸猪排定食'),
  ('kumamoto-fukuoka-2026:day:1:place:2', 2, '印象', '抵达熊本后的第一顿正式晚餐'),
  ('kumamoto-fukuoka-2026:day:2:place:1', 1, '看点', '天守、石垣与震后修复'),
  ('kumamoto-fukuoka-2026:day:2:place:1', 2, '日期', '2026 年 6 月 19 日'),
  ('kumamoto-fukuoka-2026:day:2:place:2', 1, '位置', '熊本城南侧'),
  ('kumamoto-fukuoka-2026:day:2:place:2', 2, '内容', '历史展示、地方物产与饮食街区'),
  ('kumamoto-fukuoka-2026:day:2:place:3', 1, '氛围', '老建筑里的昭和喫茶感'),
  ('kumamoto-fukuoka-2026:day:2:place:3', 2, '记忆', '木窗边的一杯咖啡'),
  ('kumamoto-fukuoka-2026:day:2:place:4', 1, '空间', '町屋、庭院与咖啡烘焙'),
  ('kumamoto-fukuoka-2026:day:2:place:4', 2, '记忆', '熊本咖啡散步的重要一站'),
  ('kumamoto-fukuoka-2026:day:2:place:5', 1, '时段', '6 月 19 日晚上'),
  ('kumamoto-fukuoka-2026:day:2:place:5', 2, '氛围', '用酒吧结束熊本的一天'),
  ('kumamoto-fukuoka-2026:day:3:place:1', 1, '馆名', '熊本县立美术馆'),
  ('kumamoto-fukuoka-2026:day:3:place:1', 2, '日期', '2026 年 6 月 20 日上午'),
  ('kumamoto-fukuoka-2026:day:3:place:2', 1, '抵达', '6 月 20 日下午'),
  ('kumamoto-fukuoka-2026:day:3:place:2', 2, '晚餐', '茶泡饭'),
  ('kumamoto-fukuoka-2026:day:4:place:1', 1, '日期', '2026 年 6 月 21 日'),
  ('kumamoto-fukuoka-2026:day:4:place:1', 2, '方式', '商场、地下街与街巷步行'),
  ('kumamoto-fukuoka-2026:day:4:place:2', 1, '区域', '福冈天神'),
  ('kumamoto-fukuoka-2026:day:4:place:2', 2, '节奏', '逛街中途停下来喝咖啡'),
  ('kumamoto-fukuoka-2026:day:5:place:1', 1, '日期', '2026 年 6 月 22 日'),
  ('kumamoto-fukuoka-2026:day:5:place:1', 2, '点单', '咖啡与 Brunost 棕色羊奶芝士吐司'),
  ('kumamoto-fukuoka-2026:day:5:place:2', 1, '路线', '福冈 → 香港'),
  ('kumamoto-fukuoka-2026:day:5:place:2', 2, '结束', '从福冈机场返港');

DELETE FROM day_tips
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

INSERT INTO day_tips (day_id, sort_order, text) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '福冈只是落地点，熊本才是这趟旅程真正开始的地方。'),
  ('kumamoto-fukuoka-2026:day:1', 2, '胜烈亭的炸猪排让连续换乘后的第一晚立刻有了满足感。'),
  ('kumamoto-fukuoka-2026:day:2', 1, '熊本城与城彩苑适合连在一起走，历史气氛从城郭自然延伸到街区。'),
  ('kumamoto-fukuoka-2026:day:2', 2, '长崎次郎与珈琲回廊风格不同，却都让熊本的咖啡记忆带上了老建筑的质感。'),
  ('kumamoto-fukuoka-2026:day:3', 1, '熊本县立美术馆是离开熊本前最安静的一站。'),
  ('kumamoto-fukuoka-2026:day:3', 2, '抵达福冈后的茶泡饭简单温热，很适合转场日。'),
  ('kumamoto-fukuoka-2026:day:4', 1, '天神不需要严格路线，随意逛反而最舒服。'),
  ('kumamoto-fukuoka-2026:day:4', 2, '咖啡时间让这一天从购物行程变成了真正的城市漫步。'),
  ('kumamoto-fukuoka-2026:day:5', 1, 'Fuglen Fukuoka 的咖啡与 Brunost 吐司是返程前最好的句号。'),
  ('kumamoto-fukuoka-2026:day:5', 2, '从市区去福冈机场很快，最后一个上午仍然可以从容喝完咖啡。');

DELETE FROM day_restaurants
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

DELETE FROM restaurants
WHERE id LIKE 'restaurant-kumamoto-fukuoka-%';

DELETE FROM food_specialties
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

DELETE FROM food_guides
WHERE day_id LIKE 'kumamoto-fukuoka-2026:day:%';

INSERT INTO food_guides (day_id, area, note) VALUES
  ('kumamoto-fukuoka-2026:day:1', '熊本新市街', '抵达熊本后的第一顿正式晚餐，我选了胜烈亭的炸猪排。'),
  ('kumamoto-fukuoka-2026:day:2', '熊本市区', '长崎次郎、珈琲回廊与夜香木，把熊本的下午和夜晚连成一条完整的味觉路线。'),
  ('kumamoto-fukuoka-2026:day:3', '熊本 · 博多', '离开熊本、抵达福冈后，我用一碗茶泡饭结束当天。'),
  ('kumamoto-fukuoka-2026:day:4', '福冈天神', '逛天神时停下来喝咖啡，城市散步也因此多了一段安静的空白。'),
  ('kumamoto-fukuoka-2026:day:5', 'Fuglen Fukuoka', '返程前的咖啡与 Brunost 棕色羊奶芝士吐司，是这趟旅程最后的味觉记忆。');

INSERT INTO food_specialties (day_id, sort_order, name, description) VALUES
  ('kumamoto-fukuoka-2026:day:1', 1, '胜烈亭炸猪排', '酥脆炸衣包裹厚实猪排，搭配米饭、卷心菜和味噌汤组成完整定食。'),
  ('kumamoto-fukuoka-2026:day:2', 1, '长崎次郎咖啡', '在老建筑喫茶室里慢慢喝咖啡，重点同样在空间与时间感。'),
  ('kumamoto-fukuoka-2026:day:2', 2, '珈琲回廊', '町屋院落与烘焙咖啡香结合，是熊本咖啡散步里最有辨识度的一站。'),
  ('kumamoto-fukuoka-2026:day:2', 3, '夜香木', '从咖啡切换到酒吧，让熊本的一天延续到夜里。'),
  ('kumamoto-fukuoka-2026:day:3', 1, '茶泡饭', '热茶或高汤淋在米饭与配料上，清爽地结束转场日。'),
  ('kumamoto-fukuoka-2026:day:4', 1, '天神咖啡', '逛街中途的一杯咖啡，让福冈的午后慢下来。'),
  ('kumamoto-fukuoka-2026:day:5', 1, 'Brunost 吐司', '挪威棕色羊奶芝士覆盖吐司，带着近似焦糖的甜香，与咖啡很搭。'),
  ('kumamoto-fukuoka-2026:day:5', 2, 'Fuglen 咖啡', '旅程最后一杯咖啡，也把北欧风味留在了福冈的记忆里。');

INSERT INTO restaurants (id, name, map_query) VALUES
  ('restaurant-kumamoto-fukuoka-katsuretsutei', '胜烈亭 新市街本店', 'Katsuretsutei Shinshigai Main Store Kumamoto'),
  ('restaurant-kumamoto-fukuoka-nagasaki-jiro', '长崎次郎喫茶室', 'Nagasaki Jiro Kissashitsu Kumamoto'),
  ('restaurant-kumamoto-fukuoka-coffee-gallery', '珈琲回廊', 'Coffee Gallery Kumamoto'),
  ('restaurant-kumamoto-fukuoka-yakoboku', '夜香木', 'Yakoboku Kumamoto'),
  ('restaurant-kumamoto-fukuoka-ochazuke', '福冈茶泡饭', 'ochazuke Hakata Fukuoka'),
  ('restaurant-kumamoto-fukuoka-tenjin-coffee', '天神咖啡时间', 'coffee Tenjin Fukuoka'),
  ('restaurant-kumamoto-fukuoka-fuglen', 'Fuglen Fukuoka', 'Fuglen Fukuoka');

INSERT INTO day_restaurants (day_id, restaurant_id, sort_order, note, source_id) VALUES
  ('kumamoto-fukuoka-2026:day:1', 'restaurant-kumamoto-fukuoka-katsuretsutei', 1, '抵达熊本后的炸猪排定食', NULL),
  ('kumamoto-fukuoka-2026:day:2', 'restaurant-kumamoto-fukuoka-nagasaki-jiro', 1, '老建筑里的喫茶室与咖啡', NULL),
  ('kumamoto-fukuoka-2026:day:2', 'restaurant-kumamoto-fukuoka-coffee-gallery', 2, '町屋院落、烘焙香与咖啡', NULL),
  ('kumamoto-fukuoka-2026:day:2', 'restaurant-kumamoto-fukuoka-yakoboku', 3, '用酒吧结束熊本的一天', NULL),
  ('kumamoto-fukuoka-2026:day:3', 'restaurant-kumamoto-fukuoka-ochazuke', 1, '抵达福冈后的热茶泡饭', NULL),
  ('kumamoto-fukuoka-2026:day:4', 'restaurant-kumamoto-fukuoka-tenjin-coffee', 1, '天神散步中途的一杯咖啡', NULL),
  ('kumamoto-fukuoka-2026:day:5', 'restaurant-kumamoto-fukuoka-fuglen', 1, '咖啡与 Brunost 棕色羊奶芝士吐司', NULL);

INSERT OR IGNORE INTO content_sources (id, label, url) VALUES
  ('source-kumamoto-fukuoka-airport-map', 'Google Maps · 福冈机场', 'https://www.google.com/maps/search/?api=1&query=Fukuoka+Airport'),
  ('source-kumamoto-fukuoka-katsuretsutei-map', 'Google Maps · 胜烈亭', 'https://www.google.com/maps/search/?api=1&query=Katsuretsutei+Shinshigai+Main+Store+Kumamoto'),
  ('source-kumamoto-fukuoka-castle-map', 'Google Maps · 熊本城', 'https://www.google.com/maps/search/?api=1&query=Kumamoto+Castle'),
  ('source-kumamoto-fukuoka-josaien-map', 'Google Maps · 樱之马场城彩苑', 'https://www.google.com/maps/search/?api=1&query=Sakuranobaba+Josaien'),
  ('source-kumamoto-fukuoka-nagasaki-jiro-map', 'Google Maps · 长崎次郎喫茶室', 'https://www.google.com/maps/search/?api=1&query=Nagasaki+Jiro+Kissashitsu+Kumamoto'),
  ('source-kumamoto-fukuoka-coffee-gallery-map', 'Google Maps · 珈琲回廊', 'https://www.google.com/maps/search/?api=1&query=Coffee+Gallery+Kumamoto'),
  ('source-kumamoto-fukuoka-yakoboku-map', 'Google Maps · 夜香木', 'https://www.google.com/maps/search/?api=1&query=Yakoboku+Kumamoto'),
  ('source-kumamoto-fukuoka-museum-map', 'Google Maps · 熊本县立美术馆', 'https://www.google.com/maps/search/?api=1&query=Kumamoto+Prefectural+Museum+of+Art'),
  ('source-kumamoto-fukuoka-hakata-map', 'Google Maps · 博多站', 'https://www.google.com/maps/search/?api=1&query=Hakata+Station'),
  ('source-kumamoto-fukuoka-tenjin-map', 'Google Maps · 天神', 'https://www.google.com/maps/search/?api=1&query=Tenjin+Fukuoka'),
  ('source-kumamoto-fukuoka-fuglen-map', 'Google Maps · Fuglen Fukuoka', 'https://www.google.com/maps/search/?api=1&query=Fuglen+Fukuoka');

INSERT INTO day_place_sources (day_place_id, source_id, sort_order) VALUES
  ('kumamoto-fukuoka-2026:day:1:place:1', 'source-kumamoto-fukuoka-airport-map', 1),
  ('kumamoto-fukuoka-2026:day:1:place:2', 'source-kumamoto-fukuoka-katsuretsutei-map', 1),
  ('kumamoto-fukuoka-2026:day:2:place:1', 'source-kumamoto-fukuoka-castle-map', 1),
  ('kumamoto-fukuoka-2026:day:2:place:2', 'source-kumamoto-fukuoka-josaien-map', 1),
  ('kumamoto-fukuoka-2026:day:2:place:3', 'source-kumamoto-fukuoka-nagasaki-jiro-map', 1),
  ('kumamoto-fukuoka-2026:day:2:place:4', 'source-kumamoto-fukuoka-coffee-gallery-map', 1),
  ('kumamoto-fukuoka-2026:day:2:place:5', 'source-kumamoto-fukuoka-yakoboku-map', 1),
  ('kumamoto-fukuoka-2026:day:3:place:1', 'source-kumamoto-fukuoka-museum-map', 1),
  ('kumamoto-fukuoka-2026:day:3:place:2', 'source-kumamoto-fukuoka-hakata-map', 1),
  ('kumamoto-fukuoka-2026:day:4:place:1', 'source-kumamoto-fukuoka-tenjin-map', 1),
  ('kumamoto-fukuoka-2026:day:4:place:2', 'source-kumamoto-fukuoka-tenjin-map', 1),
  ('kumamoto-fukuoka-2026:day:5:place:1', 'source-kumamoto-fukuoka-fuglen-map', 1),
  ('kumamoto-fukuoka-2026:day:5:place:2', 'source-kumamoto-fukuoka-airport-map', 1);

DELETE FROM media_credits
WHERE trip_id = 'kumamoto-fukuoka-2026';

INSERT INTO media_credits (trip_id, sort_order, subject, attribution, source_url) VALUES
  ('kumamoto-fukuoka-2026', 1, '熊本城', 'Tokyo-Good · CC BY-SA 4.0 · resized', 'https://commons.wikimedia.org/wiki/File:Kumamoto_Castle_20210724.jpg'),
  ('kumamoto-fukuoka-2026', 2, '福冈机场', 'Drivephotographer · CC0 · resized', 'https://commons.wikimedia.org/wiki/File:Fukuoka_Airport.jpg'),
  ('kumamoto-fukuoka-2026', 3, '熊本下通夜景', 'Fabimaru · CC BY-SA 3.0 · resized', 'https://commons.wikimedia.org/wiki/File:Shimot%C5%8Dri_arcade_Kumamoto.JPG'),
  ('kumamoto-fukuoka-2026', 4, '熊本县立美术馆', 'Drivephotographer · CC0 · resized', 'https://commons.wikimedia.org/wiki/File:Kumamoto_Prefectural_Art_Museum.jpg'),
  ('kumamoto-fukuoka-2026', 5, '博多站', 'そらみみ · CC BY-SA 4.0 · resized', 'https://commons.wikimedia.org/wiki/File:Hakata_Station_20180306.jpg'),
  ('kumamoto-fukuoka-2026', 6, '福冈天神', 'Hirho · CC BY-SA 4.0 · resized', 'https://commons.wikimedia.org/wiki/File:Fukuoka_Prefectural_Road_Route_602_view_south_from_Tenjin-Hashiguchi_Intersection_Tenjin-1_and_2-ch%C5%8Dme_Ch%C5%AB%C5%8D-ku_Fukuoka_City_20221229.jpg'),
  ('kumamoto-fukuoka-2026', 7, '咖啡与吐司示意图', 'Kykk wiki · CC0 · resized · illustrative image', 'https://commons.wikimedia.org/wiki/File:Rich_morning_TakagiCoffee.jpg'),
  ('kumamoto-fukuoka-2026', 8, '樱之马场城彩苑', 'Jdjuice · CC BY-SA 4.0 · resized', 'https://commons.wikimedia.org/wiki/File:Johsaien_57T3202small.jpg'),
  ('kumamoto-fukuoka-2026', 9, '炸猪排定食示意图', 'Ocdp · CC0 · resized · illustrative image', 'https://commons.wikimedia.org/wiki/File:Tonkatsu_001.jpg'),
  ('kumamoto-fukuoka-2026', 10, '咖啡示意图', 'Julius Schorzman · CC BY-SA 2.0 · resized · illustrative image', 'https://commons.wikimedia.org/wiki/File:A_small_cup_of_coffee.JPG');
