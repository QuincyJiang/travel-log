import { Link } from "wouter";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function NotFoundPage() {
  return (
    <div className="page-shell not-found-page">
      <SiteHeader />
      <main className="not-found">
        <span>404</span>
        <h1>这段行程不存在。</h1>
        <Link className="text-link" href="/">返回旅程列表 →</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
