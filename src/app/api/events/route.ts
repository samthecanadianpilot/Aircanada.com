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
  const desc = event.description || "";
  const name = event.name || "";
  const fullText = name + "\n" + desc;

  // ═══ Parse Departing airport — e.g. "Departing: Toronto Pearson International Airport (YYZ/CYYZ)"
  let origin = "YYZ";
  // More flexible regex: search for 3-letter uppercase letters in parentheses, possibly followed by /ICAO
  const departingMatch = desc.match(/Departing:\s*.*?\(([A-Z]{3,4})(?:\/([A-Z]{4}))?\)/i);
  if (departingMatch) {
    origin = departingMatch[1].toUpperCase();
  } else {
    // Fallback search for any 3-letter code in parentheses after "Departing:"
    const fallbackOrigin = desc.match(/Departing:.*?\(?([A-Z]{3})\)?/i);
    if (fallbackOrigin) origin = fallbackOrigin[1].toUpperCase();
  }

  // ═══ Parse Arriving airport — e.g. "Arriving: Washington Ronald Reagan National Airport (DCA/KDCA)"
  let destination = "TBD";
  const arrivingMatch = desc.match(/Arriving:\s*.*?\(([A-Z]{3,4})(?:\/([A-Z]{4}))?\)/i);
  if (arrivingMatch) {
    destination = arrivingMatch[1].toUpperCase();
  } else {
    // Fallback search for any 3-letter code in parentheses after "Arriving:"
    const fallbackDest = desc.match(/Arriving:.*?\(?([A-Z]{3})\)?/i);
    if (fallbackDest) destination = fallbackDest[1].toUpperCase();
  }

  // ═══ Parse Flight Number — e.g. "Flight Number: AC 8780/JZA780"
  let flightNumber = "AC000";
  const fnMatch = desc.match(/Flight\s*Number:\s*(AC\s*\d+)/i);
  if (fnMatch) {
    flightNumber = fnMatch[1].replace(/\s+/g, '').toUpperCase();
  } else {
    // Fallback: look anywhere for AC + digits
    const fallback = (name + " " + desc).match(/\b(AC\s*\d+)\b/i);
    if (fallback) flightNumber = fallback[1].replace(/\s+/g, '').toUpperCase();
  }

  // ═══ Parse Aircraft Type — e.g. "Aircraft Type: E75"
  let aircraft = "Unknown Aircraft";
  const aircraftMatch = desc.match(/Aircraft\s*Type:\s*([A-Za-z0-9\s-]+)/i);
  if (aircraftMatch) {
    aircraft = aircraftMatch[1].trim();
  }

  // ═══ Parse Scheduled Date + Departure Time from description
  // e.g. "Scheduled Date: 09/04/2026"  +  "Departure Time: 15:00"
  let parsedDepartureTime: string | null = null;
  const dateMatch = desc.match(/Scheduled\s*Date:\s*(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/i);
  const timeMatch = desc.match(/Departure\s*Time:\s*(\d{1,2})[:.](\d{2})/i);
  
  if (dateMatch && timeMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];
    const hour = timeMatch[1].padStart(2, '0');
    const minute = timeMatch[2];
    parsedDepartureTime = `${year}-${month}-${day}T${hour}:${minute}:00Z`;
  }

  // Use Discord's scheduled_start_time as primary, fall back to parsed description time
  const departureTime = event.scheduled_start_time || parsedDepartureTime;

  // Determine live status from Discord event status
  // Discord: 1 = SCHEDULED, 2 = ACTIVE, 3 = COMPLETED, 4 = CANCELLED
  let status = 'Scheduled';
  if (event.status === 2) status = 'Boarding';
  else if (event.status === 1) status = 'Scheduled';

  // Also check the flight database as a secondary lookup
  const flightData = getFlightByNumber(flightNumber);

  return {
    id: event.id,
    flightNumber: flightNumber,
    origin: origin !== "YYZ" ? origin : (flightData ? flightData.origin : origin),
    destination: destination !== "TBD" ? destination : (flightData ? flightData.destination : destination),
    type: flightData ? flightData.type : "short",
    aircraft: aircraft,
    eventLink: `https://discord.com/events/${event.guild_id}/${event.id}`,
    status: status,
    departureTime: departureTime || null,
    endTime: event.scheduled_end_time || null,
    interestedCount: event.user_count || 0,
    eventName: name,
    eventDescription: desc,
    createdAt: event.created_at || new Date().toISOString()
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
    const seenFlightNumbers = new Set<string>();

    // 2. Fetch the active Scheduled Events directly from Discord API for each server
    for (const guild of guilds) {
      const eventsRes = await fetch(
        `https://discord.com/api/v10/guilds/${guild.id}/scheduled-events?with_user_count=true`,
        { headers: { Authorization: `Bot ${DISCORD_TOKEN}` } }
      );
      
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        events.forEach((event: any) => {
          // Status 1 = Scheduled, 2 = Active
          if (event.status === 1 || event.status === 2) {
            const parsed = parseEventInfo(event);
            allFlights.push(parsed);
            seenFlightNumbers.add(parsed.flightNumber);
          }
        });
      }
    }

    // 3. ALSO fetch recent messages from the Air Canada PTFS announcements channel
    //    Channel: https://discord.com/channels/1163913364431441970/1461312014310965416
    const ANNOUNCEMENT_GUILD_ID = '1163913364431441970';
    const ANNOUNCEMENT_CHANNEL_ID = '1461312014310965416';
    
    try {
      const msgsRes = await fetch(
        `https://discord.com/api/v10/channels/${ANNOUNCEMENT_CHANNEL_ID}/messages?limit=20`,
        { headers: { Authorization: `Bot ${DISCORD_TOKEN}` } }
      );

      if (msgsRes.ok) {
        const messages = await msgsRes.json();
        
        for (const msg of messages) {
          const content = msg.content || '';
          
          // Check if this message contains a flight announcement (has our known format)
          if (content.includes('Departing:') && content.includes('Flight Number:')) {
            // Parse it using the same logic as scheduled events
            const fakeEvent = {
              id: `msg-${msg.id}`,
              name: 'Flight Announcement',
              description: content,
              guild_id: ANNOUNCEMENT_GUILD_ID,
              status: 1, // Treat as Scheduled
              scheduled_start_time: null,
              scheduled_end_time: null,
              user_count: 0,
              created_at: msg.timestamp
            };

            const parsed = parseEventInfo(fakeEvent);
            
            // Build a Discord channel link (since this isn't a scheduled event)
            parsed.eventLink = `https://discord.com/channels/${ANNOUNCEMENT_GUILD_ID}/${ANNOUNCEMENT_CHANNEL_ID}/${msg.id}`;
            
            // Only add if we haven't already seen this flight number from scheduled events
            if (!seenFlightNumbers.has(parsed.flightNumber)) {
              allFlights.push(parsed);
              seenFlightNumbers.add(parsed.flightNumber);
            }
          }
        }
      }
    } catch (channelErr) {
      console.warn('Could not fetch announcement channel messages:', channelErr);
    }

    // Sort by departure time (soonest first)
    allFlights.sort((a, b) => {
      if (!a.departureTime) return 1;
      if (!b.departureTime) return -1;
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });

    return NextResponse.json(allFlights);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events from discord' }, { status: 500 });
  }
}

