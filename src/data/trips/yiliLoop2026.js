const images = {
  sayram: "/images/yili-sayram.jpg",
  guozigou: "/images/yili-guozigou.jpg",
  zhaosu: "/images/yili-zhaosu.jpg",
  kalajun: "/images/yili-kalajun.jpg",
};

const toNode = (label, place) => ({ label, place });

const guideSource = {
  label: "原始行程 · 飞书",
  url: "https://my.feishu.cn/wiki/TWRAwCnFoiGOHpkqTvpcknZbn4e?view=vewrwFibeF",
};

const makePlace = (name, type, image, description, details) => ({
  name,
  type,
  image,
  description,
  details,
  sources: [guideSource],
});

const foods = {
  1: {
    area: "香港机场与乌鲁木齐机场",
    note: "跨越午晚餐时段，优先在登机前完成正餐，并随身准备可通过安检的轻量补给。",
    specialties: [
      { name: "新疆拌面", description: "抵达后若仍有营业餐厅，可用热拌面快速补充碳水和蔬菜。" },
      { name: "烤包子", description: "以羊肉和洋葱为馅，适合作为次日取车前的便携早餐。" },
      { name: "酸奶", description: "新疆常见乳制品，长途飞行后可作为清爽补给。" },
    ],
    restaurants: [
      { name: "香港国际机场餐饮", note: "登机前完成正餐", query: "Hong Kong International Airport restaurants" },
      { name: "乌鲁木齐天山机场餐饮", note: "晚到时以仍在营业的店铺为准", query: "乌鲁木齐天山国际机场 餐饮" },
      { name: "酒店周边早餐", note: "次日取车前补足热食", query: "乌鲁木齐砂之船奥莱 早餐" },
    ],
  },
  2: {
    area: "乌鲁木齐至赛里木湖",
    note: "全天约 532 公里，午餐服从赶路节奏；进入湖区前备足饮水、零食和保温衣物。",
    specialties: [
      { name: "高白鲑", description: "赛里木湖周边代表性湖鲜，常见清蒸、香煎和炖煮做法。" },
      { name: "哈萨克奶茶", description: "咸香奶茶适合湖区低温天气，可搭配包尔萨克。" },
      { name: "手抓肉", description: "以清煮羊肉突出肉香，是伊犁牧区常见主菜。" },
    ],
    restaurants: [
      { name: "精河县午餐", note: "高速转场中的正餐备选", query: "精河县 午餐 新疆菜" },
      { name: "赛里木湖高白鲑", note: "入住后就近选择", query: "赛里木湖 高白鲑 餐厅" },
      { name: "赛里木湖酒店餐厅", note: "减少夜间湖区驾车", query: "赛里木湖桔子水晶酒店 餐厅" },
    ],
  },
  3: {
    area: "赛里木湖、果子沟与昭苏",
    note: "离开湖区后路程仍长，果子沟只在安全观景区停靠，晚餐留在昭苏县城。",
    specialties: [
      { name: "纳仁", description: "面片搭配马肉或羊肉和肉汤，是哈萨克族传统主食。" },
      { name: "熏马肉", description: "伊犁常见风味肉制品，可切片食用或搭配面食。" },
      { name: "包尔萨克", description: "油炸面点常与奶茶同食，适合作为途中补给。" },
    ],
    restaurants: [
      { name: "赛里木湖早餐", note: "环湖前完成早餐", query: "赛里木湖 早餐" },
      { name: "昭苏县哈萨克餐厅", note: "抵达后的地方风味晚餐", query: "昭苏县 哈萨克美食" },
      { name: "昭苏县烤肉", note: "晚到时的简洁选择", query: "昭苏县 烤肉" },
    ],
  },
  4: {
    area: "昭苏、夏塔与特克斯",
    note: "夏塔游览时间受区间车和徒步影响，带好路餐，正餐放在返回昭苏或抵达特克斯之后。",
    specialties: [
      { name: "丸子汤", description: "牛肉丸子搭配粉条、冻豆腐和汤底，是伊犁常见暖胃餐食。" },
      { name: "大盘鸡", description: "鸡肉、土豆与宽面组合，适合多人在徒步后分享。" },
      { name: "酸奶疙瘩", description: "便携乳制品，风味酸咸，可少量尝试。" },
    ],
    restaurants: [
      { name: "昭苏县早餐", note: "出发前吃饱并打包路餐", query: "昭苏县 早餐" },
      { name: "夏塔景区餐饮", note: "只作有营业时的补充", query: "夏塔景区 餐厅" },
      { name: "特克斯县丸子汤", note: "抵达民宿后的晚餐", query: "特克斯 丸子汤" },
    ],
  },
  5: {
    area: "特克斯与喀拉峻",
    note: "景区范围大，午餐以简餐为主；游览结束后回特克斯县城用餐。",
    specialties: [
      { name: "羊排揪片子", description: "羊排汤中加入手揪面片，适合草原游览后的晚餐。" },
      { name: "架子肉", description: "羊肉以烤制方式保留肉香，是新疆常见多人分享菜。" },
      { name: "卡瓦斯", description: "谷物发酵饮品，口感酸甜，驾车者应确认是否含酒精。" },
    ],
    restaurants: [
      { name: "特克斯县早餐", note: "进入景区前完成热食", query: "特克斯 早餐" },
      { name: "喀拉峻景区简餐", note: "按游览线路就近解决", query: "喀拉峻景区 餐饮" },
      { name: "特克斯羊排揪片子", note: "返回县城后的晚餐", query: "特克斯 羊排揪片子" },
    ],
  },
  6: {
    area: "恰西、唐布拉与伊宁",
    note: "原计划约 560 公里、驾驶 9 小时，必须自带路餐；若保留恰西，应严格控制停留时间。",
    specialties: [
      { name: "路餐补给", description: "面包、熟食、能量棒和热水比依赖景区餐饮更可靠。" },
      { name: "伊犁熏马肉", description: "抵达伊宁后可作为地方风味正餐的一部分。" },
      { name: "面肺子", description: "以面筋、羊肺等制作的新疆小吃，可在市区少量尝试。" },
    ],
    restaurants: [
      { name: "特克斯早餐与路餐", note: "出发前一次备齐", query: "特克斯 早餐 超市" },
      { name: "尼勒克县简餐", note: "时间允许时的途中补给", query: "尼勒克县 餐厅" },
      { name: "伊宁火车站餐饮", note: "上车前完成晚餐", query: "伊宁火车站 餐饮" },
    ],
  },
  7: {
    area: "乌鲁木齐市区",
    note: "清晨抵达后先寄存行李或办理入住，市区饮食按体力安排，不再增加长距离移动。",
    specialties: [
      { name: "抓饭", description: "羊肉、胡萝卜和米饭焖制，是乌鲁木齐代表性主食之一。" },
      { name: "新疆大盘鸡", description: "鸡肉、土豆和宽面组合，适合作为旅程收尾正餐。" },
      { name: "烤包子", description: "酥脆面皮包裹羊肉洋葱馅，适合早餐或加餐。" },
    ],
    restaurants: [
      { name: "领馆巷", note: "集中寻找烤肉、抓饭和甜品", query: "乌鲁木齐 领馆巷 美食" },
      { name: "和田二街", note: "新疆小吃与夜间用餐备选", query: "乌鲁木齐 和田二街 美食" },
      { name: "乌鲁木齐抓饭", note: "选择评价稳定且顺路的门店", query: "乌鲁木齐 抓饭" },
    ],
  },
  8: {
    area: "乌鲁木齐机场与香港机场",
    note: "09:05 航班需要早起送机，早餐以酒店打包或机场快速餐饮为主。",
    specialties: [
      { name: "烤包子", description: "便于携带的新疆早餐，但应遵守机场安检和入境规定。" },
      { name: "馕", description: "耐储存的面食，可作为早班机前的简单补给。" },
      { name: "新疆干果", description: "可在正规商店选购密封包装作为伴手礼。" },
    ],
    restaurants: [
      { name: "酒店早餐打包", note: "提前一晚确认供应时间", query: "全季乌鲁木齐天山国际机场 早餐" },
      { name: "乌鲁木齐天山机场早餐", note: "安检后按登机时间选择", query: "乌鲁木齐天山国际机场 早餐" },
      { name: "香港国际机场餐饮", note: "落地后再安排正餐", query: "Hong Kong International Airport restaurants" },
    ],
  },
};

