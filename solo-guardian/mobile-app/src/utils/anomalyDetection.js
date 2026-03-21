import { point, lineString } from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import distance from '@turf/distance';

/**
 * 1. CHECH ROUTE DEVIATION
 * Checks if the current location is deviating too far from the provided route.
 */
export const isDeviatingFromRoute = (currentLoc, routeCoords, thresholdKm = 0.05) => {
  if (!currentLoc || !routeCoords || routeCoords.length < 2) return false;
  
  const pt = point([currentLoc.longitude, currentLoc.latitude]);
  const line = lineString(routeCoords.map(c => [c.longitude, c.latitude]));
  
  const dist = pointToLineDistance(pt, line, { units: 'kilometers' });
  return dist > thresholdKm;
};

/**
 * 2. CHECK STATIONARY
 * Checks if the user has been stationary (moved < 20m) for over `thresholdMinutes`.
 * @param locationHistory Array of { coords: { latitude, longitude }, timestamp: number }
 */
export const isStationaryTooLong = (locationHistory, thresholdMinutes = 5) => {
  if (!locationHistory || locationHistory.length < 2) return false;
  
  const latestLoc = locationHistory[locationHistory.length - 1];
  const thresholdTimeInfo = Date.now() - (thresholdMinutes * 60 * 1000);
  
  // Find the first location recorded at or before our threshold time limit
  const oldLoc = locationHistory.find(loc => loc.timestamp <= thresholdTimeInfo);
  // If we don't have records extending that far back, we haven't been tracking long enough
  if (!oldLoc) return false; 
  
  const p1 = point([oldLoc.coords.longitude, oldLoc.coords.latitude]);
  const p2 = point([latestLoc.coords.longitude, latestLoc.coords.latitude]);
  const dist = distance(p1, p2, { units: 'kilometers' });
  
  // If we moved less than 0.02 km (20 meters) over the time window, we are stationary
  return dist < 0.02;
};

/**
 * 3. CHECK ETA DELAY
 * Checks if the trip has taken much longer than expected.
 */
export const isDelayed = (startTime, expectedDurationSeconds, bufferMinutes = 10) => {
  if (!startTime || !expectedDurationSeconds) return false;
  
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const maxAllowedSeconds = expectedDurationSeconds + (bufferMinutes * 60);
  
  return elapsedSeconds > maxAllowedSeconds;
};
