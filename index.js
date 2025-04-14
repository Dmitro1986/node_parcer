const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const sassMiddleware = require('sass-middleware');

const app = express();
const PORT = 3000;

// SASS middleware (используем indentedSyntax для .sass)
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // важно!
    outputStyle: 'compressed',
    prefix: '/',
    debug: true
  })
);

// Express static
app.use(express.static(path.join(__dirname, 'public')));

// Pug setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Главная страница
app.get('/', async (req, res) => {
  const url = 'https://meduza.io/';
  // const url = 'https://deadline.com/';
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(data);
    const news = [];

    $('a').each((i, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const href = $el.attr('href');

      if (title && href && href.startsWith('/') && (href.includes('feature/') || href.includes('news/'))) {
        news.push({ title, link: 'https://meduza.io' + href });
        // news.push({ title, link: 'https://deadline.com' + href });
      }
    });

    res.render('index', { news });

  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при парсинге новостей');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
