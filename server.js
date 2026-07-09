// Aqlli kamera monitoring tizimi - Backend server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// "public" papkasidagi sahifalarni ko'rsatish
app.use(express.static(path.join(__dirname, 'public')));

// Server holati (API)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ishlayapti',
    xabar: 'Aqlli kamera monitoring tizimi backend serveri faol',
    vaqt: new Date().toISOString()
  });
});

// AI chat (hozircha sinov javobi, keyin Claude ulaymiz)
app.post('/api/chat', (req, res) => {
  const savol = req.body.savol || '';
  res.json({
    javob: `Savolingiz qabul qilindi: "${savol}". AI tahlil tez orada ulanadi!`
  });
});

// Server holatini tekshirish (Render monitoring uchun)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});
