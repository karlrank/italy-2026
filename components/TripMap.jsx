"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { accents, hexFor } from "@/components/accents";
import { mapsUrl } from "@/lib/links";

export default function TripMap({ stops, route }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Animated route line (the sleeping journey)
      L.polyline(route, {
        className: "route-flow",
        color: "#d97642",
        weight: 4,
        opacity: 0.95,
      }).addTo(map);

      // Markers (skip stops with invalid coordinates)
      const validStops = (stops || []).filter(
        (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
      );
      const markersByName = {};
      validStops.forEach((s) => {
        const color = hexFor(s.region);
        const isStay = s.type === "stay";
        const isAirport = s.type === "airport";
        const size = isAirport ? 44 : isStay ? 40 : 32;
        const icon = L.divIcon({
          className: "trip-pin-wrap",
          html: `<div class="map-pin ${isStay ? "is-stay" : ""} ${
            isAirport ? "is-airport" : ""
          }" style="--c:${color}"><span>${s.emoji}</span></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2 + 2],
        });
        const marker = L.marker([s.lat, s.lng], { icon, riseOnHover: true })
          .addTo(map)
          .bindPopup(
            `<div class="pop"><strong>${s.name}</strong>${
              s.note ? `<span>${s.note}</span>` : ""
            }<a class="pop-link" href="${mapsUrl(
              s.name + ", Italia"
            )}" target="_blank" rel="noopener noreferrer">Ava Google Mapsis ↗</a></div>`,
            { closeButton: false }
          );
        markersByName[s.name] = { marker, lat: s.lat, lng: s.lng };
      });

      if (validStops.length) {
        const bounds = L.latLngBounds(validStops.map((s) => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [45, 45] });
      } else {
        map.setView([45.55, 10.2], 8);
      }

      // "View on map" event coming from the itinerary
      const onFocus = (e) => {
        const entry = markersByName[e.detail?.name];
        if (entry) {
          map.flyTo([entry.lat, entry.lng], 12, { duration: 1.2 });
          entry.marker.openPopup();
        }
      };
      window.addEventListener("trip:focus", onFocus);

      // Ensure correct sizing once laid out / visible
      const fix = () => map.invalidateSize();
      const t = setTimeout(fix, 250);

      let io;
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) fix();
          });
        });
        io.observe(containerRef.current);
      }

      map._cleanupExtras = () => {
        clearTimeout(t);
        if (io) io.disconnect();
        window.removeEventListener("trip:focus", onFocus);
      };
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        if (mapRef.current._cleanupExtras) mapRef.current._cleanupExtras();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const legend = [
    { key: "bergamo", label: accents.bergamo.label },
    { key: "iseo", label: accents.iseo.label },
    { key: "garda", label: accents.garda.label },
    { key: "milano", label: accents.milano.label },
    { key: "airport", label: accents.airport.label },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink/10 shadow-[0_24px_60px_-36px_rgba(42,33,24,0.55)]">
      <div
        ref={containerRef}
        className="h-[440px] w-full bg-iseo-soft md:h-[560px]"
        role="application"
        aria-label="Reisi marsruudi kaart"
      />
      <div className="pointer-events-none absolute right-3 top-3 z-[500] rounded-2xl border border-ink/10 bg-white/85 px-3.5 py-3 text-xs shadow-lg backdrop-blur">
        <p className="mb-2 font-semibold uppercase tracking-wider text-ink/50">
          Piirkonnad
        </p>
        <ul className="space-y-1.5">
          {legend.map((l) => (
            <li key={l.key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: hexFor(l.key) }}
              />
              <span className="font-medium text-ink/75">{l.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
