import { NextResponse } from 'next/server';

// In-memory store for 2FA codes (expires after 5 mins)
const verificationCodes = new Map<string, { code: string, expires: number }>();

const BOT_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = '1163913364431441970'; 
// List of Discord Role IDs that are authorized (e.g., BOD, Staff, etc)
// If we don't know the exact IDs, we can check role names by fetching guild roles,
// but for now, any member of the guild can log in if they enter their ID, 
// and we flag their 'rank' based on roles.
const AUTHORIZED_ROLES = ['']; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, discordId, code } = body;

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: "Discord Bot Token not configured on server." }, { status: 500 });
    }

    if (action === 'send_code') {
      if (!discordId) return NextResponse.json({ error: "Discord ID required" }, { status: 400 });

      // 1. Verify user is in the Guild
      const memberRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
      });

      if (!memberRes.ok) {
        return NextResponse.json({ error: "User not found in the Air Canada Discord Server." }, { status: 403 });
      }

      const member = await memberRes.json();
      
      // We could check member.roles against AUTHORIZED_ROLES here if we wanted to hard-block.

      // 2. Generate 6-digit code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      verificationCodes.set(discordId, {
        code: generatedCode,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      console.log(`Generated code ${generatedCode} for ${discordId}`); // Logs for debug if DM fails

      // 3. Create DM Channel
      const dmRes = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
        method: 'POST',
        headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: discordId })
      });

      if (!dmRes.ok) {
        return NextResponse.json({ error: "Could not open DM with user. Ensure your DMs are open." }, { status: 500 });
      }

      const dmChannel = await dmRes.json();

      // 4. Send Message to DM
      const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: `🔐 **Air Canada Command Center Auth**\nYour gateway access code is: \`${generatedCode}\`\nThis code expires in 5 minutes.` 
        })
      });

      if (!msgRes.ok) {
        return NextResponse.json({ error: "Failed to send DM message. Check privacy settings." }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Code sent via Discord DM.", username: member.user.username });
    }

    if (action === 'verify_code') {
      if (!discordId || !code) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

      const stored = verificationCodes.get(discordId);
      
      if (!stored) {
        return NextResponse.json({ error: "Code expired or not requested." }, { status: 400 });
      }

      if (Date.now() > stored.expires) {
        verificationCodes.delete(discordId);
        return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
      }

      if (stored.code !== code) {
        return NextResponse.json({ error: "Invalid code." }, { status: 400 });
      }

      // Code is valid! Get member details for the session
      const memberRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
      });
      const member = await memberRes.json();

      verificationCodes.delete(discordId);

      // Create a secure staff token carrying their Discord info
      const sessionData = {
        discordId,
        username: member.user.username,
        roles: member.roles,
        timestamp: Date.now()
      };
      
      // Basic base64 payload as pseudo-JWT
      const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
      
      const response = NextResponse.json({ success: true, sessionToken });
      
      // Set the session cookie via the route
      response.cookies.set({
        name: 'staff_session',
        value: sessionToken,
        httpOnly: false, // allowing client read for UI purposes
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
