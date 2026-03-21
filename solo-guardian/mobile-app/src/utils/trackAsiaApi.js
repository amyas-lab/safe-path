import axios from 'axios';

const TRACKASIA_API_KEY = '40d56414265e44f1d9b1774073117a870e';

/**
 * Fetch a route between two coordinates using TrackAsia Routing API
 * @param origin { latitude, longitude }
 * @param destination { latitude, longitude }
 * @param profile 'car', 'moto', or 'walk'
 * @returns Object containing { coordinates, durationSeconds, distanceMeters }
 */
export const fetchRoute = async (origin, destination, profile = 'moto') => {
  const url = `https://maps.track-asia.com/route/v1/${profile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full&key=${TRACKASIA_API_KEY}`;
  
  try {
    const response = await axios.get(url);
    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const coords = route.geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      return {
        coordinates: coords,
        durationSeconds: route.duration,
        distanceMeters: route.distance
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching route from TrackAsia:', error);
    return null;
  }
};
