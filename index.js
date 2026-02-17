require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { handleOpenTicket, handleDepartmentSelect } = require('./interactions/openTicketButton');
const { handleTicketModal } = require('./interactions/ticketModal');
const { handleTicketInProgress, handleTicketClose } = require('./interactions/ticketActions');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Load slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// Bot ready
client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

// Handle all interactions
client.on('interactionCreate', async (interaction) => {
  try {
    // === Slash Commands ===
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // === Button Interactions ===
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'open_ticket':
          await handleOpenTicket(interaction);
          break;
        case 'ticket_inprogress':
          await handleTicketInProgress(interaction);
          break;
        case 'ticket_close':
          await handleTicketClose(interaction);
          break;
      }
      return;
    }

    // === Select Menu (Department) ===
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_department') {
      await handleDepartmentSelect(interaction);
      return;
    }

    // === Modal Submit ===
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
      await handleTicketModal(interaction);
      return;
    }
  } catch (error) {
    console.error('Interaction error:', error);
    const reply = { content: '❌ เกิดข้อผิดพลาด กรุณาลองใหม่', flags: 64 };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

// Start web admin panel (รันได้เสมอแม้ยังไม่มี Token)
const { startWebServer } = require('./web/server');
startWebServer();

// Login Bot เฉพาะเมื่อมี Token
if (process.env.DISCORD_TOKEN) {
  client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('❌ Bot login ล้มเหลว:', err.message);
    console.log('📝 ตั้งค่า Token ได้ที่ http://localhost:3000/config');
  });
} else {
  console.log('⚠️ ยังไม่ได้ตั้งค่า DISCORD_TOKEN');
  console.log('📝 ตั้งค่าได้ที่ http://localhost:3000/config');
}
