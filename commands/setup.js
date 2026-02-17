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
      .setDescription(
        'หากคุณต้องการแจ้งปัญหาด้าน IT\nกรุณากดปุ่ม **เปิดเคส** ด้านล่างเพื่อเริ่มต้น'
      )
      .setColor(0x2ecc71)
      .setFooter({ text: 'IT Support Ticket System' });

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
