// generate-pages.js
const fs = require('fs');
const { JSDOM } = require('jsdom');

// 1. Удаляем старые файлы и создаем папки
if (fs.existsSync('pages')) fs.rmSync('pages', { recursive: true });
fs.mkdirSync('pages', { recursive: true });

// 2. Загрузка шаблонов
const head = fs.readFileSync('template-head.html', 'utf8');
const header = fs.readFileSync('header.html', 'utf8');

// 3. Парсинг архива с группировкой медиа
const html = fs.readFileSync('messages.html', 'utf8');
const dom = new JSDOM(html);
const postsMap = new Map();

Array.from(dom.window.document.querySelectorAll('.message')).forEach(msg => {
  const id = msg.id.replace('message', '');
  if (!id || isNaN(id)) return;

  const content = msg.querySelector('.text')?.innerHTML || '';
  const media = Array.from(msg.querySelectorAll('.media_wrap')).map(m => m.outerHTML).join('');
  
  if (!postsMap.has(id)) {
    postsMap.set(id, {
      content: content,
      media: media
    });
  } else {
    postsMap.get(id).media += media;
  }
});

// 4. Сортировка постов
const sortedPosts = Array.from(postsMap.entries())
  .sort((a, b) => b[0] - a[0])
  .map(([id, post]) => ({ id, ...post }));

// 5. Генерация страниц
const postsPerPage = 10;
const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

for (let page = 1; page <= totalPages; page++) {
  const start = (page - 1) * postsPerPage;
  const pagePosts = sortedPosts.slice(start, start + postsPerPage);
  
  const postsHtml = pagePosts.map(post => `
    <div class="post-card">
      ${post.content}
      ${post.media}
    </div>
  `).join('');

  const pagination = Array.from({ length: totalPages }, (_, i) => `
    <a href="page${i + 1}.html" class="page-link ${i + 1 === page ? 'active' : ''}">
      ${i + 1}
    </a>
  `).join('');

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>${head}</head>
      <body>
        ${header}
        <main class="max-w-4xl mx-auto px-4 py-8">
          ${postsHtml}
          <div class="pagination">${pagination}</div>
        </main>
      </body>
    </html>
  `;

  fs.writeFileSync(`pages/page${page}.html`, fullHtml);
}

// Генерация главной страницы
fs.copyFileSync('pages/page1.html', 'index.html');
console.log('✅ Сгенерировано страниц:', totalPages);