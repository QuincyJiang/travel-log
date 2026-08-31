# 行旅志 Travel Log

数据驱动的个人旅行日志。项目包含旅程归档、行程总览、Google Maps、每日卡片、独立详情页、公共交通分段路线、景点说明与 Tips。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 影像相册

每个旅程包含“行程攻略 / 影像相册”切换：

- 公开行程攻略：`/trips/:tripId`
- 登录后相册：`/photos/:tripId`
- 登录后上传管理：`/manage/photos`

管理页支持批量选择 JPEG、PNG、WebP。原图保持原始格式和画质写入 R2；浏览器仅额外生成一张 WebP 小预览图供相册网格使用，灯箱加载原图。删除照片时会删除原图、预览图与元数据。

上传时会读取拍摄时间、相机、镜头、焦距、光圈、快门和 ISO 等 EXIF 信息，在灯箱中展示；GPS 不展示。旧照片没有已保存的 EXIF 时，灯箱会从原图按需读取。

选图后会优先使用 EXIF 拍摄日期、再使用文件修改日期，自动匹配旅程的 Day。日期不在旅程范围内或无法识别时，才需要在单张预览卡中手动选择 Day。

上传前会计算原图 SHA-256；同一旅程中已经存在或同批次重复的照片会标记为“已存在”并跳过，API 也会再次校验。

相册中可通过鼠标右键或触屏长按进入选择模式，支持全选当前筛选结果、将选中原图打包为 ZIP 下载，以及批量删除。

Chrome / Edge 会把 ZIP 流式写入用户选择的位置；其他浏览器单次打包上限为 250 MB，避免大量原图耗尽页面内存。批量删除会自动按每批 100 张执行。

全屏查看器支持按钮、鼠标滚轮、键盘 `+/-` 和单击聚焦缩放；放大后可拖动查看细节，切换照片时恢复为 100%。

每张照片可在灯箱或批量选择工具栏中加入精选。每段旅程最多精选 16 张；相册默认打开精选集，照片墙支持带过渡动画的双列、三列和四列布局。首页始终使用旅程配置中的默认封面。

R2 对象按以下结构保存：

```text
photos/:tripId/day-01/:photoId/
├── original.jpg
└── thumbnail.webp
```

照片元数据保存在原图的 R2 Custom Metadata 中，因此不依赖额外数据库。

## Cloudflare Worker 配置

项目已在 `wrangler.toml` 中声明 R2 binding：

```toml
[[r2_buckets]]
binding = "TRAVEL_PHOTOS"
bucket_name = "travel-log"
```

当前项目由 Worker 同时托管 Vite 静态资源与 `/api/*` 相册接口。旅行攻略保持公开，相册、上传页及照片文件通过 Cloudflare Access 统一登录保护。

Cloudflare Builds 配置：

1. 打开 **Workers & Pages → travel-log → Settings → Builds**。
2. 设置：
   - Build command：`npm run build`
   - Deploy command：`npx wrangler deploy`
   - Node version：22
3. API token 使用 Builds 自动创建的 User Token。它需要 `Workers Scripts: Edit` 与 `Workers R2 Storage: Edit`；不需要 `Cloudflare Pages: Edit`。
4. 部署成功后，`wrangler.toml` 会自动建立 `TRAVEL_PHOTOS` → `travel-log` R2 binding。

### Cloudflare Access 登录保护

必须在部署移除 `ADMIN_TOKEN` 的版本前完成 Access 配置。打开 **Cloudflare Zero Trust → Access → Applications → Add an application → Self-hosted**，创建一个应用，并添加当前网站域名下的三个受保护路径：

```text
你的域名/photos/*
你的域名/manage/photos*
你的域名/api/*
```

如果界面不允许一个应用填写多个路径，就创建三个 Self-hosted 应用并复用同一条策略。策略建议：

- Action：`Allow`
- Include：`Emails`
- Value：你的登录邮箱
- Session duration：按个人使用习惯设置

保存后分别用无痕窗口验证：

- `/trips/qinghai-hexi-2025`：无需登录即可打开。
- `/photos/qinghai-hexi-2025`：跳转 Cloudflare Access 登录。
- `/manage/photos`：跳转 Cloudflare Access 登录。
- `/api/photos?tripId=qinghai-hexi-2025`：跳转 Cloudflare Access 登录。

浏览器登录 Access 后会自动携带认证 Cookie，上传和删除不再需要额外管理密钥。R2 存储桶保持私有，相册原图只通过受 Access 保护的 Worker 接口读取；原图不压缩且 EXIF/GPS 不会被移除。

R2 不需要开启 `r2.dev` 或配置公开域名。

本地调试完整上传流程：

```bash
nvm use
npm run dev:cloudflare
```

本地 Cloudflare 调试使用 Node.js 22 与最新版 Wrangler。打开 `http://localhost:8788/manage/photos`；Wrangler 默认使用本地模拟 R2，不会写入线上存储桶。

通过 Wrangler CLI 手动部署：

```bash
npm run deploy
```

## 新增旅程

在 `src/data/trips/` 中为每段旅程创建独立模块，再从 `src/data/trips.js` 导入并加入 `trips` 数组。页面路由与列表由数据自动生成：

- 旅程总览：`/trips/:tripId`
- 每日详情：`/trips/:tripId/day/:dayNumber`

旅程对象包含以下主要字段：

```js
{
  id: "unique-trip-id",
  title: "旅程标题",
  period: "日期范围",
  cover: "/images/cover.jpg",
  summary: "旅程说明",
  overviewMap: { embed, external, nodes },
  days: [
    {
      day: 1,
      title: "当日标题",
      routeNodes: [{ label, place }],
      routeModes: ["公共交通方式"],
      timeline: [{ time, title, note }],
      places: [{ name, type, image, description }],
      tips: ["提示"]
    }
  ]
}
```

`routeNodes[].place` 使用 Google Maps 可识别的英文地点名或经纬度。相邻节点会自动生成公共交通地图路段。

## 图片

地点图片放在 `public/images`。当前实景图来自 Wikimedia Commons，具体来源记录在各旅程模块的 `imageCredits` 中。

## 内容资料

旅程内容来自个人攻略与旅行记录，并使用政府、地方观光协会、交通机构和店铺公开信息补充。游玩与餐饮取舍也会参考公开旅行笔记，并以官方交通和营业资料校正。最近核对日期为 2026-08-30。营业时间、交通班次、道路和保护区准入规则会变化，历史行程不作为当前可进入承诺。

## 原始版本

早期单文件 HTML 保存在 `legacy` 目录，仅作为内容迁移参考。
