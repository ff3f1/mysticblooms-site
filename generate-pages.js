const fs = require('fs');
const { JSDOM } = require('jsdom');

// Удаляем старые файлы
if (fs.existsSync('pages')) fs.rmSync('pages', { recursive: true });
fs.mkdirSync('pages');

// Шаблон страницы
const template = (content, page, totalPages) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/styles.css">
  <title>Страница ${page}</title>
</head>
<body>
  <header>
    <a href="/" class="header-link">← На главную</a>
  </header>
  
  <main>
    ${content}
    
    <div class="pagination">
      ${Array.from({ length: totalPages }, (_, i) => `
        <a href="/page${i + 1}.html" class="page-link ${i + 1 === page ? 'active' : ''}">
          ${i + 1}
        </a>
      `).join('')}
    </div>
  </main>
</body>
</html>
`;

// Парсим архив
const dom = new JSDOM(fs.readFileSync('messages.html', 'utf8'));
const posts = Array.from(dom.window.document.querySelectorAll('.message'))
  .filter(msg => {
    const id = msg.id.replace('message', '');
    return !isNaN(id) && id !== '';
  })
  .map(msg => {
    const media = Array.from(msg.querySelectorAll('.media_wrap'))
      .map(m => m.outerHTML)
      .join('');
    return `<div class="post-card">${msg.innerHTML}${media}</div>`;
  });

// Генерируем страницы
const postsPerPage = 10;
const totalPages = Math.ceil(posts.length / postsPerPage);

for (let page = 1; page <= totalPages; page++) {
  const start = (page - 1) * postsPerPage;
  const content = posts.slice(start, start + postsPerPage).join('');
  
  fs.writeFileSync(
    `pages/page${page}.html`, 
    template(content, page, totalPages)
  );
}

// Главная страница
fs.copyFileSync('pages/page1.html', 'index.html');
console.log('✅ Сгенерировано страниц:', totalPages);