"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  getMapStyle,
} from "../lib/mapStyle";
import type { Waypoint } from "../types";

type RideMapProps = {
  waypoints: Waypoint[];
  /** Route line as `[lng, lat]` pairs. */
  routeCoordinates?: [number, number][];
  /** When true, clicking the map adds a waypoint. */
  interactive?: boolean;
  onAddWaypoint?: (waypoint: Waypoint) => void;
  /** Insert a waypoint at a specific position (used by route dragging). */
  onInsertWaypoint?: (index: number, waypoint: Waypoint) => void;
  className?: string;
};

const ROUTE_SOURCE_ID = "ride-route";
const ROUTE_LAYER_ID = "ride-route-line";
const ROUTE_HIT_LAYER_ID = "ride-route-hit";
const DRAG_SOURCE_ID = "ride-drag";
const DRAG_LAYER_ID = "ride-drag-line";

/** Index of the coordinate in `coords` closest to `target` (squared distance). */
function nearestRouteIndex(
  target: { lng: number; lat: number },
  coords: [number, number][],
): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < coords.length; i++) {
    const dx = coords[i][0] - target.lng;
    const dy = coords[i][1] - target.lat;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/**
 * Determines where a dragged point on the route line should be inserted in the
 * ordered waypoint list, by locating which waypoint segment was grabbed.
 */
function computeInsertIndex(
  grab: { lng: number; lat: number },
  waypoints: Waypoint[],
  coords: [number, number][],
): number {
  if (waypoints.length < 2 || coords.length === 0) {
    return waypoints.length;
  }

  const grabIndex = nearestRouteIndex(grab, coords);
  const anchors = waypoints.map((waypoint) =>
    nearestRouteIndex(waypoint, coords),
  );

  for (let i = 0; i < anchors.length - 1; i++) {
    if (grabIndex >= anchors[i] && grabIndex <= anchors[i + 1]) {
      return i + 1;
    }
  }

  return waypoints.length;
}

export function RideMap({
  waypoints,
  routeCoordinates,
  interactive = false,
  onAddWaypoint,
  onInsertWaypoint,
  className,
}: RideMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const addWaypointRef = useRef(onAddWaypoint);
  const insertWaypointRef = useRef(onInsertWaypoint);
  const interactiveRef = useRef(interactive);
  const waypointsRef = useRef(waypoints);
  const routeCoordinatesRef = useRef(routeCoordinates ?? []);
  const [ready, setReady] = useState(false);

  // Keep the latest values available inside handlers bound once on the map.
  useEffect(() => {
    addWaypointRef.current = onAddWaypoint;
    insertWaypointRef.current = onInsertWaypoint;
    interactiveRef.current = interactive;
    waypointsRef.current = waypoints;
    routeCoordinatesRef.current = routeCoordinates ?? [];
  }, [
    onAddWaypoint,
    onInsertWaypoint,
    interactive,
    waypoints,
    routeCoordinates,
  ]);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let map: MapLibreMap | null = null;
    let cancelled = false;

    void (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) {
        return;
      }

      map = new maplibregl.Map({
        container: containerRef.current,
        style: getMapStyle(),
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        attributionControl: { compact: true },
        // Placing waypoints relies on single clicks; double-click zoom would
        // fire when adding points quickly and fight the interaction.
        doubleClickZoom: !interactiveRef.current,
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      // Drag-to-shape state, scoped to this map instance.
      let dragTempMarker: Marker | null = null;
      let dragInsertIndex = 0;
      let dragPrev: Waypoint | null = null;
      let dragNext: Waypoint | null = null;
      let isDraggingRoute = false;
      let justDraggedRoute = false;

      const setDragLine = (coords: [number, number][]) => {
        const source = map?.getSource(DRAG_SOURCE_ID);
        if (source && "setData" in source) {
          (source as GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          });
        }
      };

      const highlightRoute = (on: boolean) => {
        if (!map) {
          return;
        }
        map.setPaintProperty(ROUTE_LAYER_ID, "line-width", on ? 7 : 4);
        map.setPaintProperty(ROUTE_LAYER_ID, "line-opacity", on ? 1 : 0.85);
      };

      const onDragMove = (moveEvent: {
        lngLat: { lng: number; lat: number };
      }) => {
        const point: [number, number] = [
          moveEvent.lngLat.lng,
          moveEvent.lngLat.lat,
        ];
        dragTempMarker?.setLngLat(point);

        // Dashed line from the previous waypoint through the dragged point to
        // the next waypoint, previewing where the new point will sit.
        const coords: [number, number][] = [];
        if (dragPrev) {
          coords.push([dragPrev.lng, dragPrev.lat]);
        }
        coords.push(point);
        if (dragNext) {
          coords.push([dragNext.lng, dragNext.lat]);
        }
        setDragLine(coords);
      };

      const onDragEnd = (endEvent: {
        lngLat: { lng: number; lat: number };
      }) => {
        if (!map) {
          return;
        }
        isDraggingRoute = false;
        map.off("mousemove", onDragMove);
        map.getCanvas().style.cursor = "";
        dragTempMarker?.remove();
        dragTempMarker = null;
        dragPrev = null;
        dragNext = null;
        setDragLine([]);
        highlightRoute(false);

        // Suppress the click that MapLibre emits right after the drag so it
        // doesn't also append a waypoint.
        justDraggedRoute = true;
        setTimeout(() => {
          justDraggedRoute = false;
        }, 0);

        insertWaypointRef.current?.(dragInsertIndex, {
          lat: endEvent.lngLat.lat,
          lng: endEvent.lngLat.lng,
        });
      };

      map.on("load", () => {
        if (!map) {
          return;
        }
        map.addSource(ROUTE_SOURCE_ID, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });
        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#ef4444",
            "line-width": 4,
            "line-opacity": 0.85,
          },
        });
        // Wide, invisible layer on top of the line to make it easy to grab.
        map.addLayer({
          id: ROUTE_HIT_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#000000",
            "line-width": 22,
            "line-opacity": 0,
          },
        });
        // Dashed preview line shown while dragging a new point.
        map.addSource(DRAG_SOURCE_ID, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });
        map.addLayer({
          id: DRAG_LAYER_ID,
          type: "line",
          source: DRAG_SOURCE_ID,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#ef4444",
            "line-width": 3,
            "line-opacity": 0.9,
            "line-dasharray": [0, 2],
          },
        });

        map.on("mouseenter", ROUTE_HIT_LAYER_ID, () => {
          if (interactiveRef.current && map) {
            map.getCanvas().style.cursor = "grab";
            highlightRoute(true);
          }
        });
        map.on("mouseleave", ROUTE_HIT_LAYER_ID, () => {
          if (!isDraggingRoute && map) {
            map.getCanvas().style.cursor = "";
            highlightRoute(false);
          }
        });

        map.on("mousedown", ROUTE_HIT_LAYER_ID, (downEvent) => {
          if (!interactiveRef.current || !map) {
            return;
          }
          // Prevent the map from panning while we drag the route.
          downEvent.preventDefault();
          isDraggingRoute = true;
          dragInsertIndex = computeInsertIndex(
            downEvent.lngLat,
            waypointsRef.current,
            routeCoordinatesRef.current,
          );
          dragPrev = waypointsRef.current[dragInsertIndex - 1] ?? null;
          dragNext = waypointsRef.current[dragInsertIndex] ?? null;

          const el = document.createElement("div");
          el.className =
            "size-4 rounded-full border-2 border-red-500 bg-white shadow";
          dragTempMarker = new maplibregl.Marker({ element: el })
            .setLngLat([downEvent.lngLat.lng, downEvent.lngLat.lat])
            .addTo(map);

          map.getCanvas().style.cursor = "grabbing";
          map.on("mousemove", onDragMove);
          map.once("mouseup", onDragEnd);
        });

        setReady(true);
      });

      map.on("click", (event) => {
        if (justDraggedRoute) {
          return;
        }
        addWaypointRef.current?.({
          lat: event.lngLat.lat,
          lng: event.lngLat.lng,
        });
      });
    })();

    return () => {
      cancelled = true;
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // Render waypoint markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled) {
        return;
      }

      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];

      waypoints.forEach((waypoint, index) => {
        const el = document.createElement("div");
        el.className =
          "flex size-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-semibold text-white shadow";
        el.textContent = String(index + 1);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([waypoint.lng, waypoint.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [waypoints, ready]);

  // Update the route line whenever the geometry changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }

    const source = map.getSource(ROUTE_SOURCE_ID);
    if (source && "setData" in source) {
      (source as GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates ?? [],
        },
      });
    }
  }, [routeCoordinates, ready]);

  // Fit the view to the route. Only on read-only previews — auto-fitting while
  // the user is placing waypoints fights their clicks by zooming/panning.
  useEffect(() => {
    if (interactive) {
      return;
    }

    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }

    const points: [number, number][] =
      routeCoordinates && routeCoordinates.length > 0
        ? routeCoordinates
        : waypoints.map((waypoint) => [waypoint.lng, waypoint.lat]);

    if (points.length === 0) {
      return;
    }

    void (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      const bounds = points.reduce(
        (acc, point) => acc.extend(point),
        new maplibregl.LngLatBounds(points[0], points[0]),
      );
      map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 500 });
    })();
  }, [routeCoordinates, waypoints, ready, interactive]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-hidden rounded-lg",
        interactive && "cursor-crosshair",
        className,
      )}
    />
  );
}
