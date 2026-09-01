import { useCallback, useEffect, useState } from "react";

let tripsPromise;
const tripPromises = new Map();

const requestJson = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "旅程内容读取失败");
    error.status = response.status;
    throw error;
  }
  return data;
};

export const loadTrips = () => {
  if (!tripsPromise) {
    tripsPromise = requestJson("/api/trips")
      .then(({ trips }) => trips)
      .catch((error) => {
        tripsPromise = undefined;
        throw error;
      });
  }
  return tripsPromise;
};

export const loadTrip = (tripId) => {
  if (!tripPromises.has(tripId)) {
    const promise = requestJson(
      `/api/trips?tripId=${encodeURIComponent(tripId)}`,
    )
      .then(({ trip }) => trip)
      .catch((error) => {
        tripPromises.delete(tripId);
        throw error;
      });
    tripPromises.set(tripId, promise);
  }
  return tripPromises.get(tripId);
};

const useResource = (key, loader) => {
  const [state, setState] = useState({
    key,
    data: null,
    error: "",
    loading: Boolean(key),
    notFound: false,
  });

  useEffect(() => {
    if (!key) {
      setState({
        key,
        data: null,
        error: "",
        loading: false,
        notFound: false,
      });
      return undefined;
    }
    let active = true;
    setState({
      key,
      data: null,
      error: "",
      loading: true,
      notFound: false,
    });
    loader()
      .then((data) => {
        if (active) {
          setState({
            key,
            data,
            error: "",
            loading: false,
            notFound: false,
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            key,
            data: null,
            error: error.message,
            loading: false,
            notFound: error.status === 404,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [key, loader]);

  return state.key === key
    ? state
    : {
        key,
        data: null,
        error: "",
        loading: Boolean(key),
        notFound: false,
      };
};

export const useTrips = () =>
  useResource("trips", loadTrips);

export const useTrip = (tripId) => {
  const loader = useCallback(() => loadTrip(tripId), [tripId]);
  return useResource(tripId, loader);
};
