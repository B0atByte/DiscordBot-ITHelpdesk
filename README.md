# Discord IT Helpdesk Bot

ระบบแจ้งซ่อม IT ภายในองค์กรผ่าน Discord Bot พร้อม Web Admin Panel สำหรับจัดการข้อมูล

## Features

- **เปิด/ปิดเคส** ผ่านปุ่มใน Discord พร้อมฟอร์มกรอกข้อมูล
- **จำส่วนงาน** ของผู้ใช้อัตโนมัติ ไม่ต้องเลือกซ้ำทุกครั้ง
- **สร้าง Forum Thread** แยกแต่ละเคสเป็นห้องสนทนา
- **บันทึกแนวทางแก้ไข** ด้วยคำสั่ง `/solve`
- **Export Excel** ข้อมูล Ticket ทั้งหมดพร้อมจัดประเภทอัตโนมัติจาก keyword
- **Web Admin Panel** - Dashboard, จัดการ Tickets / Departments / Categories / Bot Config

## Tech Stack

- **Runtime:** Node.js
- **Bot:** discord.js v14
- **Database:** SQLite (better-sqlite3) with WAL mode
- **Web:** Express + EJS
- **Export:** ExcelJS

## Project Structure

```
├── index.js                  # Entry point - Bot + Web Server
├── database.js               # SQLite database operations
├── deploy-commands.js        # Register slash commands to Discord
├── config.json               # Departments & categories config
├── commands/
│   ├── setup.js              # /setup - วางปุ่มเปิดเคสในห้อง
│   ├── solve.js              # /solve - บันทึกแนวทางแก้ไข
│   └── export.js             # /export - Export ข้อมูลเป็น Excel
├── interactions/
│   ├── openTicketButton.js   # เลือกส่วนงาน + เปิดฟอร์ม
│   ├── ticketModal.js        # สร้าง Ticket จากฟอร์ม
│   └── ticketActions.js      # ปุ่มกำลังดำเนินการ / ปิดเคส
├── utils/
│   ├── departments.js        # โหลดข้อมูลส่วนงาน
│   ├── categories.js         # จัดประเภทงานจาก keyword
│   └── exportExcel.js        # สร้างไฟล์ Excel
└── web/
    ├── server.js             # Express routes
    └── views/                # EJS templates
        ├── header.ejs
        ├── footer.ejs
        ├── dashboard.ejs
        ├── tickets.ejs
        ├── departments.ejs
        ├── categories.ejs
        └── config.ejs
```

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/B0atByte/DiscordBot-ITHelpdesk.git
cd DiscordBot-ITHelpdesk
npm install
```

### 2. ตั้งค่า Environment

คัดลอก `.env.example` เป็น `.env` แล้วกรอกค่า:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_bot_client_id
GUILD_ID=your_discord_server_id
TICKET_FORUM_CHANNEL_ID=your_forum_channel_id
TICKET_LOG_CHANNEL_ID=your_log_channel_id
```

หรือตั้งค่าผ่าน Web Admin ที่ `http://localhost:3000/config`

### 3. สร้าง Discord Bot

1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. สร้าง Application ใหม่ แล้วเปิด Bot
3. เปิด Intents: **Server Members**, **Message Content**
4. Invite bot เข้า server ด้วย permission: `Send Messages`, `Manage Threads`, `Embed Links`, `Attach Files`
5. สร้าง **Forum Channel** ใน server สำหรับเก็บ Ticket threads

### 4. Register Slash Commands

```bash
npm run deploy
```

### 5. Start Bot

```bash
npm start
```

Bot จะออนไลน์พร้อม Web Admin Panel ที่ `http://localhost:3000`

## Usage

### Discord Commands

| Command | Description |
|---------|-------------|
| `/setup` | วางปุ่ม "เปิดเคส" ในห้องที่ต้องการ |
| `/solve <solution>` | บันทึกแนวทางแก้ไขในห้อง Ticket |
| `/export` | Export ข้อมูล Ticket ทั้งหมดเป็นไฟล์ Excel |

### Ticket Workflow

1. ผู้ใช้กดปุ่ม **เปิดเคส**
2. เลือก **ส่วนงาน** จาก dropdown
3. กรอก **ฟอร์มแจ้งซ่อม** (Floor, Computer, IP, VOICE, รหัสพนักงาน, ปัญหา)
4. Bot สร้าง **Forum Thread** พร้อม Embed แสดงข้อมูล
5. IT กดปุ่ม **กำลังดำเนินการ** เมื่อรับเคส
6. IT ใช้ `/solve` บันทึกแนวทางแก้ไข
7. IT กดปุ่ม **ปิดเคส** เมื่อเสร็จสิ้น

### Web Admin Panel

- **Dashboard** (`/`) - สรุปจำนวน Ticket แยกตามสถานะ
- **Tickets** (`/tickets`) - ดูรายการ Ticket ทั้งหมด กรองตามสถานะ
- **Departments** (`/departments`) - เพิ่ม/แก้ไข/ลบส่วนงาน
- **Categories** (`/categories`) - เพิ่ม/แก้ไข/ลบประเภทงานและ keyword
- **Config** (`/config`) - ตั้งค่า Bot Token และ Channel IDs
