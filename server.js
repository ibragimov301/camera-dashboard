// Aqlli kamera monitoring tizimi - Backend server
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Tizim ishlab turganini tekshirish uchun oddiy yo'l
app.get('/', (req, res) => {
  res.json({
    status: 'ishlayapti',
    xabar: 'Aqlli kamera monitoring tizimi backend serveri faol',
    vaqt: new Date().toISOString()
  });
});

// Server holatini tekshirish (Render buni monitoring uchun ishlatadi)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});
