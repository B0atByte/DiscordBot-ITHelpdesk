const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getAllTickets } = require('../database');
const { exportToExcel } = require('../utils/exportExcel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export')
    .setDescription('Export ข้อมูล Ticket ทั้งหมดเป็นไฟล์ Excel'),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const tickets = getAllTickets();

      if (tickets.length === 0) {
        return interaction.editReply({ content: '📭 ไม่มีข้อมูล Ticket ในระบบ' });
      }

      const filePath = await exportToExcel(tickets);
      const attachment = new AttachmentBuilder(filePath);

      await interaction.editReply({
        content: `✅ Export สำเร็จ! (${tickets.length} รายการ)\nประเภทงานถูกประเมินอัตโนมัติจาก keyword ในช่องปัญหา`,
        files: [attachment],
      });
    } catch (error) {
      console.error('Export error:', error);
      await interaction.editReply({ content: '❌ เกิดข้อผิดพลาดในการ Export' });
    }
  },
};
