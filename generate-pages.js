const fs = require('fs');
const { JSDOM } = require('jsdom');

// Удаление старой папки
if (fs.existsSync('pages')) fs.rmSync('pages', { recursive: true });
fs.mkdirSync('pages');

// Парсинг архива
const html = fs.readFileSync('messages.html', 'utf8');
const dom = new JSDOM(html);

// Группировка медиа
const posts = Array.from(dom.window.document.querySelectorAll('.message')).reduce((acc, msg) => {
  const id = msg.id.replace('message', '');
  if (!isNaN(id)) {
    const media = Array.from(msg.querySelectorAll('.media_wrap')).map(m => m.innerHTML);
    if (!acc[id]) acc[id] = { media: [] };
    acc[id].media.push(...media);
  }
  return acc;
}, {});

// Генерация страниц
const postsPerPage = 10;
const sortedIds = Object.keys(posts).sort((a, b) => b - a);

for (let page = 1; page <= Math.ceil(sortedIds.length / postsPerPage); page++) {
  const start = (page - 1) * postsPerPage;
  const pageIds = sortedIds.slice(start, start + postsPerPage);
  
  const content = pageIds.map(id => `
    <div class="post-card">
      ${posts[id].media.join('')}
    </div>
  `).join('');

  fs.writeFileSync(`pages/page${page}.html`, `
    <!DOCTYPE html>
    <html lang="ru">
    ${fs.readFileSync('template-head.html', 'utf8')}
    <body>
      <!-- Шапка -->
      ${fs.readFileSync('header.html', 'utf8')}
      
      <!-- Посты -->
      <main class="max-w-4xl mx-auto px-4 py-8">
        ${content}
        
        <!-- Пагинация -->
        <div class="pagination">
          ${Array.from({ length: Math.ceil(sortedIds.length / postsPerPage) }, (_, i) => `
            <a href="page${i + 1}.html" class="page-link">${i + 1}</a>
          `).join('')}
        </div>
      </main>
    </body>
    </html>
  `);
}

console.log('✅ Сгенерировано страниц:', Math.ceil(sortedIds.length / postsPerPage));