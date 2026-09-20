import { NextResponse } from "next/server";

export interface RouteGeometryPoint {
  lat: number;
  lng: number;
}

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const originLatStr = searchParams.get("originLat");
    const originLngStr = searchParams.get("originLng");
    const destLatStr = searchParams.get("destLat");
    const destLngStr = searchParams.get("destLng");

    if (!originLatStr || !originLngStr || !destLatStr || !destLngStr) {
      return NextResponse.json(
        {
          success: false,
          error: "originLat, originLng, destLat, and destLng parameters are required.",
        },
        { status: 400 },
      );
    }

    const originLat = parseFloat(originLatStr);
    const originLng = parseFloat(originLngStr);
    const destLat = parseFloat(destLatStr);
    const destLng = parseFloat(destLngStr);

    if (
      isNaN(originLat) || originLat < -90 || originLat > 90 ||
      isNaN(originLng) || originLng < -180 || originLng > 180 ||
      isNaN(destLat) || destLat < -90 || destLat > 90 ||
      isNaN(destLng) || destLng < -180 || destLng > 180
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinate values provided." },
        { status: 400 },
      );
    }

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
    const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originLat}%2C${originLng}%3B${destLat}%2C${destLng}`;

    // Attempt OSRM Public Routing Service
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const osrmResponse = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "SafeGraphAI-ResQLearn/1.0" },
      });

      clearTimeout(timeoutId);

      if (osrmResponse.ok) {
        const data = await osrmResponse.json();

        if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
          const mainRoute = data.routes[0];
          const distanceKm = Math.round((mainRoute.distance / 1000) * 100) / 100;
          const durationMinutes = Math.max(1, Math.ceil(mainRoute.duration / 60));

          // GeoJSON coordinates from OSRM are [lng, lat]. Convert to [lat, lng] for Leaflet
          const coordinates: [number, number][] = mainRoute.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]],
          );

          return NextResponse.json({
            success: true,
            distanceKm,
            durationMinutes,
            coordinates,
            googleMapsUrl,
            osmDirectionsUrl,
            provider: "OSRM",
            isFallback: false,
          });
        }
      }
    } catch (err: any) {
      console.warn("OSRM routing API call timed out or failed, using straight-line fallback:", err.message);
    }

    // Straight line distance and estimated travel time fallback if OSRM is unreachable
    const fallbackDistance = calculateHaversineDistance(originLat, originLng, destLat, destLng);
    const fallbackDuration = Math.max(1, Math.ceil((fallbackDistance / 35) * 60)); // ~35 km/h avg speed
    const fallbackCoordinates: [number, number][] = [
      [originLat, originLng],
      [destLat, destLng],
    ];

    return NextResponse.json({
      success: true,
      distanceKm: fallbackDistance,
      durationMinutes: fallbackDuration,
      coordinates: fallbackCoordinates,
      googleMapsUrl,
      osmDirectionsUrl,
      provider: "Haversine Proximity Estimation",
      isFallback: true,
    });
  } catch (error: any) {
    console.error("GET /api/emergency/route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to calculate route right now. Please use the facility location shown on the map.",
      },
      { status: 500 },
    );
  }
}
