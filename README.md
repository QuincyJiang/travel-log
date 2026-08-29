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
