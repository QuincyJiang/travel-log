import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function ContentStatePage({ error = "" }) {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <div className={`photo-state ${error ? "error" : ""}`}>
          <h2>{error ? "内容加载失败" : "正在加载旅程…"}</h2>
          {error && <p>{error}</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
