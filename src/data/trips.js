import { qinghaiHexi2025, qinghaiImageCredits } from "./trips/qinghaiHexi2025";
import { tohokuAutumn2026, tohokuImageCredits } from "./trips/tohokuAutumn2026";

export const trips = [tohokuAutumn2026, qinghaiHexi2025];

export const imageCredits = [...tohokuImageCredits, ...qinghaiImageCredits];

export function getTrip(tripId) {
  return trips.find((trip) => trip.id === tripId);
}

export function getDay(trip, dayNumber) {
  return trip?.days.find((day) => day.day === Number(dayNumber));
}
