require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, Events, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildScheduledEvents,
    ] 
});

const commands = [
    new SlashCommandBuilder().setName('debug-full').setDescription('Deep audit server perms')
].map(c => c.toJSON());

client.once(Events.ClientReady, async () => {
    console.log(`\n🚀 Audit Bot Active: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'debug-full') {
        await interaction.deferReply({ ephemeral: true });
        try {
            const guild = interaction.guild;
            const channels = await guild.channels.fetch();
            const events = await guild.scheduledEvents.fetch();
            
            let msg = `📊 **Audit Result for ${guild.name}**\n`;
            msg += `• Channels visible to bot: **${channels.size}**\n`;
            msg += `• Events found: **${events.size}**\n`;
            msg += `• Bot Permissions: \`${interaction.memberPermissions.has('Administrator') ? 'ADMIN' : 'Standard'}\`\n`;
            
            if (events.size === 0) {
                msg += `\n⚠️ **WARNING**: Bot sees 0 events. This usually means the bot is blocked from seeing the 'Events' feature or the channels they are linked to.`;
            }

            await interaction.editReply(msg);
            console.log(`Audit: ${guild.name} | Channels: ${channels.size} | Events: ${events.size}`);
        } catch (e) {
            await interaction.editReply(`❌ Error: ${e.message}`);
        }
    }
});

client.on(Events.MessageCreate, async m => {
    if (m.content === '!register') {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, m.guildId), { body: commands });
        m.reply("✅ Audit command registered!");
    }
});

client.login(process.env.DISCORD_TOKEN);
require('http').createServer((q,s)=>s.end('ok')).listen(process.env.PORT || 8080);
