import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function ContentStatePage({ error = "" }) {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <div
          className={`content-state ${error ? "error" : ""}`}
          role="status"
          aria-live="polite"
        >
          {error ? (
            <span className="content-state-error-mark" aria-hidden="true">!</span>
          ) : (
            <div className="journey-loader" aria-hidden="true">
              <svg viewBox="0 0 220 92" role="presentation">
                <path className="loader-route-base" d="M12 66 C38 66 34 22 70 22 S100 70 136 70 S169 30 208 30" />
                <path className="loader-route-progress" pathLength="1" d="M12 66 C38 66 34 22 70 22 S100 70 136 70 S169 30 208 30" />
                <circle cx="12" cy="66" r="5" />
                <circle cx="70" cy="22" r="5" />
                <circle cx="136" cy="70" r="5" />
                <circle cx="208" cy="30" r="5" />
              </svg>
              <span className="loader-traveler" />
            </div>
          )}
          <span className="section-index">{error ? "LOAD ERROR" : "PREPARING JOURNEY"}</span>
          <h2>{error ? "内容加载失败" : "正在加载旅程"}</h2>
          <p>{error || "正在整理路线、住宿与每日记录…"}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
