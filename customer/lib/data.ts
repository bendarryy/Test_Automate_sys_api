import { RestaurantAPIData } from './types';

export const API_BASE_URL = "http://dtu.public.localhost:8000";

export async function fetchRestaurantData(): Promise<RestaurantAPIData> {
  // The problem description implies the endpoint is http://dtu.public.localhost:8000/
  // If there's a specific path like /api/restaurant, adjust API_BASE_URL or the fetch path.
  const response = await fetch(API_BASE_URL + '/'); 
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`Failed to fetch restaurant data: ${response.status} ${response.statusText}`);
  }
  try {
    const data: RestaurantAPIData = await response.json();
    return data;
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    throw new Error("Failed to parse restaurant data from API.");
  }
}
