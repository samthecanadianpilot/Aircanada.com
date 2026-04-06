require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}! The bot is now permanently ONLINE.`);
    
    // Set a custom status that shows on their Discord profile!
    client.user.setActivity({
        name: 'Flights on aircanada.com',
        type: ActivityType.Watching,
    });
    
    // Set the status to "Online" (green circle)
    client.user.setStatus('online');
});

// Log in to Discord with your client's token
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ ERROR: DISCORD_TOKEN is missing! Make sure to set it in Railway Environment Variables.");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
