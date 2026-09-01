# 行旅志 Travel Log

数据驱动的个人旅行日志。项目包含旅程归档、行程总览、国内高德地图、海外 Google Maps、每日卡片、独立详情页、公共交通分段路线、景点说明与 Tips。

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

国内行程使用高德 Web JS API。开发时将 `.env.example` 复制为 `.env.local` 并填写公开的 Web JS API Key，将 `.dev.vars.example` 复制为 `.dev.vars` 并填写安全密钥。生产环境需把 `VITE_AMAP_KEY` 配置为 Cloudflare Builds 环境变量，并通过 `npx wrangler secret put AMAP_SECURITY_CODE` 保存安全密钥，不能把安全密钥提交到仓库。

浏览器标签页和添加到设备主屏幕时均使用红色“行”图标。iPhone 上使用 Safari 打开网站，选择“分享 → 添加到主屏幕”即可使用自定义图标和“行旅志”名称。

## 影像相册

每个旅程包含“行程攻略 / 影像相册”切换：

- 公开行程攻略：`/trips/:tripId`
- 公开相册：`/photos/:tripId`
- 登录后上传管理：`/manage/photos`

管理页支持批量选择 JPEG、PNG、WebP，原图和浏览器生成的预览图均使用单张 50 MB 的上传上限。原图保持原始格式和画质写入 R2；浏览器额外生成一张最长边 960 px 的 WebP 预览图供相册网格使用，灯箱加载原图。删除照片时会删除原图、预览图与元数据。

管理页“已上传照片”区域支持批量重建高清缩略图。重建过程只读取现有原图并覆盖对应的 `thumbnail.webp`，不会重新上传或修改原图和照片元数据。

上传时会读取拍摄时间、相机、镜头、焦距、光圈、快门和 ISO 等 EXIF 信息，在灯箱中展示；GPS 不展示。旧照片没有已保存的 EXIF 时，灯箱会从原图按需读取。

选图后会优先使用 EXIF 拍摄日期、再使用文件修改日期，自动匹配旅程的 Day。日期不在旅程范围内或无法识别时，才需要在单张预览卡中手动选择 Day。

上传前会计算原图 SHA-256；同一旅程中已经存在或同批次重复的照片会标记为“已存在”并跳过，API 也会再次校验。

登录后可在相册中通过鼠标右键或触屏长按进入选择模式，支持全选当前筛选结果、将选中原图打包为 ZIP 下载，以及批量删除；未登录时保留浏览器默认的右键与长按行为。

Chrome / Edge 会把 ZIP 流式写入用户选择的位置；其他浏览器单次打包上限为 250 MB，避免大量原图耗尽页面内存。批量删除会自动按每批 100 张执行。

全屏查看器支持按钮、鼠标滚轮、键盘 `+/-` 和单击聚焦缩放；放大后可拖动查看细节，切换照片时恢复为 100%。

每张照片可在灯箱或批量选择工具栏中加入精选。每段旅程最多精选 16 张；相册默认打开精选集，照片墙支持带过渡动画的双列、三列和四列布局。首页始终使用旅程配置中的默认封面。

R2 对象按以下结构保存：

```text
photos/:tripId/day-01/:photoId/
├── original.jpg
└── thumbnail.webp
```

照片文件保存在 R2；照片元数据、上传租约、精选状态与顺序只保存在 D1。

## Cloudflare Worker 配置

项目已在 `wrangler.toml` 中声明 R2 binding：

```toml
[[r2_buckets]]
binding = "TRAVEL_PHOTOS"
bucket_name = "travel-log"
```

当前项目由 Worker 同时托管 Vite 静态资源、D1 旅程内容 API 与 `/api/*` 相册接口。旅行攻略、相册、照片列表和照片文件保持公开；上传、删除和精选等写操作通过 Cloudflare Access 统一登录保护。

项目同时声明 `DB` D1 binding。首次部署或新增迁移时执行：

```bash
npx wrangler d1 migrations apply travel-log-db --remote
```

Cloudflare Builds 配置：

1. 打开 **Workers & Pages → travel-log → Settings → Builds**。
2. 设置：
   - Build command：`npm run build`
   - Deploy command：`npx wrangler deploy`
   - Node version：22
3. API token 使用 Builds 自动创建的 User Token。它需要 `Workers Scripts: Edit`、`Workers R2 Storage: Edit` 与 `D1: Edit`；不需要 `Cloudflare Pages: Edit`。
4. 部署成功后，`wrangler.toml` 会自动建立 `TRAVEL_PHOTOS` → `travel-log` R2 binding。

### Cloudflare Access 登录保护

必须在部署移除 `ADMIN_TOKEN` 的版本前完成 Access 配置。打开 **Cloudflare Zero Trust → Access → Applications → Add an application → Self-hosted**，创建一个应用，并添加当前网站域名下的两个受保护路径：

```text
你的域名/manage/photos*
你的域名/api/admin/*
```

如果界面不允许一个应用填写多个路径，就创建两个 Self-hosted 应用并复用同一条策略。策略建议：

- Action：`Allow`
- Include：`Emails`
- Value：你的登录邮箱
- Session duration：按个人使用习惯设置

保存后分别用无痕窗口验证：

- `/trips/qinghai-hexi-2025`：无需登录即可打开。
- `/photos/qinghai-hexi-2025`：无需登录即可打开。
- `/manage/photos`：跳转 Cloudflare Access 登录。
- `/api/trips`：无需登录即可返回旅程列表。
- `/api/photos?tripId=qinghai-hexi-2025`：无需登录即可返回照片列表。
- `/api/photo-file?key=...`：无需登录即可读取有效照片。
- 向 `/api/admin/photos` 发起 `POST`、`PATCH` 或 `DELETE`：需要登录。

浏览器登录 Access 后会自动携带认证 Cookie，上传、删除和精选不再需要额外管理密钥。不要再保护 `/photos/*` 或整个 `/api/*`，否则公开相册仍会触发登录。R2 存储桶保持私有，照片只通过 Worker 中经过严格 key 校验的只读接口公开；原图不压缩且 EXIF/GPS 不会被移除。

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

旅程内容完全保存在 D1，不在前端代码中维护副本。新增或修改内容时创建 SQL migration，按外键顺序写入以下关系表：

```text
trips
├── trip_tags / trip_metrics / trip_overview_nodes
└── trip_days
    ├── day_route_nodes / day_route_legs
    ├── day_timeline_items / day_tips
    ├── day_places ── places
    │   ├── day_place_details
    │   └── day_place_sources ── content_sources
    └── food_guides
        ├── food_specialties
        └── day_restaurants ── restaurants
```

完整初始数据位于 `migrations/0005_seed_trip_content.sql`，表结构位于 `migrations/0004_create_trip_content.sql`。`trips.map_provider` 决定行程使用 `google` 或 `amap`；国内高德地图优先使用路线节点的中文标签定位，海外行程的 `day_route_nodes.place_query` 使用 Google Maps 可识别的地点名或经纬度。写入后执行远程 migration，页面列表和路由由 `/api/trips` 自动生成。

## 图片

地点图片放在 `public/images`。图片署名与来源保存在 D1 `media_credits` 表。

## 内容资料

旅程内容来自个人攻略与旅行记录，并使用政府、地方观光协会、交通机构和店铺公开信息补充。游玩与餐饮取舍也会参考公开旅行笔记，并以官方交通和营业资料校正。最近核对日期为 2026-08-30。营业时间、交通班次、道路和保护区准入规则会变化，历史行程不作为当前可进入承诺。

## 原始版本

早期单文件 HTML 保存在 `legacy` 目录，仅作为内容迁移参考。