export const yiliLoop2026 = {
  id: "yili-loop-2026",
  eyebrow: "YILI · XINJIANG 2026",
  title: "伊犁环线\n8 天 7 晚",
  shortTitle: "新疆伊犁春季环线",
  period: "2026.04.28 — 05.05",
  dateRange: "2026-04-28 至 2026-05-05",
  status: "已归档",
  cover: images.kalajun,
  coverAlt: "喀拉峻草原与天山",
  summary: "从乌鲁木齐自驾进入伊犁，经赛里木湖、果子沟、昭苏、夏塔、特克斯与喀拉峻，再沿恰西、唐布拉抵达伊宁，夜火车返回乌鲁木齐。",
  routeLabel: "乌鲁木齐 → 赛里木湖 → 果子沟 → 昭苏 → 夏塔 → 特克斯 → 喀拉峻 → 唐布拉 → 伊宁",
  tags: ["北疆自驾", "雪山草原", "湖泊与峡谷"],
  metrics: [
    { value: "8", label: "天" },
    { value: "7", label: "晚" },
    { value: "1,707", label: "计划自驾公里" },
    { value: "9", label: "主要路线节点" },
  ],
  overviewMap: {
    embed:
      "https://maps.google.com/maps?saddr=Urumqi+Tianshan+International+Airport&daddr=Sayram+Lake+to%3AGuozigou+Bridge+to%3AZhaosu+County+to%3AXiata+Scenic+Area+to%3ATekes+County+to%3AKalajun+Grassland+to%3AQiaxi+Scenic+Area+to%3ATangbula+Grassland+to%3AYining+Railway+Station&output=embed",
    external:
      "https://www.google.com/maps/dir/Urumqi+Tianshan+International+Airport/Sayram+Lake/Guozigou+Bridge/Zhaosu+County/Xiata+Scenic+Area/Tekes+County/Kalajun+Grassland/Qiaxi+Scenic+Area/Tangbula+Grassland/Yining+Railway+Station",
    nodes: ["乌鲁木齐", "赛里木湖", "果子沟", "昭苏", "夏塔", "特克斯", "喀拉峻", "恰西", "唐布拉", "伊宁"],
  },
  days: [
    {
      day: 1,
      date: "4/28",
      weekday: "TUE",
      title: "深圳 → 香港 → 乌鲁木齐",
      subtitle: "从香港搭乘 12:50 航班前往乌鲁木齐，深夜抵达后由酒店接机。",
      image: images.zhaosu,
      imageAlt: "新疆伊犁山地景观",
      stay: "全季乌鲁木齐天山国际机场砂之船奥莱酒店",
      stayArrival: "乌鲁木齐",
      transport: "陆路接驳 + 航班",
      duration: "08:30 出发，航班 12:50–23:55",
      routeNodes: [
        toNode("深圳", "Shenzhen"),
        toNode("香港国际机场", "Hong Kong International Airport"),
        toNode("乌鲁木齐天山国际机场", "Urumqi Tianshan International Airport"),
      ],
      routeModes: ["陆路前往机场", "航班 12:50–23:55"],
      timeline: [
        { time: "08:30", title: "从深圳出发", note: "前往香港国际机场，预留跨境和安检时间" },
        { time: "12:50", title: "香港起飞", note: "长途航班前完成正餐并补充饮水" },
        { time: "23:55", title: "抵达乌鲁木齐", note: "联系酒店接机，入住后尽快休息" },
      ],
      places: [
        makePlace("香港国际机场", "出发节点", images.zhaosu, "本次伊犁环线从香港机场出发。首日跨境与飞行时间较长，不再安排额外游览。", [
          { label: "安排", text: "08:30 从深圳出发，按国际或地区航班要求预留值机时间。" },
          { label: "建议", text: "托运行李中提前分离充电宝、证件和首晚用品。" },
          { label: "注意", text: "航班时间来自原攻略，实际以出票信息和航司通知为准。" },
        ]),
        makePlace("乌鲁木齐天山国际机场", "环线门户", images.zhaosu, "乌鲁木齐是本次自驾环线的起点与终点。深夜落地后住在机场附近，次日早晨取车向西出发。", [
          { label: "安排", text: "原攻略记录酒店接机，抵达后直接入住。" },
          { label: "建议", text: "睡前确认次日取车地点、证件和首段导航。" },
          { label: "注意", text: "新旧机场名称及接驳位置可能变化，按订单确认航站楼。" },
        ]),
      ],
      tips: ["提前确认香港机场跨境交通方案。", "把驾照、租车订单和保暖层放在随身行李。", "深夜抵达不安排取车，避免疲劳驾驶。"],
      food: foods[1],
    },
    {
      day: 2,
      date: "4/29",
      weekday: "WED",
      title: "乌鲁木齐 → 赛里木湖",
      subtitle: "08:30 取车后向西长途转场，抵达赛里木湖后按原计划逆时针环湖。",
      image: images.sayram,
      imageAlt: "赛里木湖湖岸",
      stay: "赛里木湖桔子水晶酒店",
      stayArrival: "赛里木湖",
      transport: "长途自驾",
      duration: "约 532 公里，驾驶约 7 小时",
      routeNodes: [
        toNode("乌鲁木齐", "Urumqi"),
        toNode("精河", "Jinghe County"),
        toNode("赛里木湖", "Sayram Lake"),
      ],
      routeModes: ["高速自驾约 480 公里", "自驾进入湖区"],
      timeline: [
        { time: "08:30", title: "取车出发", note: "验车、拍照并确认油量和轮胎状态" },
        { time: "白天", title: "乌鲁木齐 → 赛里木湖", note: "约 532 公里，途中只做必要休息和补给" },
        { time: "傍晚", title: "逆时针环湖", note: "按抵达时间选择湖东或湖南岸短线，不勉强走完整圈" },
      ],
      places: [
        makePlace("赛里木湖", "高山湖泊", images.sayram, "赛里木湖位于天山西段，是本次伊犁环线的第一处核心自然景观。原攻略计划用两天衔接环湖和果子沟转场。", [
          { label: "看点", text: "高山湖面、雪山背景和开阔草原构成湖区主要景观。" },
          { label: "建议", text: "逆时针行驶，首日只走与酒店方向顺路的部分湖岸。" },
          { label: "注意", text: "四月底湖区风大温低，开放道路与自驾规则以当日公告为准。" },
        ]),
        makePlace("赛里木湖环湖公路", "景观自驾", images.sayram, "环湖线路停靠点多，但长途抵达后有效游览时间有限。把日落、安全停车和酒店抵达时间放在机位之前。", [
          { label: "看点", text: "不同湖岸角度可观察水色、雪山和草坡的变化。" },
          { label: "建议", text: "只在正规停车区停靠，设置最晚返程时间。" },
          { label: "注意", text: "低温、横风和路面结冰可能影响驾驶，不在道路中央停车拍照。" },
        ]),
      ],
      tips: ["当天车程很长，每两小时安排一次休息。", "进入湖区前加满油并补足饮水。", "准备羽绒层、防风外套和墨镜。"],
      food: foods[2],
    },
    {
      day: 3,
      date: "4/30",
      weekday: "THU",
      title: "赛里木湖 → 果子沟 → 昭苏",
      subtitle: "补完逆时针环湖后穿过果子沟，沿伊犁河谷南下至昭苏。",
      image: images.guozigou,
      imageAlt: "果子沟大桥与山谷",
      stay: "云栖山舍 270 度观景度假民宿（昭苏店）",
      stayArrival: "昭苏县",
      transport: "山地自驾",
      duration: "约 399 公里，驾驶约 6 小时",
      routeNodes: [
        toNode("赛里木湖", "Sayram Lake"),
        toNode("果子沟大桥", "Guozigou Bridge"),
        toNode("昭苏县", "Zhaosu County"),
      ],
      routeModes: ["环湖自驾", "山地公路约 350 公里"],
      timeline: [
        { time: "上午", title: "继续逆时针环湖", note: "补足前一日未完成湖岸，控制在半天内" },
        { time: "中午", title: "穿越果子沟", note: "只在安全观景区停靠，不为拍桥临停" },
        { time: "傍晚", title: "抵达昭苏", note: "入住观景民宿，为夏塔日准备路餐" },
      ],
      places: [
        makePlace("果子沟", "峡谷与桥梁", images.guozigou, "果子沟连接赛里木湖与伊犁河谷，高速公路和大桥穿过狭长山谷，是从高山湖区进入伊犁腹地的标志性路段。", [
          { label: "看点", text: "桥梁、山谷和层叠山体构成道路景观。" },
          { label: "建议", text: "使用正规服务区或观景台拍摄，避免错过出口后临时变道。" },
          { label: "注意", text: "山区天气变化快，雨雪和低云会影响能见度。" },
        ]),
        makePlace("昭苏", "天山牧区", images.zhaosu, "昭苏位于伊犁西南部，草原、河谷和天山雪峰环绕，是前往夏塔的主要落脚地。", [
          { label: "看点", text: "春季山地积雪与逐渐返青的河谷形成强烈季节对比。" },
          { label: "建议", text: "抵达后补足次日早餐、饮水和徒步路餐。" },
          { label: "注意", text: "县域道路距离长，导航时间之外还要留出牲畜穿行和临时限速余量。" },
        ]),
      ],
      tips: ["环湖最晚中午结束，避免压缩昭苏车程。", "果子沟只在明确停车区域停留。", "提前联系昭苏民宿确认晚到接待。"],
      food: foods[3],
    },
    {
      day: 4,
      date: "5/1",
      weekday: "FRI",
      title: "昭苏 → 夏塔 → 特克斯",
      subtitle: "进入夏塔峡谷接近雪山，按开放范围选择区间车、徒步或骑马，傍晚转场特克斯。",
      image: images.zhaosu,
      imageAlt: "昭苏草原与天山",
      stay: "云隐里 Dream 设计师民宿",
      stayArrival: "特克斯县",
      transport: "自驾 + 景区交通 + 徒步",
      duration: "约 156 公里，驾驶约 3 小时",
      routeNodes: [
        toNode("昭苏县", "Zhaosu County"),
        toNode("夏塔景区", "Xiata Scenic Area"),
        toNode("特克斯县", "Tekes County"),
      ],
      routeModes: ["自驾前往夏塔", "自驾转场特克斯"],
      timeline: [
        { time: "早晨", title: "昭苏 → 夏塔", note: "提前确认五一期间是否开放及预约要求" },
        { time: "白天", title: "夏塔峡谷游览", note: "按体力和交通选择将军桥后的徒步深度" },
        { time: "傍晚", title: "夏塔 → 特克斯", note: "结束后转场民宿，避免夜间走山路" },
      ],
      places: [
        makePlace("夏塔", "冰川峡谷", images.zhaosu, "原攻略把夏塔定义为距离雪山很近的高山冰川森林景区，核心体验是区间车之后继续沿峡谷步行接近雪峰。", [
          { label: "看点", text: "雪山、云杉林、河谷和草甸沿峡谷依次展开。" },
          { label: "建议", text: "优先确认区间车终点和返程班次，再决定是否前往将军桥或更深处。" },
          { label: "注意", text: "原攻略估算深段往返需要较长徒步；五月初开放范围和积雪必须现场确认。" },
        ]),
        makePlace("特克斯", "环线基地", images.kalajun, "特克斯县城是前往喀拉峻的重要补给节点，连续住两晚可减少行李搬运，也为景区取舍留出弹性。", [
          { label: "看点", text: "县城道路格局独特，周边连接喀拉峻、琼库什台等草原线路。" },
          { label: "建议", text: "入住后确认次日喀拉峻自驾入口和门票政策。" },
          { label: "注意", text: "节假日住宿和餐饮繁忙，提前与民宿确认停车位置。" },
        ]),
      ],
      tips: ["出发前确认夏塔开放、预约和区间车信息。", "带登山鞋、雨具和备用保暖层。", "设置离开夏塔的最晚时间，避免摸黑去特克斯。"],
      food: foods[4],
    },
    {
      day: 5,
      date: "5/2",
      weekday: "SAT",
      title: "特克斯 → 喀拉峻 → 特克斯",
      subtitle: "从布拉克门票站进入喀拉峻，以立体草原为核心安排全天往返。",
      image: images.kalajun,
      imageAlt: "喀拉峻立体草原与天山",
      stay: "云隐里 Dream 设计师民宿",
      stayArrival: "特克斯县",
      transport: "自驾 + 景区交通",
      duration: "往返约 60 公里，驾驶约 2 小时",
      routeNodes: [
        toNode("特克斯县", "Tekes County"),
        toNode("布拉克门票站", "Kalajun Grassland"),
        toNode("喀拉峻草原", "Kalajun Grassland"),
        toNode("特克斯县", "Tekes County"),
      ],
      routeModes: ["自驾前往景区", "景区交通", "原路返回"],
      timeline: [
        { time: "早晨", title: "前往布拉克门票站", note: "按原攻略导航入口，现场确认东、西喀拉峻开放范围" },
        { time: "白天", title: "喀拉峻草原", note: "优先东喀拉峻立体草原，峡谷线按时间取舍" },
        { time: "傍晚", title: "返回特克斯", note: "不追加琼库什台支线，原民宿续住" },
      ],
      places: [
        makePlace("喀拉峻草原", "立体草原", images.kalajun, "喀拉峻以起伏草原、森林沟谷和远处天山形成的纵深感著称。原攻略将东部草原与西部峡谷作为两类不同体验。", [
          { label: "看点", text: "东喀拉峻侧重立体草原，西喀拉峻侧重峡谷和河谷地貌。" },
          { label: "建议", text: "一天时间优先一个区域，避免为覆盖全部线路频繁换乘。" },
          { label: "注意", text: "原攻略票价为历史记录，出发时应重新核对开放区域和票制。" },
        ]),
        makePlace("布拉克门票站", "自驾入口", images.kalajun, "原攻略明确记录自驾导航至喀拉峻景区布拉克门票站，以避免误入不适合当日线路的入口。", [
          { label: "安排", text: "从特克斯县城出发，往返计划约 60 公里。" },
          { label: "建议", text: "保存入口名称和离线地图，节假日尽早到达。" },
          { label: "注意", text: "是否允许自驾深入景区以当日管理规则为准。" },
        ]),
      ],
      tips: ["东、西喀拉峻只选一个作为主线。", "草原风大，准备防风层和防晒。", "不驶入草场或未开放便道。"],
      food: foods[5],
    },
    {
      day: 6,
      date: "5/3",
      weekday: "SUN",
      title: "特克斯 → 恰西 → 唐布拉 → 伊宁",
      subtitle: "全程最长的山地转场日；恰西为可放弃项，核心是按时抵达伊宁搭乘夜火车。",
      image: images.kalajun,
      imageAlt: "伊犁草原与天山",
      stay: "夜宿列车（伊宁 → 乌鲁木齐）",
      stayArrival: "夜宿列车",
      transport: "长途自驾 + 夜火车",
      duration: "约 560 公里，驾驶约 9 小时；列车 23:05–06:52",
      routeNodes: [
        toNode("特克斯县", "Tekes County"),
        toNode("恰西", "Qiaxi Scenic Area"),
        toNode("唐布拉百里画廊", "Tangbula Grassland"),
        toNode("伊宁火车站", "Yining Railway Station"),
      ],
      routeModes: ["山地自驾", "长距离转场", "夜火车返回乌鲁木齐"],
      timeline: [
        { time: "清晨", title: "从特克斯出发", note: "这是全程最长车程，必须尽早离开" },
        { time: "白天", title: "恰西 / 唐布拉择重点", note: "原攻略已标注恰西考虑放弃，按路况和时间执行" },
        { time: "23:05", title: "伊宁夜火车", note: "预留还车、晚餐、取票和安检时间" },
      ],
      places: [
        makePlace("恰西", "森林草原", images.kalajun, "恰西以草原、云杉和山谷道路组成的“恰西画卷”闻名，但精华环线路况复杂，原攻略已将其标为可放弃项。", [
          { label: "看点", text: "草坡、雪岭云杉和河谷形成更野生的草原层次。" },
          { label: "建议", text: "只有在天气、路况和出发时间都理想时短停，不走完整越野环线。" },
          { label: "注意", text: "复杂路段更适合高底盘车辆和有经验驾驶者。" },
        ]),
        makePlace("唐布拉百里画廊", "沿河景观公路", images.guozigou, "唐布拉沿喀什河谷展开，百里画廊适合自驾串联草原、森林和河流。原攻略还记录了仙女湖与孟克特等需要额外时间的支线。", [
          { label: "看点", text: "河谷公路、雪山、草原与云杉林连续变化。" },
          { label: "建议", text: "本日只走主路观景，仙女湖徒步和孟克特支线不纳入赶火车日。" },
          { label: "注意", text: "必须以伊宁火车发车时间倒推离开节点，不因拍照延误。" },
        ]),
      ],
      tips: ["恰西默认作为可放弃项。", "至少提前两小时抵达伊宁处理还车和进站。", "全天自带路餐，轮流驾驶并定时休息。"],
      food: foods[6],
    },
    {
      day: 7,
      date: "5/4",
      weekday: "MON",
      title: "乌鲁木齐市区",
      subtitle: "06:52 抵达乌鲁木齐，以城市散步、美食和休整完成环线收尾。",
      image: images.guozigou,
      imageAlt: "新疆山谷公路",
      stay: "全季乌鲁木齐天山国际机场砂之船奥莱酒店",
      stayArrival: "乌鲁木齐",
      transport: "市区公共交通 + 步行",
      duration: "夜火车 06:52 抵达，市内轻量游览",
      routeNodes: [
        toNode("乌鲁木齐站", "Urumqi Railway Station"),
        toNode("乌鲁木齐市区", "Urumqi"),
        toNode("机场酒店", "Urumqi Tianshan International Airport"),
      ],
      routeModes: ["市区交通", "机场方向接驳"],
      timeline: [
        { time: "06:52", title: "抵达乌鲁木齐", note: "先寄存行李、洗漱和早餐" },
        { time: "白天", title: "乌鲁木齐市区", note: "按体力选择博物馆、街区或餐饮，不安排远郊" },
        { time: "晚上", title: "入住机场酒店", note: "整理行李并确认次日 09:05 航班送机" },
      ],
      places: [
        makePlace("乌鲁木齐市区", "城市休整", images.guozigou, "长途夜火车后保留完整一天在乌鲁木齐休整。原攻略没有固定景点，适合根据体力在博物馆、市场和餐饮街区之间灵活选择。", [
          { label: "安排", text: "上午以寄存行李和恢复体力为主，下午再开始城市活动。" },
          { label: "建议", text: "只选一处主要参观地和一片餐饮街区。" },
          { label: "注意", text: "热门场馆可能需要预约，开放日以官方信息为准。" },
        ]),
        makePlace("机场酒店", "返程落脚地", images.zhaosu, "最后一晚再次住在天山机场附近，降低早班机误机风险。", [
          { label: "安排", text: "原攻略记录入住同一家全季酒店并由酒店送机。" },
          { label: "建议", text: "当晚完成行李整理、购物打包和航班值机。" },
          { label: "注意", text: "与前台确认最早送机班次和所需预约时间。" },
        ]),
      ],
      tips: ["夜火车后不要安排高强度活动。", "提前预约博物馆等热门场馆。", "睡前确认送机时间、航站楼和证件。"],
      food: foods[7],
    },
    {
      day: 8,
      date: "5/5",
      weekday: "TUE",
      title: "乌鲁木齐 → 香港 → 深圳",
      subtitle: "酒店送机，搭乘 09:05 航班返港，预计 19:05 抵达后返回深圳。",
      image: images.sayram,
      imageAlt: "赛里木湖与天山",
      stay: "返程",
      transport: "酒店送机 + 航班 + 陆路",
      duration: "航班 09:05–19:05",
      routeNodes: [
        toNode("机场酒店", "Urumqi Tianshan International Airport"),
        toNode("乌鲁木齐天山国际机场", "Urumqi Tianshan International Airport"),
        toNode("香港国际机场", "Hong Kong International Airport"),
        toNode("深圳", "Shenzhen"),
      ],
      routeModes: ["酒店送机", "航班 09:05–19:05", "陆路返回深圳"],
      timeline: [
        { time: "清晨", title: "酒店送机", note: "按国际或地区航班提前量抵达机场" },
        { time: "09:05", title: "乌鲁木齐起飞", note: "确认托运行李和伴手礼符合规定" },
        { time: "19:05", title: "抵达香港", note: "完成入境后陆路返回深圳" },
      ],
      places: [
        makePlace("乌鲁木齐天山国际机场", "返程机场", images.zhaosu, "环线在乌鲁木齐机场闭合。早班机意味着当日不再安排景点。", [
          { label: "安排", text: "使用酒店送机，09:05 起飞。" },
          { label: "建议", text: "提前在线值机，并为托运行李保留额外时间。" },
          { label: "注意", text: "航班和航站楼信息以出发日前通知为准。" },
        ]),
        makePlace("香港国际机场", "返程节点", images.sayram, "预计 19:05 抵达香港，完成入境、取行李后返回深圳。", [
          { label: "安排", text: "提前选择机场至深圳的跨境交通。" },
          { label: "建议", text: "给入境排队和晚间交通留出弹性。" },
          { label: "注意", text: "携带食品和农产品时遵守入境申报规定。" },
        ]),
      ],
      tips: ["返程日不增加任何景点。", "提前预约酒店送机。", "核对跨境交通末班时间。"],
      food: foods[8],
    },
  ],
};

export const yiliImageCredits = [
  ["赛里木湖", "Tomskyhaha / Wikimedia Commons · CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:In_Lake_Sayram_Scenic_Spot,_Xinjiang,_China_34.jpg"],
  ["果子沟大桥", "Bru216 / Wikimedia Commons · CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Guozigou_Bridge_-_panoramio.jpg"],
  ["昭苏", "neverdance / Wikimedia Commons · CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Zhaosu,_Ili,_Xinjiang,_China_-_panoramio.jpg"],
  ["喀拉峻草原", "Akira CA / Wikimedia Commons · CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Kalajun_Grassland.jpg"],
];
