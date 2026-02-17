const { SlashCommandBuilder } = require('discord.js');
const { getTicketByChannelId, setSolution } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('solve')
    .setDescription('บันทึกแนวทางแก้ไข')
    .addStringOption((option) =>
      option
        .setName('solution')
        .setDescription('รายละเอียดแนวทางแก้ไข')
        .setRequired(true)
    ),

  async execute(interaction) {
    const solution = interaction.options.getString('solution');
    const ticket = getTicketByChannelId(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({
        content: '❌ คำสั่งนี้ใช้ได้เฉพาะในห้อง Ticket เท่านั้น',
        flags: 64,
      });
    }

    setSolution(interaction.channel.id, solution);

    await interaction.reply({
      content: `📝 บันทึกแนวทางแก้ไขเรียบร้อย\n> ${solution}\n— โดย **${interaction.user.username}**`,
    });
  },
};
