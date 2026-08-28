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

在 `src/data/trips.js` 的 `trips` 数组中添加旅程对象。页面路由与列表由数据自动生成：

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

地点图片放在 `public/images`。当前实景图来自 Wikimedia Commons，具体来源可在页面底部和 `src/data/trips.js` 的 `imageCredits` 中查看。

## 内容资料

景点、当地名物和餐厅定位参考日本国家旅游局、地方观光协会、交通机构与店铺公开信息，最近核对日期为 2026-08-28。餐厅营业日、季节菜单和地方巴士班次变化较频繁，页面提供 Google Maps 定位，不保存固定营业时间。

## 原始版本

早期单文件 HTML 保存在 `legacy` 目录，仅作为内容迁移参考。
