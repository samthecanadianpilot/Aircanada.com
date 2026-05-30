import { NextResponse } from 'next/server';
import { getAssistanceChats, saveAssistanceChat } from '@/lib/database';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.ASSISTANCE_CHANNEL_ID || '1461312014310965416';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) return NextResponse.json({ error: 'Missing chatId' }, { status: 400 });

  const chats = await getAssistanceChats();
  const chat = chats[chatId] || { messages: [], threadId: null };

  return NextResponse.json(chat);
}

export async function POST(req: Request) {
  try {
    const { chatId, message, sender, username } = await req.json();

    if (!chatId || !message) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const chats = await getAssistanceChats();
    const chat = chats[chatId] || { messages: [], threadId: null };

    // 1. If no thread exists, create one in Discord
    if (!chat.threadId) {
      console.log(`Creating new support thread for ${username || chatId}`);
      const threadRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/threads`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `🛎️ Support: ${username || chatId.substring(0, 8)}`,
          auto_archive_duration: 1440, // 24 hours
          type: 11, // Public Thread
        }),
      });

      if (threadRes.ok) {
        const threadData = await threadRes.json();
        chat.threadId = threadData.id;
        
        // Premium initial message in thread with layout
        await fetch(`https://discord.com/api/v10/channels/${chat.threadId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [
              {
                title: "🆕 New Website Support Request",
                description: `A user has started a chat from the website assistant.\n\n**Initial Message:**\n> ${message}`,
                color: 0xE41B23, // Air Canada Red
                fields: [
                  { name: "User", value: username || "Guest", inline: true },
                  { name: "Chat ID", value: `\`${chatId}\``, inline: true },
                  { name: "Action", value: "Reply below to talk to the user in real-time." }
                ],
                timestamp: new Date().toISOString(),
                footer: { text: "Air Canada PTFS Assistance System" }
              }
            ]
          }),
        });
      } else {
        const errorData = await threadRes.json();
        console.error("Discord Thread Creation Failed:", errorData);
      }
    } else if (sender === 'user') {
      // 2. If thread exists and it's a user message, send to Discord Thread
      await fetch(`https://discord.com/api/v10/channels/${chat.threadId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `**User:** ${message}`,
        }),
      });
    }

    // 3. Add message to history
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: sender || 'user',
      timestamp: new Date().toISOString(),
    };
    chat.messages.push(newMessage);

    // 4. Save back to DB
    await saveAssistanceChat(chatId, chat);

    return NextResponse.json(chat);
  } catch (err: any) {
    console.error('Assistance API error:', err);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
