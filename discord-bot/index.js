require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, Events } = require('discord.js');

// Create a new client instance with all event-related intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.MessageContent
    ] 
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}! The bot is now permanently ONLINE.`);
    
    // Set a custom status
    client.user.setActivity({
        name: 'Flights on aircanada.com',
        type: ActivityType.Watching,
    });
    
    // Set the status to "Online" (green circle)
    client.user.setStatus('online');

    // Log all guilds the bot is in
    console.log(`📡 Connected to ${client.guilds.cache.size} server(s):`);
    client.guilds.cache.forEach(guild => {
        console.log(`   → ${guild.name} (${guild.id})`);
    });
});

// ═══════════════════════════════════════════════════════
// DISCORD SCHEDULED EVENT LISTENERS  
// These fire in real-time when events are created/updated
// The website's /api/events endpoint polls Discord every 10s
// These logs help confirm the bot is receiving event data
// ═══════════════════════════════════════════════════════

client.on(Events.GuildScheduledEventCreate, (event) => {
    console.log(`\n🆕 NEW EVENT CREATED:`);
    console.log(`   📋 Name: ${event.name}`);
    console.log(`   🕐 Starts: ${event.scheduledStartAt}`);
    console.log(`   👥 Server: ${event.guild?.name}`);
    console.log(`   🔗 Link: https://discord.com/events/${event.guildId}/${event.id}`);
    
    if (event.description) {
        console.log(`   📝 Description preview: ${event.description.substring(0, 100)}...`);
    }
});

client.on(Events.GuildScheduledEventUpdate, (oldEvent, newEvent) => {
    console.log(`\n✏️  EVENT UPDATED:`);
    console.log(`   📋 Name: ${newEvent.name}`);
    
    // Status changes: 1=Scheduled, 2=Active, 3=Completed, 4=Cancelled
    const statusNames = { 1: 'SCHEDULED', 2: 'ACTIVE (BOARDING)', 3: 'COMPLETED', 4: 'CANCELLED' };
    if (oldEvent?.status !== newEvent.status) {
        console.log(`   🔄 Status: ${statusNames[oldEvent?.status] || '?'} → ${statusNames[newEvent.status] || '?'}`);
    }
    
    console.log(`   🕐 Starts: ${newEvent.scheduledStartAt}`);
    console.log(`   👥 Interested: ${newEvent.userCount || 0} user(s)`);
});

client.on(Events.GuildScheduledEventDelete, (event) => {
    console.log(`\n❌ EVENT DELETED:`);
    console.log(`   📋 Name: ${event.name}`);
    console.log(`   👥 Server: ${event.guild?.name}`);
});

client.on(Events.GuildScheduledEventUserAdd, (event, user) => {
    console.log(`   ✅ User clicked "Interested" on: ${event.name} (${user.tag || user.id})`);
});

client.on(Events.GuildScheduledEventUserRemove, (event, user) => {
    console.log(`   ➖ User removed interest from: ${event.name} (${user.tag || user.id})`);
});

// ═══════════════════════════════════════════════════════
// ANNOUNCEMENTS CHANNEL WATCHER
// Watches: https://discord.com/channels/1163913364431441970/1461312014310965416
// ═══════════════════════════════════════════════════════
const ANNOUNCEMENT_CHANNEL_ID = '1461312014310965416';

client.on(Events.MessageCreate, (message) => {
    // Only watch the specific announcements channel
    if (message.channel.id !== ANNOUNCEMENT_CHANNEL_ID) return;
    // Ignore bot messages
    if (message.author.bot) return;

    const content = message.content || '';
    
    // Check if it's a flight announcement
    if (content.includes('Departing:') && content.includes('Flight Number:')) {
        console.log(`\n✈️  NEW FLIGHT ANNOUNCEMENT DETECTED!`);
        console.log(`   👤 Posted by: ${message.author.tag}`);
        
        // Parse key details
        const flightMatch = content.match(/Flight\s*Number:\s*(AC\s*\d+)/i);
        const departingMatch = content.match(/Departing:\s*(.+)/i);
        const arrivingMatch = content.match(/Arriving:\s*(.+)/i);
        const dateMatch = content.match(/Scheduled\s*Date:\s*(.+)/i);
        const timeMatch = content.match(/Departure\s*Time:\s*(.+)/i);
        const aircraftMatch = content.match(/Aircraft\s*Type:\s*(.+)/i);
        
        if (flightMatch) console.log(`   🔢 Flight: ${flightMatch[1]}`);
        if (departingMatch) console.log(`   🛫 From: ${departingMatch[1]}`);
        if (arrivingMatch) console.log(`   🛬 To: ${arrivingMatch[1]}`);
        if (dateMatch) console.log(`   📅 Date: ${dateMatch[1]}`);
        if (timeMatch) console.log(`   🕐 Time: ${timeMatch[1]}`);
        if (aircraftMatch) console.log(`   🛩️  Aircraft: ${aircraftMatch[1]}`);
        console.log(`   🔗 Message: https://discord.com/channels/${message.guildId}/${message.channel.id}/${message.id}`);
        console.log(`   ✅ This flight will appear on the website within 10 seconds!\n`);
    }
});

// Log in to Discord with your client's token
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ ERROR: DISCORD_TOKEN is missing! Make sure to set it in Railway Environment Variables.");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);

// --- HTTP Server for Fly.io Health Checks ---
const http = require('http');
const server = http.createServer((req, res) => {
    // Return bot status info
    const status = {
        online: client.isReady(),
        user: client.user?.tag || 'Not logged in',
        guilds: client.guilds?.cache.size || 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🌐 Health check server listening on port ${PORT}`);
});
