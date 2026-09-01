import { json, requireDatabase, validTripId } from "../_shared/photos";

const cacheHeaders = {
  "cache-control": "public, max-age=60, s-maxage=300",
};

const toTripSummary = (row) => ({
  id: row.id,
  eyebrow: row.eyebrow,
  title: row.title,
  shortTitle: row.short_title,
  period: row.period,
  dateRange: `${row.start_date} 至 ${row.end_date}`,
  status: row.status,
  cover: row.cover_path,
  coverAlt: row.cover_alt,
  summary: row.summary,
  routeLabel: row.route_label,
  mapProvider: row.map_provider,
});

const groupBy = (rows, key) => {
  const groups = new Map();
  rows.forEach((row) => {
    const values = groups.get(row[key]) ?? [];
    values.push(row);
    groups.set(row[key], values);
  });
  return groups;
};

const dayDate = (startDate, dayNumber) => {
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dayNumber - 1);
  return {
    date: `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
    weekday: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
      date.getUTCDay()
    ],
  };
};

const listTrips = async (db) => {
  const { results } = await db.prepare(`
    SELECT *
    FROM trips
    WHERE published = 1
    ORDER BY sort_order
  `).all();
  return results.map(toTripSummary);
};

const loadTrip = async (db, tripId) => {
  const row = await db.prepare(`
    SELECT *
    FROM trips
    WHERE id = ? AND published = 1
  `).bind(tripId).first();
  if (!row) return null;

  const results = await db.batch([
    db.prepare(`
      SELECT name FROM trip_tags
      WHERE trip_id = ? ORDER BY sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT value, label FROM trip_metrics
      WHERE trip_id = ? ORDER BY sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT label FROM trip_overview_nodes
      WHERE trip_id = ? ORDER BY sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT * FROM trip_days
      WHERE trip_id = ? ORDER BY day_number
    `).bind(tripId),
    db.prepare(`
      SELECT n.* FROM day_route_nodes n
      JOIN trip_days d ON d.id = n.day_id
      WHERE d.trip_id = ? ORDER BY n.day_id, n.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT l.* FROM day_route_legs l
      JOIN trip_days d ON d.id = l.day_id
      WHERE d.trip_id = ? ORDER BY l.day_id, l.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT i.* FROM day_timeline_items i
      JOIN trip_days d ON d.id = i.day_id
      WHERE d.trip_id = ? ORDER BY i.day_id, i.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT dp.id AS day_place_id, dp.day_id, dp.description, p.name, p.type,
             p.image_path
      FROM day_places dp
      JOIN places p ON p.id = dp.place_id
      JOIN trip_days d ON d.id = dp.day_id
      WHERE d.trip_id = ?
      ORDER BY dp.day_id, dp.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT detail.day_place_id, detail.label, detail.text
      FROM day_place_details detail
      JOIN day_places dp ON dp.id = detail.day_place_id
      JOIN trip_days d ON d.id = dp.day_id
      WHERE d.trip_id = ?
      ORDER BY detail.day_place_id, detail.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT link.day_place_id, source.label, source.url
      FROM day_place_sources link
      JOIN content_sources source ON source.id = link.source_id
      JOIN day_places dp ON dp.id = link.day_place_id
      JOIN trip_days d ON d.id = dp.day_id
      WHERE d.trip_id = ?
      ORDER BY link.day_place_id, link.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT tip.* FROM day_tips tip
      JOIN trip_days d ON d.id = tip.day_id
      WHERE d.trip_id = ?
      ORDER BY tip.day_id, tip.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT guide.* FROM food_guides guide
      JOIN trip_days d ON d.id = guide.day_id
      WHERE d.trip_id = ?
    `).bind(tripId),
    db.prepare(`
      SELECT specialty.* FROM food_specialties specialty
      JOIN trip_days d ON d.id = specialty.day_id
      WHERE d.trip_id = ?
      ORDER BY specialty.day_id, specialty.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT link.day_id, restaurant.name, restaurant.map_query, link.note,
             source.url AS source_url
      FROM day_restaurants link
      JOIN restaurants restaurant ON restaurant.id = link.restaurant_id
      JOIN trip_days d ON d.id = link.day_id
      LEFT JOIN content_sources source ON source.id = link.source_id
      WHERE d.trip_id = ?
      ORDER BY link.day_id, link.sort_order
    `).bind(tripId),
    db.prepare(`
      SELECT subject, attribution, source_url
      FROM media_credits
      WHERE trip_id = ?
      ORDER BY sort_order
    `).bind(tripId),
  ]);

  const [
    tags,
    metrics,
    overviewNodes,
    days,
    routeNodes,
    routeLegs,
    timelineItems,
    dayPlaces,
    placeDetails,
    placeSources,
    dayTips,
    foodGuides,
    foodSpecialties,
    dayRestaurants,
    mediaCredits,
  ] = results.map((result) => result.results);
  const routeNodesByDay = groupBy(routeNodes, "day_id");
  const routeLegsByDay = groupBy(routeLegs, "day_id");
  const timelineByDay = groupBy(timelineItems, "day_id");
  const placesByDay = groupBy(dayPlaces, "day_id");
  const detailsByPlace = groupBy(placeDetails, "day_place_id");
  const sourcesByPlace = groupBy(placeSources, "day_place_id");
  const tipsByDay = groupBy(dayTips, "day_id");
  const specialtiesByDay = groupBy(foodSpecialties, "day_id");
  const restaurantsByDay = groupBy(dayRestaurants, "day_id");
  const foodByDay = new Map(foodGuides.map((guide) => [guide.day_id, guide]));
  const overviewRouteNodes = routeNodes.filter(
    (node, index, nodes) =>
      index === 0 || node.label !== nodes[index - 1].label,
  );

  return {
    ...toTripSummary(row),
    tags: tags.map(({ name }) => name),
    metrics: metrics.map(({ value, label }) => ({ value, label })),
    overviewMap: {
      provider: row.map_provider,
      embed: row.overview_map_embed,
      external: row.overview_map_external,
      nodes: overviewNodes.map(({ label }) => label),
      routeNodes: overviewRouteNodes.map((node) => ({
        label: node.label,
        query: row.map_provider === "amap" ? node.label : node.place_query,
      })),
    },
    days: days.map((day) => {
      const date = dayDate(row.start_date, day.day_number);
      const food = foodByDay.get(day.id);
      return {
        day: day.day_number,
        ...date,
        title: day.title,
        subtitle: day.subtitle,
        image: day.image_path,
        imageAlt: day.image_alt,
        stay: day.stay,
        stayArrival: day.stay_arrival ?? undefined,
        transport: day.transport,
        duration: day.duration,
        routeNodes: (routeNodesByDay.get(day.id) ?? []).map((node) => ({
          label: node.label,
          place: node.place_query,
          query: row.map_provider === "amap" ? node.label : node.place_query,
        })),
        routeModes: (routeLegsByDay.get(day.id) ?? []).map(({ mode }) => mode),
        timeline: (timelineByDay.get(day.id) ?? []).map((item) => ({
          time: item.time_label,
          title: item.title,
          note: item.note,
        })),
        places: (placesByDay.get(day.id) ?? []).map((place) => ({
          name: place.name,
          type: place.type,
          image: place.image_path,
          description: place.description,
          details: (detailsByPlace.get(place.day_place_id) ?? []).map(
            ({ label, text }) => ({ label, text }),
          ),
          sources: (sourcesByPlace.get(place.day_place_id) ?? []).map(
            ({ label, url }) => ({ label, url }),
          ),
        })),
        tips: (tipsByDay.get(day.id) ?? []).map(({ text }) => text),
        food: {
          area: food.area,
          note: food.note,
          specialties: (specialtiesByDay.get(day.id) ?? []).map(
            ({ name, description }) => ({ name, description }),
          ),
          restaurants: (restaurantsByDay.get(day.id) ?? []).map(
            ({ name, map_query: query, note, source_url: source }) => ({
              name,
              query,
              note,
              ...(source ? { source } : {}),
            }),
          ),
        },
      };
    }),
    imageCredits: mediaCredits.map(
      ({ subject, attribution, source_url: sourceUrl }) => [
        subject,
        attribution,
        sourceUrl,
      ],
    ),
  };
};

export async function onRequestGet({ request, env }) {
  try {
    const tripId = new URL(request.url).searchParams.get("tripId");
    const db = requireDatabase(env);
    if (!tripId) {
      return json({ trips: await listTrips(db) }, { headers: cacheHeaders });
    }
    if (!validTripId(tripId)) {
      return json({ error: "tripId 无效" }, { status: 400 });
    }

    const trip = await loadTrip(db, tripId);
    return trip
      ? json({ trip }, { headers: cacheHeaders })
      : json({ error: "旅程不存在" }, { status: 404 });
  } catch (error) {
    console.error("Failed to read trip content", error);
    return json({ error: "旅程内容读取失败" }, { status: 500 });
  }
}
