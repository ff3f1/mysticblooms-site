const fs = require('fs');
const { JSDOM } = require('jsdom');

// 1. Парсим архив
const html = fs.readFileSync('messages.html', 'utf8');
const dom = new JSDOM(html);
const messageIds = Array.from(dom.window.document.querySelectorAll('.message'))
  .map(el => el.id.replace('message', ''))
  .filter(id => !isNaN(id))
  .filter((v, i, a) => a.indexOf(v) === i) // Уникальные ID
  .sort((a, b) => b - a); // Новые первыми

// 2. Генерируем страницы
const template = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>MysticBlooms</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <header class="header">...</header>
  <main><!-- CONTENT --></main>
</body>
</html>
`;

const postsPerPage = 10;
for(let i = 0; i < Math.ceil(messageIds.length / postsPerPage); i++) {
  const content = messageIds
    .slice(i * postsPerPage, (i + 1) * postsPerPage)
    .map(id => `
      <div class="post-card">
        <script async src="https://telegram.org/js/telegram-widget.js?22" 
          data-telegram-post="mysticbloomsflower/${id}"
          data-width="100%"
          data-dark="1"></script>
      </div>
    `).join('');
  
  fs.writeFileSync(`pages/page${i + 1}.html`, template.replace('<!-- CONTENT -->', content));
}