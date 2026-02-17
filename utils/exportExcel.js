const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { detectCategory } = require('./categories');

async function exportToExcel(tickets) {
  const exportDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('IT Tickets');

  sheet.columns = [
    { header: 'วันที่+เวลาเปิดเคส', key: 'opened_at', width: 22 },
    { header: 'วันที่+เวลาปิดเคส', key: 'closed_at', width: 22 },
    { header: 'Link Discord', key: 'channel_link', width: 35 },
    { header: 'ผู้แจ้ง', key: 'reporter', width: 18 },
    { header: 'ส่วนงาน', key: 'department', width: 18 },
    { header: 'Floor', key: 'floor', width: 10 },
    { header: 'Computer', key: 'computer', width: 15 },
    { header: 'IP', key: 'ip', width: 16 },
    { header: 'VOICE', key: 'voice', width: 12 },
    { header: 'รหัสพนักงาน', key: 'employee_id', width: 15 },
    { header: 'เจ้าของเครื่อง', key: 'owner_name', width: 18 },
    { header: 'ปัญหา', key: 'problem', width: 40 },
    { header: 'แนวทางแก้ไข', key: 'solution', width: 40 },
    { header: 'ความสำคัญ', key: 'priority', width: 12 },
    { header: 'ประเภทงาน', key: 'category', width: 28 },
    { header: 'ช่างเทคนิค', key: 'technician', width: 18 },
    { header: 'สถานะ', key: 'status', width: 12 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  for (const ticket of tickets) {
    sheet.addRow({
      opened_at: ticket.opened_at || '',
      closed_at: ticket.closed_at || '',
      channel_link: ticket.channel_link || '',
      reporter: ticket.reporter || '',
      department: ticket.department || '',
      floor: ticket.floor || '',
      computer: ticket.computer || '',
      ip: ticket.ip || '',
      voice: ticket.voice || '',
      employee_id: ticket.employee_id || '',
      owner_name: ticket.owner_name || '',
      problem: ticket.problem || '',
      solution: ticket.solution || '',
      priority: 'กลาง',
      category: detectCategory(ticket.problem || ''),
      technician: ticket.technician || '',
      status: ticket.status || '',
    });
  }

  // Auto-filter
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 17 },
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filePath = path.join(exportDir, `IT_Tickets_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

module.exports = { exportToExcel };
