const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;

// Служим статические файлы (например, CSS)
app.use(express.static('public'));

// Роут: главная страница
app.get('/', async (req, res) => {
  const url = 'https://meduza.io/';

  try {
    // Добавляем заголовки, чтобы имитировать обычный браузер
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
      timeout: 100000 // таймаут 100 секунд
    });

    const $ = cheerio.load(data);
    const news = [];

    // Используем более общий селектор и добавляем проверку на наличие ссылок
    $('a').each((i, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const href = $el.attr('href');
      
      if (title && href && href.startsWith('/')) {
        const link = 'https://meduza.io' + href;
        // Фильтруем только новостные ссылки
        if (href.includes('feature/') || href.includes('news/')) {
          news.push({ title, link });
        }
      }
    });

    // Добавляем проверку на пустой массив новостей
    if (news.length === 0) {
      console.log('Не удалось найти новости на странице');
      throw new Error('Новости не найдены');
    }

        let html = `
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Новости с Meduza</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; background: #f9f9f9; }
          h1 { color: #222; }
          ul { padding: 0; list-style: none; }
          li { margin-bottom: 1rem; padding: 1rem; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          a { color: #0070f3; text-decoration: none; font-weight: bold; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Свежие новости с Meduza</h1>
        <ul>
          ${news.map(n => `<li><a href="${n.link}" target="_blank" rel="noopener noreferrer">${n.title}</a></li>`).join('')}
        </ul>
      </body>
      </html>
    `;

    res.send(html);

  } catch (err) {
    console.error('Ошибка парсинга:', err.message);
    res.status(500).send(`
      <html>
        <head><meta charset="UTF-8"><title>Ошибка</title></head>
        <body><h1>Ошибка при получении новостей</h1><p>${err.message}</p></body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
