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

- 相册：`/trips/:tripId/photos`
- 私有上传管理：`/manage/photos`

管理页支持批量选择 JPEG、PNG、WebP。原图保持原始格式和画质写入 R2；浏览器仅额外生成一张 WebP 小预览图供相册网格使用，灯箱加载原图。删除照片时会删除原图、预览图与元数据。

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

当前项目由 Worker 同时托管 Vite 静态资源与 `/api/*` 相册接口。Cloudflare Builds 需要完成以下配置：

1. 打开 **Workers & Pages → travel-log → Settings → Builds**。
2. 设置：
   - Build command：`npm run build`
   - Deploy command：`npx wrangler deploy`
   - Node version：22
3. API token 使用 Builds 自动创建的 User Token。它需要 `Workers Scripts: Edit` 与 `Workers R2 Storage: Edit`；不需要 `Cloudflare Pages: Edit`。
4. 部署成功后，`wrangler.toml` 会自动建立 `TRAVEL_PHOTOS` → `travel-log` R2 binding。
5. 打开 **Settings → Variables & Secrets**，新增加密 Secret：
   - Name：`ADMIN_TOKEN`
   - Value：长度至少 32 位的随机字符串
6. 保存 Secret 后重新部署。

上传管理页会把管理密钥保存在当前标签页的 `sessionStorage`，不会写入仓库或永久保存在浏览器。所有上传和删除请求都必须携带该密钥。R2 存储桶保持私有，但相册中的原图会通过 Worker 只读接口公开展示；原图不压缩且 EXIF/GPS 不会被移除。

建议额外使用 **Cloudflare Zero Trust → Access → Applications**，为 `/manage/photos*` 配置只允许个人邮箱访问的 Self-hosted 应用。R2 存储桶本身保持私有，不需要开启 `r2.dev` 或自定义公开域名。

本地调试完整上传流程：

```bash
nvm use
cp .dev.vars.example .dev.vars
# 修改 .dev.vars 中的 ADMIN_TOKEN
npm run dev:cloudflare
```

本地 Cloudflare 调试使用 Node.js 22 与最新版 Wrangler。打开 `http://localhost:8788/manage/photos`；Wrangler 默认使用本地模拟 R2，不会写入线上存储桶。

通过 Wrangler CLI 部署时，也可以设置 Secret：

```bash
npx wrangler@latest secret put ADMIN_TOKEN
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
