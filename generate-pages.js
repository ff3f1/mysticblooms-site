const fs = require('fs');
const path = require('path');

// Пути к файлам
const DATA_PATH = './data/mock-data.json';
const OUTPUT_DIR = './pages';

// Создаем папки
[OUTPUT_DIR, './photos'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Чтение данных
const posts = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

// Генерация страниц
posts.forEach((post, index) => {
  const pageNumber = index + 1;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${post.text}</title>
      <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
      <header>
        <a href="../index.html" class="back-link">← Назад</a>
      </header>
      <div class="post-card">
        <div class="date">${post.date}</div>
        <img src="../photos/${post.photo}" 
             alt="${post.text}"
             onerror="this.src='../photos/${post.photo.replace('.jpg', '_thumb.jpg')}'">
        <p>${post.text}</p>
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(path.join(OUTPUT_DIR, `page${pageNumber}.html`), html);
});

console.log('Сгенерировано страниц:', posts.length);