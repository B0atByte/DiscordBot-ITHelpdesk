const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createTicket, getNextTicketNumber, saveUserDepartment } = require('../database');

async function handleTicketModal(interaction) {
  const customId = interaction.customId;
  const department = customId.replace('ticket_modal_', '');

  const computer = interaction.fields.getTextInputValue('computer');
  const ip = interaction.fields.getTextInputValue('ip');
  const voice = interaction.fields.getTextInputValue('voice');
  const empOwner = interaction.fields.getTextInputValue('emp_owner');
  const problem = interaction.fields.getTextInputValue('problem');

  // Parse รหัสพนักงาน | เจ้าของเครื่อง
  const parts = empOwner.split('|').map((s) => s.trim());
  const employeeId = parts[0] || '-';
  const ownerName = parts[1] || '-';

  // Save department preference
  saveUserDepartment(interaction.user.id, department);

  await interaction.deferReply({ flags: 64 });

  try {
    const ticketNumber = getNextTicketNumber();
    const channelName = `ticket-${String(ticketNumber).padStart(4, '0')}`;

    // Create ticket as Forum Post
    const forumChannelId = process.env.TICKET_FORUM_CHANNEL_ID;
    if (!forumChannelId) {
      return await interaction.editReply({
        content: '❌ ยังไม่ได้ตั้งค่า TICKET_FORUM_CHANNEL_ID กรุณาตั้งค่าผ่านหน้า Config',
      });
    }

    const forumChannel = await interaction.guild.channels.fetch(forumChannelId);
    const channel = await forumChannel.threads.create({
      name: channelName,
      message: { content: `🎫 Ticket โดย ${interaction.user}` },
    });

    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    const channelLink = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;

    // Save to database
    const ticketId = createTicket({
      opened_at: now,
      channel_id: channel.id,
      channel_link: channelLink,
      reporter: interaction.user.username,
      user_id: interaction.user.id,
      department,
      floor: '-',
      computer,
      ip,
      voice,
      employee_id: employeeId,
      owner_name: ownerName,
      problem,
    });

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticketId}`)
      .setColor(0x3498db)
      .addFields(
        { name: '📅 วันที่เปิดเคส', value: now, inline: true },
        { name: '👤 ผู้แจ้ง', value: interaction.user.username, inline: true },
        { name: '🏢 ส่วนงาน', value: department, inline: true },
        { name: '💻 Computer', value: computer, inline: true },
        { name: '🌐 IP', value: ip, inline: true },
        { name: '📞 VOICE', value: voice, inline: true },
        { name: '🪪 รหัสพนักงาน', value: employeeId, inline: true },
        { name: '👨‍💼 เจ้าของเครื่อง', value: ownerName, inline: true },
        { name: '❗ ปัญหา', value: problem },
        { name: '📌 สถานะ', value: '🟢 เปิด', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Ticket ID: ${ticketId}` });

    // Action buttons
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_inprogress')
        .setLabel('กำลังดำเนินการ')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔧'),
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('ปิดเคส')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✅')
    );

    await channel.send({ embeds: [embed], components: [buttons] });

    await interaction.editReply({
      content: `✅ เปิดเคสสำเร็จ! → ${channel}`,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply({
      content: '❌ เกิดข้อผิดพลาดในการเปิดเคส กรุณาลองใหม่อีกครั้ง',
    });
  }
}

module.exports = { handleTicketModal };
