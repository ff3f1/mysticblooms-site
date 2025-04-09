const fs = require('fs');
const { JSDOM } = require('jsdom');

// 1. Создаем папку pages, если её нет
if (!fs.existsSync('pages')) {
  fs.mkdirSync('pages', { recursive: true });
}

// 2. Парсим ваш архив messages.html
const html = fs.readFileSync('messages.html', 'utf8');
const dom = new JSDOM(html);

// 3. Получаем все ID сообщений
const messages = Array.from(dom.window.document.querySelectorAll('.message'))
  .filter(msg => msg.id.startsWith('message') && !isNaN(msg.id.replace('message', '')))
  .map(msg => parseInt(msg.id.replace('message', '')))
  .filter((v, i, a) => a.indexOf(v) === i) // Удаляем дубли
  .sort((a, b) => b - a); // Сортируем от новых к старым

// 4. Шаблон HTML-страницы
const template = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MysticBlooms</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <header class="header">
    <a href="/" class="header-link">На главную</a>
  </header>
  <main class="posts-container">
    <!-- CONTENT -->
  </main>
</body>
</html>
`;

// 5. Генерируем страницы
const postsPerPage = 10;
for (let page = 1; page <= Math.ceil(messages.length / postsPerPage); page++) {
  const start = (page - 1) * postsPerPage;
  const end = page * postsPerPage;
  
  const content = messages
    .slice(start, end)
    .map(id => `
      <div class="post-card">
        <script async src="https://telegram.org/js/telegram-widget.js?22" 
          data-telegram-post="mysticbloomsflower/${id}" 
          data-width="100%"
          data-dark="1">
        </script>
      </div>
    `)
    .join('');

  fs.writeFileSync(`pages/page${page}.html`, template.replace('<!-- CONTENT -->', content));
}

console.log('✅ Страницы успешно сгенерированы в папке pages/');