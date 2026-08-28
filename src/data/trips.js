const images = {
  morioka: "/images/morioka.jpg",
  aomori: "/images/aomori-nebuta.jpg",
  hirosakiCastle: "/images/hirosaki-castle.jpg",
  towada: "/images/lake-towada.jpg",
  oirase: "/images/oirase.jpg",
  matsushima: "/images/matsushima.jpg",
  sendai: "/images/sendai.jpg",
  sendaiStation: "/images/sendai-station.jpg",
  sendaiStationInterior: "/images/sendai-station-interior.jpg",
  sendaiAirport: "/images/sendai-airport.jpg",
  moriokaStation: "/images/morioka-station.jpg",
  iwateBank: "/images/iwate-bank.jpg",
  warasse: "/images/warasse.jpg",
  aomoriBay: "/images/aomori-bay.jpg",
  zuiganji: "/images/zuiganji.jpg",
  oiraseHero: "/images/oirase-hero.jpg",
  matsushimaHero: "/images/matsushima-hero.jpg",
};

const toNode = (label, place) => ({ label, place });

const foods = {
  1: {
    area: "盛冈站前",
    note: "抵达日以车站附近为主，避免为晚餐增加跨区移动。",
    specialties: [
      { name: "盛冈冷面", description: "弹性较强的面条配清爽牛骨汤，常以泡菜和水果调整辣度与甜度。" },
      { name: "じゃじゃ麺", description: "粗面拌肉味噌、黄瓜和葱，吃到后段可加入鸡蛋与面汤做成蛋汤。" },
      { name: "福田面包", description: "盛冈本地的软面包品牌，适合作为次日早餐或铁路途中补给。" },
    ],
    restaurants: [
      { name: "ぴょんぴょん舎 盛岡駅前店", note: "盛冈冷面，车站前用餐方便", query: "Pyon Pyon Sha Morioka Ekimae" },
      { name: "盛岡じゃじゃ麺 HOT JaJa", note: "盛冈站内的炸酱面选择", query: "HOT JaJa Morioka Station" },
      { name: "福田パン 盛岡駅店", note: "当地面包与便携早餐", query: "Fukuda Pan Morioka Station" },
    ],
  },
  2: {
    area: "盛冈市中心",
    note: "三大面食份量差异较大，碗子荞麦面更适合作为当天主要一餐。",
    specialties: [
      { name: "碗子荞麦面", description: "服务员不断续入小碗荞麦面，是岩手具有代表性的饮食体验。" },
      { name: "盛冈冷面", description: "源于盛冈烧肉文化，汤底、泡菜与面条口感是主要特色。" },
      { name: "じゃじゃ麺", description: "以肉味噌拌面为主体，吃法通常包含最后的鸡蛋汤步骤。" },
    ],
    restaurants: [
      { name: "東家 本店", note: "碗子荞麦面，靠近市中心景点", query: "Azumaya Honten Morioka" },
      { name: "白龍 本店", note: "盛冈炸酱面的代表老店", query: "Pairon Honten Morioka" },
      { name: "盛楼閣", note: "盛冈站前的冷面与烧肉", query: "Seirokaku Morioka" },
    ],
  },
  3: {
    area: "青森站与青森湾",
    note: "鱼菜中心午餐较早结束，拉面和居酒屋更适合傍晚。",
    specialties: [
      { name: "のっけ丼", description: "在青森鱼菜中心购买餐券，自选刺身、贝类和鱼卵组合海鲜饭。" },
      { name: "味噌咖喱牛奶拉面", description: "味噌、咖喱、牛奶和黄油形成浓郁汤底，是青森市的地方拉面。" },
      { name: "帆立与苹果", description: "陆奥湾扇贝和青森苹果可分别作为正餐与甜点选择。" },
    ],
    restaurants: [
      { name: "青森魚菜センター", note: "自选海鲜组成のっけ丼", query: "Aomori Gyosai Center Nokkedon" },
      { name: "お食事処 おさない", note: "扇贝料理与当地定食", query: "Osanai Shokudo Aomori" },
      { name: "味の札幌 大西", note: "味噌咖喱牛奶拉面", query: "Ajino Sapporo Onishi Aomori" },
    ],
  },
  4: {
    area: "十和田湖休屋与奥入濑",
    note: "景区餐饮密度低，抵达休屋后先确认午餐与返程巴士，随身准备补给。",
    specialties: [
      { name: "姬鳟", description: "十和田湖的代表性湖鱼，常见盐烤、刺身和定食形式。" },
      { name: "蔷薇烧", description: "十和田地区的牛肉洋葱铁板料理，味道偏甜咸，适合补充徒步热量。" },
      { name: "苹果甜点", description: "青森苹果制成的派、果汁和软冰淇淋在景区商店较常见。" },
    ],
    restaurants: [
      { name: "レストランやすみや", note: "休屋区域的湖鱼与乡土料理", query: "Restaurant Yasumiya Lake Towada" },
      { name: "Marine Blue 十和田湖", note: "湖畔咖啡与苹果甜点", query: "Marine Blue Lake Towada" },
      { name: "奥入瀬渓流館", note: "溪流入口附近的咖啡与轻食", query: "Oirase Keiryukan Cafe La Brise" },
    ],
  },
  5: {
    area: "弘前公园与市中心",
    note: "弘前公园周边餐厅和咖啡馆较分散，午餐与回程列车之间保留步行余量。",
    specialties: [
      { name: "津轻荞麦面", description: "传统做法会使用大豆汁和荞麦制面，口感柔软，是津轻地区乡土面食。" },
      { name: "いがめんち", description: "将鱿鱼足与蔬菜切碎后煎炸，是弘前常见的家庭乡土料理。" },
      { name: "弘前苹果派", description: "市内多家咖啡馆制作不同甜度与酥皮风格的苹果派，适合下午休息。" },
    ],
    restaurants: [
      { name: "高砂", note: "弘前公园附近的津轻荞麦面", query: "高砂 弘前 そば" },
      { name: "菊富士 本店", note: "津轻乡土料理与定食", query: "菊富士 本店 弘前" },
      { name: "大正浪漫喫茶室", note: "藤田纪念庭园内的苹果派与咖啡", query: "Taisho Roman Tea Room Hirosaki" },
    ],
  },
  6: {
    area: "青森站与仙台站",
    note: "上午移动、下午游览仙台；午晚餐都以车站周边为主，减少携带行李时的绕行。",
    specialties: [
      { name: "青森苹果", description: "离开青森前可在车站购买苹果汁、甜点或便携伴手礼。" },
      { name: "仙台牛舌", description: "厚切牛舌通常搭配麦饭、牛尾汤与腌菜，是抵达仙台后的经典晚餐。" },
      { name: "毛豆泥甜点", description: "毛豆制成的甜味馅料，常见于奶昔、麻糬与夹心点心。" },
    ],
    restaurants: [
      { name: "青森旬味館", note: "新青森站换乘时购买便当与特产", query: "Aomori Shunmikan Shin-Aomori Station" },
      { name: "牛たん炭焼 利久 仙台駅店", note: "抵达仙台后的牛舌晚餐", query: "Rikyu Sendai Station Gyutan" },
      { name: "ずんだ茶寮 仙台駅ずんだ小径店", note: "毛豆泥奶昔与甜点", query: "Zunda Saryo Sendai Station" },
    ],
  },
  7: {
    area: "松岛海岸与仙台",
    note: "10 月 1 日可能早于牡蛎小屋常规季节，牡蛎供应和营业状态需现场确认。",
    specialties: [
      { name: "松岛牡蛎", description: "松岛湾代表性海产，可选择烤牡蛎、牡蛎饭或炸牡蛎。" },
      { name: "穴子", description: "松岛与盐釜周边常见海味，常以穴子饭或寿司形式供应。" },
      { name: "笹かまぼこ", description: "仙台名物鱼糕，可在松岛体验现烤，也适合作为伴手礼。" },
    ],
    restaurants: [
      { name: "松島さかな市場", note: "海鲜丼、烤物与水产采购", query: "Matsushima Fish Market" },
      { name: "松島蒲鉾本舗 総本店", note: "笹蒲鉾与现烤体验", query: "Matsushima Kamaboko Honpo Main Store" },
      { name: "牛たん炭焼 利久 松島五大堂店", note: "松岛海岸附近的牛舌料理", query: "Rikyu Matsushima Godaido" },
    ],
  },
  8: {
    area: "仙台站",
    note: "返程日以车站内或相邻商业设施为主，控制排队时间并预留机场线余量。",
    specialties: [
      { name: "牛舌", description: "可在仙台站牛舌通集中比较不同店铺，套餐通常包含麦饭和牛尾汤。" },
      { name: "毛豆泥甜点", description: "毛豆制成的甜味馅料，可选择毛豆奶昔、麻糬和夹心点心。" },
      { name: "笹蒲鉾", description: "鱼浆烤制的仙台伴手礼，便于在车站或机场购买。" },
    ],
    restaurants: [
      { name: "味の牛たん喜助 JR仙台駅店", note: "仙台站牛舌通内", query: "Kisuke JR Sendai Station Gyutan" },
      { name: "ずんだ茶寮 仙台駅ずんだ小径店", note: "毛豆泥奶昔与甜点", query: "Zunda Saryo Sendai Station" },
      { name: "阿部蒲鉾店 本店", note: "笹蒲鉾与伴手礼", query: "Abe Kamaboko Honten Sendai" },
    ],
  },
};

