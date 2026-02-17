const { EmbedBuilder } = require('discord.js');
const { getTicketByChannelId, updateTicketStatus, closeTicket } = require('../database');

async function handleTicketInProgress(interaction) {
  const ticket = getTicketByChannelId(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: '❌ ไม่พบข้อมูล Ticket', flags: 64 });
  }

  if (ticket.status === 'ปิด') {
    return interaction.reply({ content: '❌ Ticket นี้ปิดไปแล้ว', flags: 64 });
  }

  updateTicketStatus(interaction.channel.id, 'กำลังดำเนินการ');

  // Update the embed
  const message = interaction.message;
  const oldEmbed = message.embeds[0];
  const newEmbed = EmbedBuilder.from(oldEmbed);

  // Update status field
  const fields = newEmbed.data.fields.map((f) => {
    if (f.name === '📌 สถานะ') {
      return { ...f, value: '🟡 กำลังดำเนินการ' };
    }
    return f;
  });
  newEmbed.setFields(fields);
  newEmbed.setColor(0xf39c12);

  await message.edit({ embeds: [newEmbed], components: message.components });
  await interaction.reply({
    content: `🔧 **${interaction.user.username}** เปลี่ยนสถานะเป็น **กำลังดำเนินการ**`,
  });
}

async function handleTicketClose(interaction) {
  const ticket = getTicketByChannelId(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: '❌ ไม่พบข้อมูล Ticket', flags: 64 });
  }

  if (ticket.status === 'ปิด') {
    return interaction.reply({ content: '❌ Ticket นี้ปิดไปแล้ว', flags: 64 });
  }

  closeTicket(interaction.channel.id, interaction.user.username);

  // Update the embed
  const message = interaction.message;
  const oldEmbed = message.embeds[0];
  const newEmbed = EmbedBuilder.from(oldEmbed);

  const closedAt = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

  const fields = newEmbed.data.fields.map((f) => {
    if (f.name === '📌 สถานะ') {
      return { ...f, value: '🔴 ปิด' };
    }
    return f;
  });

  fields.push(
    { name: '🔧 ช่างเทคนิค', value: interaction.user.username, inline: true },
    { name: '📅 วันที่ปิดเคส', value: closedAt, inline: true }
  );

  newEmbed.setFields(fields);
  newEmbed.setColor(0xe74c3c);

  await message.edit({ embeds: [newEmbed], components: [] });
  await interaction.reply({
    content: `✅ **${interaction.user.username}** ปิดเคสเรียบร้อยแล้ว`,
  });
}

module.exports = { handleTicketInProgress, handleTicketClose };
