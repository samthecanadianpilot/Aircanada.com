import { NextResponse } from 'next/server';
import { FLIGHT_DATABASE, getFlightByNumber } from '@/lib/flights';

// Vercel will cache this API response for 10 seconds, preventing Discord Rate Limits!
export const revalidate = 10; 

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

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

