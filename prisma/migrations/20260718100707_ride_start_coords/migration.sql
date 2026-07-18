-- AlterTable
ALTER TABLE "ride" ADD COLUMN     "startLat" DOUBLE PRECISION,
ADD COLUMN     "startLng" DOUBLE PRECISION;

-- Backfill coordinates from the first stored waypoint (jsonb array of {lat,lng}).
UPDATE ride
SET "startLat" = ((waypoints::jsonb -> 0 ->> 'lat')::double precision),
    "startLng" = ((waypoints::jsonb -> 0 ->> 'lng')::double precision)
WHERE waypoints IS NOT NULL
  AND jsonb_typeof(waypoints::jsonb) = 'array'
  AND jsonb_array_length(waypoints::jsonb) > 0;
