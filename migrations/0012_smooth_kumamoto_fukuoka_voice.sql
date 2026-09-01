UPDATE trips
SET summary = '6 月 18 日从香港飞到福冈，落地后没有停留，直接坐车去了熊本。接下来的两天，在熊本城、樱之马场城彩苑和熊本县立美术馆之间慢慢走，也记住了胜烈亭的炸猪排、长崎次郎的老派喫茶、珈琲回廊的咖啡香和夜香木的夜晚。回到福冈后，在天神散步、吃茶泡饭，最后用 Fuglen Fukuoka 的咖啡和挪威棕色羊奶芝士吐司结束这趟北九州短旅。',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'kumamoto-fukuoka-2026';

UPDATE trip_days
SET subtitle = '从香港飞抵福冈后，一路换乘到熊本，晚上用胜烈亭的炸猪排为旅程开场。'
WHERE id = 'kumamoto-fukuoka-2026:day:1';

UPDATE trip_days
SET subtitle = '从熊本城走到樱之马场城彩苑，再以长崎次郎、珈琲回廊和夜香木串起熊本的午后与夜晚。'
WHERE id = 'kumamoto-fukuoka-2026:day:2';

UPDATE trip_days
SET subtitle = '上午去了熊本县立美术馆，下午搭新干线回到福冈，晚上吃了一碗茶泡饭。'
WHERE id = 'kumamoto-fukuoka-2026:day:3';

UPDATE trip_days
SET subtitle = '把这一天留给天神，在商场、地下街和街边店铺之间随意走，也找了间咖啡店坐下来。'
WHERE id = 'kumamoto-fukuoka-2026:day:4';

UPDATE trip_days
SET subtitle = '返港前去 Fuglen Fukuoka 喝咖啡，配一片盖着挪威棕色羊奶芝士的吐司，为旅程收尾。'
WHERE id = 'kumamoto-fukuoka-2026:day:5';

UPDATE day_timeline_items
SET note = CASE sort_order
  WHEN 1 THEN '从香港国际机场起飞，在福冈落地。'
  WHEN 2 THEN '入境后没有停留，直接进城换乘。'
  ELSE note
END
WHERE day_id = 'kumamoto-fukuoka-2026:day:1'
  AND sort_order IN (1, 2);

UPDATE day_timeline_items
SET note = CASE sort_order
  WHEN 1 THEN '沿着石垣走进城郭，也看见地震后持续修复的痕迹。'
  WHEN 2 THEN '从熊本城出来后，顺路走进城彩苑，在仿古街区里继续感受熊本的历史气氛。'
  WHEN 4 THEN '又去了珈琲回廊；老町屋与咖啡香叠在一起，是熊本最鲜明的一段记忆。'
  WHEN 5 THEN '夜里去了夜香木，熊本的一天从城郭、咖啡一路延伸到酒吧。'
  ELSE note
END
WHERE day_id = 'kumamoto-fukuoka-2026:day:2'
  AND sort_order IN (1, 2, 4, 5);

UPDATE day_timeline_items
SET note = CASE sort_order
  WHEN 1 THEN '离开熊本前，把上午留给熊本县立美术馆。'
  WHEN 3 THEN '到了福冈，用一碗热茶泡饭结束转场日。'
  ELSE note
END
WHERE day_id = 'kumamoto-fukuoka-2026:day:3'
  AND sort_order IN (1, 3);

UPDATE day_timeline_items
SET note = '在商场、地下街和街边小店之间闲逛，没有设定必须完成的清单。'
WHERE day_id = 'kumamoto-fukuoka-2026:day:4'
  AND sort_order = 1;

UPDATE day_timeline_items
SET note = CASE sort_order
  WHEN 1 THEN '返港前，在这里喝了旅程最后一杯咖啡，配上挪威 Brunost 棕色羊奶芝士吐司。'
  WHEN 2 THEN '喝完咖啡，搭地铁去机场。'
  ELSE note
END
WHERE day_id = 'kumamoto-fukuoka-2026:day:5'
  AND sort_order IN (1, 2);

UPDATE day_places
SET description = '6 月 18 日从香港飞到福冈。机场不是当天的终点，入境后马上前往博多站，继续坐新干线南下熊本。'
WHERE id = 'kumamoto-fukuoka-2026:day:1:place:1';

UPDATE day_places
SET description = '第二天白天去了熊本城。黑白相间的天守、陡峭石垣和仍在继续的修复工程，让这里不只是一座历史名城，也是一段正在发生的城市记忆。'
WHERE id = 'kumamoto-fukuoka-2026:day:2:place:1';

UPDATE day_places
SET description = '长崎次郎喫茶室藏在一栋老建筑里。木窗、深色家具和缓慢的时间感，让喝咖啡这件事像是短暂坐进了熊本旧日的生活里。'
WHERE id = 'kumamoto-fukuoka-2026:day:2:place:3';

UPDATE day_places
SET description = '6 月 20 日上午去了熊本县立美术馆。它就在熊本城一带，安静的展厅让离开熊本前的最后半天从城市散步转入更沉静的观看。'
WHERE id = 'kumamoto-fukuoka-2026:day:3:place:1';

UPDATE day_places
SET description = '下午从熊本回到福冈。博多站重新成为交通中心，晚上吃到的茶泡饭清淡温热，刚好替长途移动的一天收尾。'
WHERE id = 'kumamoto-fukuoka-2026:day:3:place:2';

UPDATE day_places
SET description = '6 月 21 日在天神闲逛。商场、地下街和街边店铺密集相连，不用规划路线，跟着感兴趣的橱窗走就足够。'
WHERE id = 'kumamoto-fukuoka-2026:day:4:place:1';

UPDATE day_places
SET description = '逛累后，在天神找地方喝了杯咖啡。没有景点清单，也不用赶车，这段普通的休息反而成了福冈记忆里很自然的一部分。'
WHERE id = 'kumamoto-fukuoka-2026:day:4:place:2';

UPDATE day_places
SET description = '返港前去了 Fuglen Fukuoka。咖啡旁边是一片吐司，上面覆盖着宽宽的 Brunost；这种挪威棕色羊奶芝士带着焦糖般的甜香，成了整趟旅程最后、也最鲜明的一口。'
WHERE id = 'kumamoto-fukuoka-2026:day:5:place:1';

UPDATE day_places
SET description = '喝完咖啡，搭地铁前往福冈机场。五天里从机场到熊本、再从福冈回到机场，北九州短旅在这里完整闭合。'
WHERE id = 'kumamoto-fukuoka-2026:day:5:place:2';

UPDATE food_guides
SET note = '抵达熊本后的第一顿正式晚餐，选了胜烈亭的炸猪排。'
WHERE day_id = 'kumamoto-fukuoka-2026:day:1';

UPDATE food_guides
SET note = '离开熊本、抵达福冈后，用一碗茶泡饭结束当天。'
WHERE day_id = 'kumamoto-fukuoka-2026:day:3';
