const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('ตั้งค่าปุ่มเปิดเคสในห้องนี้'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ ระบบแจ้งซ่อม IT')
      .setColor(0x2ecc71);

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('เปิดเคส')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📝')
    );

    await interaction.channel.send({ embeds: [embed], components: [button] });
    await interaction.reply({ content: '✅ ตั้งค่าปุ่มเปิดเคสเรียบร้อยแล้ว', flags: 64 });
  },
};
