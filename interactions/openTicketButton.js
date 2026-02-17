const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { getUserDepartment } = require('../database');
const { DEPARTMENTS } = require('../utils/departments');

async function handleOpenTicket(interaction) {
  const userId = interaction.user.id;
  const savedDept = getUserDepartment(userId);

  // Step 1: Show department select menu first
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_department')
    .setPlaceholder(savedDept ? `ส่วนงานล่าสุด: ${savedDept}` : 'เลือกส่วนงาน...')
    .addOptions(
      DEPARTMENTS.map((dept) => ({
        label: dept,
        value: dept,
        default: dept === savedDept,
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: '📋 **กรุณาเลือกส่วนงานของคุณก่อน** แล้วระบบจะเปิดแบบฟอร์มแจ้งซ่อม',
    components: [row],
    flags: 64,
  });
}

async function handleDepartmentSelect(interaction) {
  const department = interaction.values[0];

  // Show modal with remaining fields
  const modal = new ModalBuilder()
    .setCustomId(`ticket_modal_${department}`)
    .setTitle('แจ้งซ่อม IT');

  const floorInput = new TextInputBuilder()
    .setCustomId('floor')
    .setLabel('Floor')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(10);

  const computerInput = new TextInputBuilder()
    .setCustomId('computer')
    .setLabel('Computer')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(50);

  const ipVoiceEmpInput = new TextInputBuilder()
    .setCustomId('ip_voice_emp')
    .setLabel('IP | VOICE | รหัสพนักงาน (คั่นด้วย |)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('192.168.1.1 | 1234 | EMP001')
    .setRequired(true)
    .setMaxLength(100);

  const ownerInput = new TextInputBuilder()
    .setCustomId('owner_name')
    .setLabel('เจ้าของเครื่อง')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(50);

  const problemInput = new TextInputBuilder()
    .setCustomId('problem')
    .setLabel('ปัญหา')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  modal.addComponents(
    new ActionRowBuilder().addComponents(floorInput),
    new ActionRowBuilder().addComponents(computerInput),
    new ActionRowBuilder().addComponents(ipVoiceEmpInput),
    new ActionRowBuilder().addComponents(ownerInput),
    new ActionRowBuilder().addComponents(problemInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleOpenTicket, handleDepartmentSelect };
