import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { flushSync } from "react-dom";
import HomePage from "./pages/HomePage";
import TripPage from "./pages/TripPage";
import DayPage from "./pages/DayPage";
import PhotoGalleryPage from "./pages/PhotoGalleryPage";
import PhotoManagerPage from "./pages/PhotoManagerPage";
import NotFoundPage from "./pages/NotFoundPage";

const tripViewFromPath = (pathname) => {
  const match = pathname.match(/^\/(trips|photos)\/([^/]+)\/?$/);
  return match ? { type: match[1], tripId: match[2] } : null;
};

function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function TripViewTransitions() {
  const [pathname, navigate] = useLocation();

  useEffect(() => {
    const handleClick = (event) => {
      const link = event.target.closest?.("a[href]");
      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      const currentView = tripViewFromPath(pathname);
      const nextView = tripViewFromPath(destination.pathname);
      if (
        destination.origin !== window.location.origin ||
        !currentView ||
        !nextView ||
        currentView.tripId !== nextView.tripId ||
        currentView.type === nextView.type ||
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      event.preventDefault();
      const root = document.documentElement;
      if (root.classList.contains("trip-view-transition")) return;

      root.classList.add("trip-view-transition");
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          navigate(`${destination.pathname}${destination.search}${destination.hash}`);
        });
      });
      const finish = () => root.classList.remove("trip-view-transition");
      transition.finished.then(finish, finish);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [navigate, pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <TripViewTransitions />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/manage/photos" component={PhotoManagerPage} />
        <Route path="/photos/:tripId" component={PhotoGalleryPage} />
        <Route path="/trips/:tripId/day/:dayNumber" component={DayPage} />
        <Route path="/trips/:tripId" component={TripPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </>
  );
}
