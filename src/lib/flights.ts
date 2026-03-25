export type HaulType = 'short' | 'long' | 'special';

export interface AirCanadaFlight {
  flightNumber: string;
  origin: string;
  destination: string;
  type: HaulType;
}

// Global fleet options based on user rules
export const LONG_HAUL_FLEET = ['Boeing 777-300ER', 'Boeing 787-9 Dreamliner', 'Airbus A330-300'];
export const SHORT_HAUL_FLEET = ['Airbus A320', 'Airbus A220-300', 'Bombardier CRJ-900', 'De Havilland Q400'];
export const SPECIAL_FLEET = ['Airbus A340-600', 'Boeing 747-400', 'Boeing 727-200'];

// Provide a stable random fixed aircraft for short haul based on flight number
export function getFixedShortHaulAircraft(flightNumber: string) {
  const hash = flightNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SHORT_HAUL_FLEET[hash % SHORT_HAUL_FLEET.length];
}

// Provided exact dataset
export const FLIGHT_DATABASE: AirCanadaFlight[] = [
  {"flightNumber":"AC001","origin":"YYZ","destination":"LHR","type":"long"},
  {"flightNumber":"AC002","origin":"LHR","destination":"YYZ","type":"long"},
  {"flightNumber":"AC003","origin":"YYZ","destination":"CDG","type":"long"},
  {"flightNumber":"AC004","origin":"CDG","destination":"YYZ","type":"long"},
  {"flightNumber":"AC005","origin":"YYZ","destination":"FRA","type":"long"},
  {"flightNumber":"AC006","origin":"FRA","destination":"YYZ","type":"long"},
  {"flightNumber":"AC007","origin":"YYZ","destination":"DXB","type":"long"},
  {"flightNumber":"AC008","origin":"DXB","destination":"YYZ","type":"long"},
  {"flightNumber":"AC009","origin":"YYZ","destination":"HND","type":"long"},
  {"flightNumber":"AC010","origin":"HND","destination":"YYZ","type":"long"},
  {"flightNumber":"AC011","origin":"YYZ","destination":"SYD","type":"long"},
  {"flightNumber":"AC012","origin":"SYD","destination":"YYZ","type":"long"},
  {"flightNumber":"AC013","origin":"YVR","destination":"SYD","type":"long"},
  {"flightNumber":"AC014","origin":"SYD","destination":"YVR","type":"long"},
  {"flightNumber":"AC015","origin":"YYZ","destination":"GRU","type":"long"},
  {"flightNumber":"AC016","origin":"GRU","destination":"YYZ","type":"long"},
  {"flightNumber":"AC017","origin":"YYZ","destination":"EZE","type":"long"},
  {"flightNumber":"AC018","origin":"EZE","destination":"YYZ","type":"long"},
  {"flightNumber":"AC019","origin":"YYZ","destination":"ICN","type":"long"},
  {"flightNumber":"AC020","origin":"ICN","destination":"YYZ","type":"long"},
  {"flightNumber":"AC021","origin":"YYZ","destination":"HKG","type":"long"},
  {"flightNumber":"AC022","origin":"HKG","destination":"YYZ","type":"long"},
  {"flightNumber":"AC023","origin":"YYZ","destination":"BKK","type":"long"},
  {"flightNumber":"AC024","origin":"BKK","destination":"YYZ","type":"long"},
  {"flightNumber":"AC025","origin":"YYZ","destination":"AKL","type":"long"},
  {"flightNumber":"AC026","origin":"AKL","destination":"YYZ","type":"long"},
  {"flightNumber":"AC027","origin":"YUL","destination":"LHR","type":"long"},
  {"flightNumber":"AC028","origin":"LHR","destination":"YUL","type":"long"},
  {"flightNumber":"AC029","origin":"YUL","destination":"AMS","type":"long"},
  {"flightNumber":"AC030","origin":"AMS","destination":"YUL","type":"long"},

  {"flightNumber":"AC101","origin":"YYZ","destination":"LAX","type":"short"},
  {"flightNumber":"AC102","origin":"LAX","destination":"YYZ","type":"short"},
  {"flightNumber":"AC103","origin":"YYZ","destination":"SFO","type":"short"},
  {"flightNumber":"AC104","origin":"SFO","destination":"YYZ","type":"short"},
  {"flightNumber":"AC105","origin":"YYZ","destination":"MIA","type":"short"},
  {"flightNumber":"AC106","origin":"MIA","destination":"YYZ","type":"short"},
  {"flightNumber":"AC107","origin":"YYZ","destination":"ORD","type":"short"},
  {"flightNumber":"AC108","origin":"ORD","destination":"YYZ","type":"short"},
  {"flightNumber":"AC109","origin":"YYZ","destination":"ATL","type":"short"},
  {"flightNumber":"AC110","origin":"ATL","destination":"YYZ","type":"short"},
  {"flightNumber":"AC111","origin":"YYZ","destination":"DFW","type":"short"},
  {"flightNumber":"AC112","origin":"DFW","destination":"YYZ","type":"short"},

  {"flightNumber":"AC201","origin":"YYZ","destination":"YVR","type":"short"},
  {"flightNumber":"AC202","origin":"YVR","destination":"YYZ","type":"short"},
  {"flightNumber":"AC203","origin":"YYZ","destination":"YUL","type":"short"},
  {"flightNumber":"AC204","origin":"YUL","destination":"YYZ","type":"short"},
  {"flightNumber":"AC205","origin":"YYZ","destination":"YYC","type":"short"},
  {"flightNumber":"AC206","origin":"YYC","destination":"YYZ","type":"short"},
  {"flightNumber":"AC207","origin":"YYZ","destination":"YEG","type":"short"},
  {"flightNumber":"AC208","origin":"YEG","destination":"YYZ","type":"short"},
  {"flightNumber":"AC209","origin":"YYZ","destination":"YWG","type":"short"},
  {"flightNumber":"AC210","origin":"YWG","destination":"YYZ","type":"short"},
  {"flightNumber":"AC211","origin":"YYZ","destination":"YOW","type":"short"},
  {"flightNumber":"AC212","origin":"YOW","destination":"YYZ","type":"short"},

  {"flightNumber":"AC301","origin":"YVR","destination":"SEA","type":"short"},
  {"flightNumber":"AC302","origin":"SEA","destination":"YVR","type":"short"},
  {"flightNumber":"AC303","origin":"YVR","destination":"LAS","type":"short"},
  {"flightNumber":"AC304","origin":"LAS","destination":"YVR","type":"short"},
  {"flightNumber":"AC305","origin":"YVR","destination":"DEN","type":"short"},
  {"flightNumber":"AC306","origin":"DEN","destination":"YVR","type":"short"},

  {"flightNumber":"AC401","origin":"YYC","destination":"YVR","type":"short"},
  {"flightNumber":"AC402","origin":"YVR","destination":"YYC","type":"short"},
  {"flightNumber":"AC403","origin":"YYC","destination":"YYZ","type":"short"},
  {"flightNumber":"AC404","origin":"YYZ","destination":"YYC","type":"short"}
];

export function getFlightByNumber(flightNumber: string): AirCanadaFlight | undefined {
  return FLIGHT_DATABASE.find(
    f => f.flightNumber.toUpperCase() === flightNumber.toUpperCase()
  );
}

// Seat configuration constants
export const MAX_PASSENGERS = 15;
export const MAX_STAFF = 10;
export const TOTAL_SEATS = MAX_PASSENGERS + MAX_STAFF;

export function generateSeatConfig() {
  // We use exactly 25 seats. Layout: 5 rows of 3 left, 2 right (or 5x5).
  // Staff usually sit in premium/front. We'll assign Rows 1-2 as Staff (10 seats).
  // Rows 3-5 as Passengers (15 seats).
  
  const cols = 5; // A, B, C, D, E
  const rows = 5; // 1 to 5 (25 total)
  
  return { rows, cols };
}
