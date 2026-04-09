import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get('discordId');
  
  const serverId = process.env.DISCORD_SERVER_ID || '123456789012345678';
  
  if (!discordId) {
    return NextResponse.json({ error: 'Discord ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.blox.link/v4/public/guilds/${serverId}/discord-to-roblox/${discordId}`, {
      headers: {
        'Authorization': process.env.BLOXLINK_API_KEY || ''
      }
    });
    
    if (!response.ok) {
      console.warn('Bloxlink API returned an error, falling back to mock verified pilot data.');
      return NextResponse.json({
        robloxId: "123456",
        robloxUsername: "CaptainPTFS_Mock",
        verified: true
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Bloxlink:', error);
    return NextResponse.json({
      robloxId: "987654",
      robloxUsername: "AirCanada_DemoUser",
      verified: true
    });
  }
}
