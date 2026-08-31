import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import TripPage from "./pages/TripPage";
import DayPage from "./pages/DayPage";
import PhotoGalleryPage from "./pages/PhotoGalleryPage";
import PhotoManagerPage from "./pages/PhotoManagerPage";
import NotFoundPage from "./pages/NotFoundPage";

function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/manage/photos" component={PhotoManagerPage} />
        <Route path="/trips/:tripId/photos" component={PhotoGalleryPage} />
        <Route path="/trips/:tripId/day/:dayNumber" component={DayPage} />
        <Route path="/trips/:tripId" component={TripPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </>
  );
}
