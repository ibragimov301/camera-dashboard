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

// AI chat - Claude bilan
app.post('/api/chat', async (req, res) => {
  const savol = req.body.savol || '';
  if (!savol) {
    return res.json({ javob: 'Iltimos, savol yozing.' });
  }

  try {
    const claudeJavob = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `Sen aqlli kamera monitoring tizimining yordamchisisan.
Foydalanuvchi - do'kon egasi, u kamera yozuvlari haqida savol beradi.
Har doim o'zbek tilida, sodda va qisqa javob ber.
Javoblaringda emoji, yulduzcha (*), pastki chiziq (_) kabi belgilar ishlatma - 
chunki javobing ovozda o'qib beriladi.
Hozircha kamera hali ulanmagan - agar foydalanuvchi kamera yozuvlari haqida so'rasa,
kamera tez orada ulanishini va hozircha umumiy savollarga javob bera olishingni ayt.
Boshqa mavzudagi savollarga ham yordam ber.`,
        messages: [
          { role: 'user', content: savol }
        ]
      })
    });

    const data = await claudeJavob.json();

    if (data.error) {
      console.error('Claude API xatosi:', data.error);
      return res.json({ javob: 'AI bilan bog\'lanishda xatolik: ' + (data.error.message || 'noma\'lum xato') });
    }

    const matn = data.content
      .map(item => (item.type === 'text' ? item.text : ''))
      .filter(Boolean)
      .join('\n');

    res.json({ javob: matn || 'Javob olinmadi.' });
  } catch (xato) {
    console.error('Xatolik:', xato);
    res.json({ javob: 'Serverda xatolik yuz berdi. Qayta urinib ko\'ring.' });
  }
});

// Matnni ovozga aylantirish - Aisha TTS
app.post('/api/ovoz', async (req, res) => {
  const matn = req.body.matn || '';
  if (!matn) {
    return res.status(400).json({ xato: 'Matn berilmadi' });
  }

  try {
    const forma = new FormData();
    forma.append('transcript', matn);
    forma.append('language', 'uz');
    forma.append('model', 'Gulnoza');
    forma.append('mood', 'Neutral');
    forma.append('speed', '1.0');

    const aishaJavob = await fetch('https://back.aisha.group/api/v1/tts/post/', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.AISHA_API_KEY,
        'Accept-Language': 'uz'
      },
      body: forma
    });

    const data = await aishaJavob.json();
    console.log('Aisha javobi:', JSON.stringify(data));

    if (data.audio_path) {
      // Nisbiy manzilni to'liq manzilga aylantirish
      const audioUrl = data.audio_path.startsWith('http')
        ? data.audio_path
        : 'https://back.aisha.group' + data.audio_path;
      return res.json({ audioUrl });
    }

    res.status(500).json({ xato: 'Audio yaratilmadi', tafsilot: data });
  } catch (xato) {
    console.error('TTS xatosi:', xato);
    res.status(500).json({ xato: 'Ovoz yaratishda xatolik' });
  }
});

// Server holatini tekshirish (Render monitoring uchun)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});
