const fs = require('fs');
const { JSDOM } = require('jsdom');

// Удаляем старую папку pages при каждом запуске
if (fs.existsSync('pages')) {
  fs.rmSync('pages', { recursive: true, force: true });
}
fs.mkdirSync('pages', { recursive: true });

// Парсинг архива
const html = fs.readFileSync('messages.html', 'utf8');
const dom = new JSDOM(html);

// Получение уникальных ID сообщений
const messages = Array.from(dom.window.document.querySelectorAll('.message'))
  .map(msg => msg.id.replace('message', ''))
  .filter(id => !isNaN(id) && id !== '') // Фильтр числовых ID
  .map(Number)
  .filter((v, i, a) => a.indexOf(v) === i) // Уникальные значения
  .sort((a, b) => b - a); // Сортировка новых -> старых

// Шаблон с динамической меткой времени
const template = (content) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Generated: ${new Date().toISOString()} -->
  <title>MysticBlooms</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <header class="header">
    <a href="/" class="header-link">На главную</a>
  </header>
  <main class="posts-container">
    ${content}
  </main>
</body>
</html>
`;

// Генерация страниц
const postsPerPage = 10;
for (let page = 1; page <= Math.ceil(messages.length / postsPerPage); page++) {
  const start = (page - 1) * postsPerPage;
  const content = messages
    .slice(start, start + postsPerPage)
    .map(id => `
      <div class="post-card">
        <script async src="https://telegram.org/js/telegram-widget.js?22" 
          data-telegram-post="mysticbloomsflower/${id}" 
          data-width="100%"
          data-dark="1">
        </script>
      </div>
    `).join('');

  fs.writeFileSync(`pages/page${page}.html`, template(content));
}

console.log('✅ Сгенерировано страниц:', messages.length);