export const trips = [
  {
    id: "tohoku-autumn-2026",
    eyebrow: "TOHOKU · AUTUMN 2026",
    title: "东北秋季\n8 天 7 晚",
    shortTitle: "东北秋季环线",
    period: "2026.09.25 — 10.02",
    dateRange: "2026-09-25 至 2026-10-02",
    status: "计划中",
    cover: images.oirase,
    coverAlt: "奥入濑溪流",
    summary: "仙台进出，先住盛冈，再以青森为基地前往十和田湖、奥入濑与弘前，最后返回仙台游松岛。",
    routeLabel: "仙台机场 → 盛冈 → 青森・弘前 → 十和田湖 → 仙台・松岛",
    tags: ["铁路旅行", "城郭巡游", "湖泊与溪流"],
    metrics: [
      { value: "8", label: "天" },
      { value: "7", label: "晚" },
      { value: "20", label: "公共交通路段" },
      { value: "3", label: "主要住宿地" },
    ],
    overviewMap: {
      embed:
        "https://maps.google.com/maps?saddr=38.1399076%2C140.9171139&daddr=39.7014371%2C141.136723+to%3A40.8288462%2C140.7342745+to%3A40.4284986%2C140.8946115+to%3A40.4899618%2C140.9525486+to%3A40.60758%2C140.46415+to%3A38.2601316%2C140.8824375+to%3A38.366921%2C141.060978+to%3A38.1399076%2C140.9171139&output=embed",
      external:
        "https://www.google.com/maps/dir/38.1399076,140.9171139/39.7014371,141.136723/40.8288462,140.7342745/40.4284986,140.8946115/40.4899618,140.9525486/40.60758,140.46415/38.2601316,140.8824375/38.366921,141.060978/38.1399076,140.9171139",
      nodes: ["仙台机场", "盛冈", "青森", "十和田湖", "奥入濑", "弘前", "仙台", "松岛"],
    },
    days: [
      {
        day: 1,
        date: "9/25",
        weekday: "FRI",
        title: "香港 → 仙台 → 盛冈",
        subtitle: "抵达后直接北上，把完整白天留给后续行程。",
        image: images.sendai,
        imageAlt: "仙台城市景观",
        stay: "盛冈站附近",
        transport: "仙台机场线 + 东北新干线",
        duration: "约 1 小时 15 分，不含换乘",
        routeNodes: [
          toNode("仙台机场", "38.1399076,140.9171139"),
          toNode("仙台站", "38.2601316,140.8824375"),
          toNode("盛冈站", "39.7014371,141.136723"),
        ],
        routeModes: ["机场线", "东北新干线"],
        timeline: [
          { time: "08:00", title: "香港出发", note: "UO896" },
          { time: "13:35", title: "抵达仙台机场", note: "入境、取行李" },
          { time: "下午", title: "仙台机场 → 仙台站", note: "机场线约 25 分钟" },
          { time: "随后", title: "仙台站 → 盛冈站", note: "东北新干线约 40–50 分钟" },
          { time: "17:00", title: "入住盛冈", note: "晚餐安排盛冈冷面或じゃじゃ麺" },
        ],
        places: [
          {
            name: "仙台站",
            type: "换乘",
            image: images.sendaiStation,
            description: "东北新干线、仙台机场线、JR 在来线和市营地下铁在此集中，是本次环线真正的交通起点。车站体量较大，东西两侧与不同楼层连接商业设施，抵达后应把重点放在辨认新干线换乘方向。",
            details: [
              { label: "看点", text: "西口站房与高架步行平台能快速建立仙台市中心的方位感。" },
              { label: "建议", text: "从机场线下车到新干线检票口按 20–30 分钟计算，另加购票与行李时间。" },
              { label: "注意", text: "抵达日预留 60–90 分钟总换乘余量，不安排离站观光。" },
            ],
            sources: [
              { label: "JR 东日本 · 仙台站", url: "https://www.jreast.co.jp/e/stations/e913.html" },
            ],
          },
          {
            name: "盛冈站",
            type: "住宿",
            image: images.moriokaStation,
            description: "盛冈站是东北新干线与秋田新干线分合的重要节点，也是前往青森、秋田和岩手沿海的门户。东口面向市中心和巴士站，西口连接 MALIOS，站内 FESAN 商业区集中餐饮与伴手礼。",
            details: [
              { label: "看点", text: "站台可见 Hayabusa 与 Komachi 列车的连结或分离作业。" },
              { label: "建议", text: "住宿选东口或北口步行范围，前往城迹和餐厅更直接。" },
              { label: "注意", text: "连续住两晚可把大件行李留在酒店，第二天只带随身物品。" },
            ],
            sources: [
              { label: "JR 东日本 · 盛冈站", url: "https://www.jreast.co.jp/estation/station/info.aspx?StationCd=1556" },
            ],
          },
        ],
        tips: ["新干线座位尽量选择指定席。", "酒店选盛冈站步行 10 分钟范围。", "抵达延误时取消晚间散步，不压缩换乘时间。"],
        food: foods[1],
      },
      {
        day: 2,
        date: "9/26",
        weekday: "SAT",
        title: "盛冈市区一日",
        subtitle: "城迹、近代建筑与盛冈三大面。",
        image: images.moriokaStation,
        imageAlt: "盛冈站",
        stay: "盛冈站附近",
        transport: "市区循环巴士 + 步行",
        duration: "市区慢行一日",
        routeNodes: [
          toNode("盛冈站", "Morioka Station"),
          toNode("盛冈城迹", "Morioka Castle Ruins Park"),
          toNode("红砖馆", "Iwate Bank Red Brick Building"),
          toNode("盛冈站", "Morioka Station"),
        ],
        routeModes: ["市区巴士", "步行 / 巴士", "市区巴士"],
        timeline: [
          { time: "09:00", title: "MALIOS 展望室", note: "20 楼观察盛冈市区" },
          { time: "上午", title: "开运桥与盛冈城迹", note: "经过樱山神社" },
          { time: "中午", title: "盛冈三大面", note: "冷面、炸酱面或碗子荞麦面" },
          { time: "下午", title: "岩手银行红砖馆", note: "近代建筑与中津川街区" },
          { time: "傍晚", title: "返回盛冈站", note: "整理次日北上行李" },
        ],
        places: [
          {
            name: "盛冈城迹公园",
            type: "历史",
            image: images.morioka,
            description: "盛冈城由南部氏营建，城郭建筑在明治时期拆除，今天保留下来的是规模完整的花岗岩石垣、曲轮高差和护城河痕迹。这里更适合从城郭结构与城市地形理解盛冈，而不是期待复原天守。",
            details: [
              { label: "看点", text: "本丸、二之丸之间的石垣和渡云桥一带最能看出城郭层次。" },
              { label: "建议", text: "从樱山神社进入，经本丸向中津川方向离开，约停留 60–90 分钟。" },
              { label: "注意", text: "园内坡道与石阶较多，雨后石面可能湿滑。" },
            ],
            sources: [
              { label: "岩手官方旅游 · 盛冈城迹", url: "https://iwatetabi.jp/en/spots/95305/" },
            ],
          },
          {
            name: "岩手银行红砖馆",
            type: "建筑",
            image: images.iwateBank,
            description: "这座建筑于 1911 年作为盛冈银行总部落成，由辰野金吾与葛西万司参与设计，是东北地区少见的明治末期红砖银行建筑。红砖、浅色石材、穹顶和塔楼体现了当时公共建筑的西式构图。",
            details: [
              { label: "看点", text: "外立面转角塔楼、旧营业大厅与金库空间最具辨识度。" },
              { label: "建议", text: "与城迹公园、中之桥和中津川合并步行，约停留 45–60 分钟。" },
              { label: "注意", text: "部分内部区域可能收费或限制拍摄，以现场标识为准。" },
            ],
            sources: [
              { label: "岩手银行红砖馆官网", url: "https://www.iwagin-akarengakan.jp/" },
            ],
          },
        ],
        tips: ["城迹与红砖馆作为固定部分。", "町家物语馆和八幡宫距离较远，按体力选择一处。", "市区循环巴士班次需当天确认。"],
        food: foods[2],
      },
      {
        day: 3,
        date: "9/27",
        weekday: "SUN",
        title: "盛冈 → 青森",
        subtitle: "上午北上，下午留给港湾和睡魔文化。",
        image: images.aomori,
        imageAlt: "青森睡魔祭花车",
        stay: "青森站附近",
        transport: "东北新干线 + JR 奥羽本线",
        duration: "约 1 小时 20 分",
        routeNodes: [
          toNode("盛冈站", "39.7014371,141.136723"),
          toNode("新青森站", "Shin-Aomori Station"),
          toNode("青森站", "40.8288462,140.7342745"),
        ],
        routeModes: ["东北新干线", "JR 奥羽本线"],
        timeline: [
          { time: "上午", title: "盛冈 → 新青森", note: "Hayabusa 约 1 小时" },
          { time: "随后", title: "新青森 → 青森", note: "JR 奥羽本线约 6 分钟" },
          { time: "中午", title: "青森鱼菜中心", note: "海鲜午餐" },
          { time: "下午", title: "睡魔之家与 A-FACTORY", note: "青森湾步行区域" },
          { time: "傍晚", title: "确认次日巴士", note: "核对青森站发车位置与时刻" },
        ],
        places: [
          {
            name: "睡魔之家 WA RASSE",
            type: "文化",
            image: images.warasse,
            description: "WA RASSE 位于青森站旁，以红色金属带包裹的建筑外观呼应睡魔灯笼的动态线条。馆内常设展出实际参加祭典的大型睡魔，并解释灯笼骨架、和纸彩绘、囃子乐队与跳人文化。",
            details: [
              { label: "看点", text: "大型灯笼的背面结构、人物表情和透光色彩比远观祭典更容易观察。" },
              { label: "建议", text: "预留 60–90 分钟，进入主展厅后按顺时针完整观看。" },
              { label: "注意", text: "演示和体验活动有固定时段，抵达后查看当日安排。" },
            ],
            sources: [
              { label: "WA RASSE 官网", url: "https://www.nebuta.jp/warasse/foreign/english.html" },
            ],
          },
          {
            name: "青森湾",
            type: "散步",
            image: images.aomoriBay,
            description: "青森港曾是连接本州与北海道的重要海上门户，青函联络船停航后，码头区域转型为城市公共空间。海湾大桥、八甲田丸、A-FACTORY 和 ASPAM 共同构成一条紧凑的港区步行带。",
            details: [
              { label: "看点", text: "海湾大桥与八甲田丸的组合最能体现青森的港口历史。" },
              { label: "建议", text: "从 WA RASSE 向 A-FACTORY、八甲田丸方向步行，日落前后约 60 分钟。" },
              { label: "注意", text: "海边风力通常高于市区，九月底需准备防风外层。" },
            ],
            sources: [
              { label: "Amazing AOMORI", url: "https://aomori-tourism.com/en/" },
            ],
          },
        ],
        tips: ["酒店选青森站步行 5–10 分钟范围。", "当晚核对 JR 巴士东北的季节班次。", "需要早起，晚间不安排跨区活动。"],
        food: foods[3],
      },
      {
        day: 4,
        date: "9/28",
        weekday: "MON",
        title: "十和田湖 + 奥入濑溪流",
        subtitle: "湖畔短游与溪流精华段徒步。",
        image: images.oiraseHero,
        imageAlt: "秋季奥入濑溪流",
        stay: "青森站附近",
        transport: "JR 巴士东北",
        duration: "单程约 2 小时 45 分",
        routeNodes: [
          toNode("青森站", "40.8288462,140.7342745"),
          toNode("十和田湖休屋", "40.4284986,140.8946115"),
          toNode("奥入濑", "40.4899618,140.9525486"),
          toNode("青森站", "40.8288462,140.7342745"),
        ],
        routeModes: ["JR 巴士", "JR 巴士", "JR 巴士"],
        timeline: [
          { time: "07:30", title: "青森站出发", note: "JR 巴士东北" },
          { time: "10:15", title: "十和田湖休屋", note: "湖畔短游" },
          { time: "11:00", title: "前往奥入濑", note: "巴士约 45 分钟" },
          { time: "11:45", title: "溪流徒步", note: "石ヶ戸至雲井の滝一段" },
          { time: "17:00", title: "返回青森", note: "实际时间取决于季节班次" },
        ],
        places: [
          {
            name: "十和田湖",
            type: "湖泊",
            image: images.towada,
            description: "十和田湖横跨青森与秋田，是火山活动形成的双重破火山口湖，湖岸被外轮山包围。休屋是公共交通游客最方便的落脚点，巴士站、游客设施、游船码头和乙女像方向的湖畔步道都集中在这里。",
            details: [
              { label: "看点", text: "从御前滨向乙女像步行，可观察中山半岛与御仓半岛围合出的湖面层次。" },
              { label: "建议", text: "在休屋安排 45–75 分钟，重点放在湖畔步行，不依赖游船完成行程。" },
              { label: "注意", text: "湖区天气变化快，巴士班次比市区交通少，返程时间优先于游览长度。" },
            ],
            sources: [
              { label: "十和田湖官方观光", url: "https://towadako.or.jp/en/" },
            ],
          },
          {
            name: "奥入濑溪流",
            type: "徒步",
            image: images.oirase,
            description: "奥入濑溪流由十和田湖子之口流向烧山，全段约 14 公里，沿途由苔藓、岩石、浅滩与多处瀑布构成。景观不是单一观景台，而是水流速度、林相和地形连续变化的徒步线路。",
            details: [
              { label: "看点", text: "阿修罗之流、云井瀑布及其间的苔藓溪谷是精华段。" },
              { label: "建议", text: "石ヶ戸至云井瀑布安排 2–3 小时，按巴士站分段进入和离开。" },
              { label: "注意", text: "步道局部与公路并行，雨天落叶和木栈道较滑，不安排全程徒步。" },
            ],
            sources: [
              { label: "Amazing AOMORI · 奥入濑", url: "https://aomori-tourism.com/en/spot/detail_339.html" },
            ],
          },
        ],
        tips: ["不安排全程 14 公里徒步。", "提前确认青森、休屋与奥入濑三段巴士。", "持续大雨或巴士停运时改为青森县立美术馆等室内行程。"],
        food: foods[4],
      },
      {
        day: 5,
        date: "9/29",
        weekday: "TUE",
        title: "青森 ↔ 弘前城",
        subtitle: "弘前城、津轻文化与苹果甜点一日往返。",
        image: images.hirosakiCastle,
        imageAlt: "弘前城天守",
        stay: "青森站附近",
        transport: "JR 奥羽本线 + 市区巴士 / 步行",
        duration: "单程约 45 分钟",
        routeNodes: [
          toNode("青森站", "Aomori Station"),
          toNode("弘前站", "Hirosaki Station"),
          toNode("弘前城", "Hirosaki Castle"),
          toNode("津轻藩睡魔村", "Tsugaru-han Neputa Village"),
          toNode("青森站", "Aomori Station"),
        ],
        routeModes: ["JR 奥羽本线", "市区巴士", "步行", "巴士 + JR"],
        timeline: [
          { time: "08:30", title: "青森站 → 弘前站", note: "JR 奥羽本线约 45 分钟" },
          { time: "09:30", title: "弘前城与弘前公园", note: "天守、城门与护城河" },
          { time: "12:00", title: "弘前市区午餐", note: "津轻荞麦面或乡土料理" },
          { time: "13:30", title: "津轻藩睡魔村", note: "大型扇形睡魔与津轻文化展示" },
          { time: "15:30", title: "苹果派与市区散步", note: "藤田纪念庭园周边" },
          { time: "17:00", title: "弘前 → 青森", note: "按当日列车时刻返回" },
        ],
        places: [
          {
            name: "弘前城",
            type: "城郭",
            image: images.hirosakiCastle,
            description: "弘前城由津轻氏营建，现存三层天守、城门和角橹，是东北地区少数仍保留江户时期城郭建筑的地点。公园范围较大，天守之外的石垣、护城河与城门共同构成完整游览体验。",
            details: [
              { label: "看点", text: "天守、下乘桥、追手门与护城河最能体现城郭层次，九月底以初秋绿意为主。" },
              { label: "建议", text: "从追手门进入，经本丸向北门方向游览，整体预留 2–3 小时。" },
              { label: "注意", text: "石垣修缮工程可能影响天守位置、开放区域与步行动线，出发前查看官方公告。" },
            ],
            sources: [
              { label: "弘前公园官网", url: "https://www.hirosakipark.com/en/" },
            ],
          },
          {
            name: "津轻藩睡魔村",
            type: "文化",
            image: images.hirosakiCastle,
            description: "津轻藩睡魔村位于弘前公园北侧，集中展示弘前睡魔的大型扇形灯笼、制作工艺与津轻三味线等地方文化。它与青森市 WA RASSE 展示的青森睡魔形态不同，适合对照两地祭典传统。",
            details: [
              { label: "看点", text: "大型扇形睡魔、制作示范与津轻三味线演奏最具代表性。" },
              { label: "建议", text: "从弘前城北侧步行前往，预留 60–90 分钟并留意演出时段。" },
              { label: "注意", text: "体验与演出安排可能变化，以当天馆内时间表为准。" },
            ],
            sources: [
              { label: "津轻藩睡魔村官网", url: "https://neputamura.com/" },
            ],
          },
        ],
        tips: ["弘前城作为固定部分，其他景点按体力取舍。", "弘前站至公园约 2 公里，优先使用市区巴士。", "当天仍住青森，只带随身物品往返。"],
        food: foods[5],
      },
      {
        day: 6,
        date: "9/30",
        weekday: "WED",
        title: "青森 → 仙台市区",
        subtitle: "上午南下，下午提前展开仙台市区游览。",
        image: images.sendaiStationInterior,
        imageAlt: "仙台站新干线换乘区域",
        stay: "仙台站附近",
        transport: "JR 奥羽本线 + 东北新干线 + 市区交通",
        duration: "约 2 小时，不含换乘",
        routeNodes: [
          toNode("青森站", "40.8288462,140.7342745"),
          toNode("新青森站", "Shin-Aomori Station"),
          toNode("仙台站", "38.2601316,140.8824375"),
          toNode("瑞凤殿", "Zuihoden Sendai"),
        ],
        routeModes: ["JR 奥羽本线", "东北新干线", "Loople Sendai / 地下铁"],
        timeline: [
          { time: "08:30", title: "青森酒店退房", note: "前往青森站搭车" },
          { time: "上午", title: "青森 → 新青森 → 仙台", note: "奥羽本线衔接东北新干线" },
          { time: "中午", title: "仙台站午餐与寄存行李", note: "酒店可入住前先寄存" },
          { time: "下午", title: "瑞凤殿或仙台城迹", note: "按抵达时间选择一处重点游览" },
          { time: "傍晚", title: "定禅寺通与一番町", note: "返回仙台站附近入住" },
        ],
        places: [
          {
            name: "仙台站",
            type: "交通与住宿",
            image: images.sendaiStationInterior,
            description: "仙台站是东北新干线、在来线、地下铁与市区巴士的综合枢纽。提前一天回到仙台可降低返程段的不确定性，也为市区历史景点留出半天。",
            details: [
              { label: "看点", text: "站内牛舌通、寿司通和伴手礼区域集中，适合移动日安排午餐。" },
              { label: "建议", text: "抵达后先到酒店寄存行李，再使用 Loople Sendai 或地下铁游览。" },
              { label: "注意", text: "新干线抵达时间较晚时，只保留市中心散步，不强行增加远距离景点。" },
            ],
            sources: [
              { label: "JR 东日本 · 仙台站", url: "https://www.jreast.co.jp/e/stations/e913.html" },
            ],
          },
          {
            name: "仙台市区",
            type: "历史与街区",
            image: images.sendai,
            description: "仙台市区的瑞凤殿、仙台城迹、定禅寺通与一番町分布在车站西侧。移动日不追求全部覆盖，可按抵达时间在历史景点和城市散步之间选择。",
            details: [
              { label: "看点", text: "瑞凤殿适合了解伊达家历史，定禅寺通则体现仙台现代城市景观。" },
              { label: "建议", text: "下午优先选瑞凤殿或仙台城迹其中一处，傍晚再前往定禅寺通。" },
              { label: "注意", text: "Loople Sendai 班次和景点闭馆时间需在当天确认。" },
            ],
            sources: [
              { label: "仙台观光国际协会", url: "https://www.sentabi.jp/" },
            ],
          },
        ],
        tips: ["新青森至仙台尽量预订指定席。", "抵达仙台后先寄存行李再观光。", "连续住宿两晚，不再搬运行李。"],
        food: foods[6],
      },
      {
        day: 7,
        date: "10/1",
        weekday: "THU",
        title: "松岛半日 + 仙台市区",
        subtitle: "海湾、寺院与返程前采购。",
        image: images.matsushimaHero,
        imageAlt: "松岛湾全景",
        stay: "仙台站附近",
        transport: "JR 仙石线",
        duration: "单程约 40 分钟",
        routeNodes: [
          toNode("仙台站", "38.2601316,140.8824375"),
          toNode("松岛海岸", "38.3678491,141.0589956"),
          toNode("仙台站", "38.2601316,140.8824375"),
        ],
        routeModes: ["JR 仙石线", "JR 仙石线"],
        timeline: [
          { time: "08:30", title: "仙台站出发", note: "目的站为松岛海岸站" },
          { time: "上午", title: "五大堂、瑞巌寺、圆通院", note: "寺院与海湾步行区域" },
          { time: "中午", title: "松岛湾", note: "观光船或海湾散步" },
          { time: "15:00", title: "返回仙台", note: "JR 仙石线" },
          { time: "傍晚", title: "仙台市区", note: "定禅寺通、一番町或车站周边" },
        ],
        places: [
          {
            name: "松岛湾",
            type: "海湾",
            image: images.matsushima,
            description: "松岛湾分布着两百余座覆盖赤松与黑松的小岛，由沉降海岸和长期侵蚀形成，是日本三景之一。陆上看到的是岛群与寺院的关系，观光船则能靠近观察洞穴、海蚀岩壁和岛屿尺度。",
            details: [
              { label: "看点", text: "五大堂周边适合近景，福浦桥方向适合观察岛群层次。" },
              { label: "建议", text: "寺院步行与观光船二选一作为主项目，避免半日行程过密。" },
              { label: "注意", text: "海上能见度和风浪会改变游船体验，阴雨天优先寺院。" },
            ],
            sources: [
              { label: "松岛观光协会", url: "https://www.matsushima-kanko.com/en/" },
            ],
          },
          {
            name: "瑞巌寺",
            type: "寺院",
            image: images.zuiganji,
            description: "瑞巌寺是东北重要禅寺，现存本堂与库里由伊达政宗在 17 世纪初重建，并被指定为国宝。寺院内部的桃山文化装饰、参道石窟群和伊达家历史，使它成为理解松岛人文背景的核心地点。",
            details: [
              { label: "看点", text: "本堂障壁画、库里建筑和参道旁岩窟遗迹应连贯观看。" },
              { label: "建议", text: "与圆通院连续安排，瑞巌寺本身预留约 60 分钟。" },
              { label: "注意", text: "室内拍摄和参观范围依现场规定，闭馆时间通常早于商业设施。" },
            ],
            sources: [
              { label: "瑞巌寺官网", url: "https://www.zuiganji.or.jp/english/" },
            ],
          },
        ],
        tips: ["目的站是松岛海岸站，不是松岛站。", "观光船按天气和班次安排。", "下午返回仙台处理采购。"],
        food: foods[7],
      },
      {
        day: 8,
        date: "10/2",
        weekday: "FRI",
        title: "仙台 → 仙台机场 → 香港",
        subtitle: "机场线直达，保留充足国际航班手续时间。",
        image: images.sendai,
        imageAlt: "仙台城市景观",
        stay: "返程",
        transport: "仙台机场线",
        duration: "约 25 分钟",
        routeNodes: [
          toNode("仙台站", "38.2601316,140.8824375"),
          toNode("仙台机场", "38.1399076,140.9171139"),
        ],
        routeModes: ["仙台机场线"],
        timeline: [
          { time: "09:00", title: "退房", note: "寄存行李" },
          { time: "10:00", title: "仙台站周边采购", note: "萩之月、牛舌、笹かまぼこ" },
          { time: "11:30", title: "仙台站 → 仙台机场", note: "机场线约 25 分钟" },
          { time: "12:00", title: "办理国际航班手续", note: "预留值机和安检时间" },
          { time: "14:30", title: "仙台 → 香港", note: "UO897" },
        ],
        places: [
          {
            name: "仙台站商业区",
            type: "采购",
            image: images.sendaiStationInterior,
            description: "仙台站内部连接 S-PAL、牛舌通、寿司通和多处伴手礼区域，返程日上午无需离开车站即可完成餐饮与采购。空间分布在不同楼层，提前确定目标比现场逐店浏览更节省时间。",
            details: [
              { label: "看点", text: "牛舌、毛豆泥甜点、笹蒲鉾和萩之月可在相近区域完成购买。" },
              { label: "建议", text: "先购买常温伴手礼，再用餐，按 60–90 分钟控制停留。" },
              { label: "注意", text: "冷藏商品和长队餐厅可能影响 11:30 前往机场的时间。" },
            ],
            sources: [
              { label: "仙台观光 · S-PAL", url: "https://discoversendai.travel/places/s-pal-sendai/" },
              { label: "JR 东日本 · 仙台站", url: "https://www.jreast.co.jp/e/stations/e913.html" },
            ],
          },
          {
            name: "仙台机场",
            type: "返程",
            image: images.sendaiAirport,
            description: "仙台机场是东北地区主要国际门户，机场线车站通过连廊与航站楼直接连接。航站楼内设宫城特产、餐饮和观景空间，但国际航班办理时间与商店营业状态需按出发日确认。",
            details: [
              { label: "看点", text: "时间充足时可前往观景区域观察跑道与仙台湾方向。" },
              { label: "建议", text: "抵达机场后优先完成值机、托运与安检，再处理少量采购。" },
              { label: "注意", text: "机场商店不作为主要采购地点，避免因缺货或排队影响登机。" },
            ],
            sources: [
              { label: "仙台机场 · 馆内指南", url: "https://www.sendai-airport.co.jp/guide/" },
              { label: "仙台机场铁道", url: "https://www.senat.co.jp/en/" },
            ],
          },
        ],
        tips: ["11:30 左右离开仙台站。", "大件采购不要安排在安检之后。", "航班与机场线时刻以出发日信息为准。"],
        food: foods[8],
      },
    ],
  },
];

