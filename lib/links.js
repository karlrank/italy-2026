// Lingiabilised — alati kehtivad URL-id (konstrueeritud nimest).

export const mapsUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const flightTrackerUrl = (number) =>
  `https://www.flightaware.com/live/flight/${encodeURIComponent(
    (number || "").replace(/\s+/g, "").toUpperCase()
  )}`;
