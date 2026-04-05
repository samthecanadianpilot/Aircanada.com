import { NextResponse } from 'next/server';

// Vercel will cache this API response for 10 seconds, preventing Discord Rate Limits!
export const revalidate = 10; 

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.warn('WARNING: DISCORD_TOKEN is missing. Set it in Vercel environment variables.');
}

// Flight Database copy for Origin/Destination lookup
const FLIGHT_DATABASE = [
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

function getFlightByNumber(flightNumber: string) {
  const norm = flightNumber.toUpperCase().replace(/\s+/g, '');
  return FLIGHT_DATABASE.find(f => f.flightNumber === norm);
}

function parseEventInfo(event: any) {
  const fullText = (event.name + " " + (event.description || "")).replace(/\n/g, " ");

  let flightNumber = "AC000";
  const numMatch = fullText.match(/(?:Flight Number|Flight)?\s*(AC\s*\d+|\d+)/i);
  if (numMatch) {
    flightNumber = numMatch[1].toUpperCase();
    if (!flightNumber.startsWith("AC")) flightNumber = "AC" + flightNumber;
    flightNumber = flightNumber.replace(/\s+/g, '');
  }

  let aircraft = "Unknown Aircraft";
  const acMatch = fullText.match(/(?:Aircraft Type|Aircraft|Type)\s*[:-]?\s*([A-Za-z0-9-]+)/i);
  if (acMatch && acMatch[1].toUpperCase() !== "AC" && !acMatch[1].toUpperCase().startsWith("AC0")) {
    aircraft = acMatch[1];
  } else {
    const knownAircraft = ["A220", "A320", "A330-300", "777-300ER", "787-9", "CRJ-900", "Q400"];
    for (const type of knownAircraft) {
      if (fullText.includes(type)) {
        aircraft = type;
        break;
      }
    }
  }

  const flightData = getFlightByNumber(flightNumber);
  
  return {
    id: event.id,
    flightNumber: flightNumber,
    origin: flightData ? flightData.origin : "YYZ",
    destination: flightData ? flightData.destination : "TBD",
    type: flightData ? flightData.type : "short",
    aircraft: aircraft,
    eventLink: `https://discord.com/events/${event.guild_id}/${event.id}`,
    status: 'Boarding',
    createdAt: new Date().toISOString()
  };
}

export async function GET() {
  try {
    // 1. Authenticate with Discord and fetch which servers we are in
    const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` }
    });
    
    if (!guildsRes.ok) throw new Error('Failed to fetch guilds');
    const guilds = await guildsRes.json();

    let allFlights: any[] = [];

    // 2. Fetch the active Scheduled Events directly from Discord API for each server
    for (const guild of guilds) {
      const eventsRes = await fetch(`https://discord.com/api/v10/guilds/${guild.id}/scheduled-events`, {
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` }
      });
      
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        events.forEach((event: any) => {
          // Status 1 = Scheduled, 2 = Active
          if (event.status === 1 || event.status === 2) {
            allFlights.push(parseEventInfo(event));
          }
        });
      }
    }

    return NextResponse.json(allFlights);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events from discord' }, { status: 500 });
  }
}