export const imageCredits = [
  ["仙台站外观", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Sendai_Station_20230806.jpg"],
  ["仙台站新干线换乘口", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:JR_East_Sendai_Station_Shinkansen_Central_Transfer_Gate,_Miyagi_Pref_20230825.jpg"],
  ["仙台机场", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:211028_Sendai_Airport_Sendai_Miyagi_prefecture_Japan01bs.jpg"],
  ["盛冈站", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Morioka_Station_20220525b.jpg"],
  ["盛冈城迹", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:171103_Morioka_Castle_Morioka_Iwate_pref_Japan20s3.jpg"],
  ["岩手银行红砖馆", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:171103_Former_Morioka_Bank_Head_Office_Morioka_Iwate_pref_Japan01bs5.jpg"],
  ["弘前城", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Hirosaki_Castle_Keep_Tower_20220508.jpg"],
  ["WA RASSE", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Nebuta_Museum_Wa_Rasse_20200621.jpg"],
  ["青森睡魔祭", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Aomori_Nebuta_Festival_Float_August_2006.jpg"],
  ["青森湾", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Aomori_Bay_Bridge_20170329.jpg"],
  ["十和田湖", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Lake_Towada_from_Ohanabe_2008.jpg"],
  ["奥入濑溪流", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Oirase_keiryuu.JPG"],
  ["奥入濑溪流秋景", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Oirase_Gorge_-_OiraseGorge7015.jpg"],
  ["松岛", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:211030_Kameshima_Matsushima_Miyagi_pref_Japan01n.jpg"],
  ["松岛湾全景", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Matsushima_islands_panorama.jpg"],
  ["瑞巌寺", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:211030_Zuigan-ji_Matsushima_Miyagi_pref_Japan09s3.jpg"],
  ["仙台", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:SendaiCity_Skylines_from_Mukaiyama2018.jpg"],
];

export function getTrip(tripId) {
  return trips.find((trip) => trip.id === tripId);
}

export function getDay(trip, dayNumber) {
  return trip?.days.find((day) => day.day === Number(dayNumber));
}
