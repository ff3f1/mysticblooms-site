from bs4 import BeautifulSoup
from jinja2 import Template
from datetime import datetime
import re

# Конфигурация
CHANNEL_NAME = "mysticbloomsflower"  # Измените на имя вашего канала
POSTS_PER_PAGE = 10
seen_ids = set()

with open('messages.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

posts = []
for msg in soup.select('.message.default.clearfix'):
    try:
        # Парсим ID поста
        msg_id = msg.get('id', '')
        if not msg_id.startswith('message'):
            continue

        post_id_match = re.search(r'\d+', msg_id)
        if not post_id_match:
            continue
        post_id = int(post_id_match.group())
        
        if post_id in seen_ids:
            continue
        seen_ids.add(post_id)

        # Парсим дату
        date_element = msg.select_one('.date')
        if not date_element:
            continue
        date_str = date_element['title'].split('UTC+03:00')[0].strip()
        post_date = datetime.strptime(date_str, "%d.%m.%Y %H:%M:%S")

        # Заменяем локальные пути изображений на Telegram CDN
        for img in msg.select('img[src^="photos/"]'):
            filename = img['src'].split('/')[-1]
            img['src'] = f"https://t.me/{CHANNEL_NAME}/{post_id}?media&type=photo&name={filename}"

        # Для видео (если есть)
        for video in msg.select('a[href^="video_files/"]'):
            filename = video['href'].split('/')[-1]
            video['href'] = f"https://t.me/{CHANNEL_NAME}/{post_id}?media&type=video&name={filename}"

        posts.append({
            'id': post_id,
            'date': post_date,
            'content': str(msg)
        })
    except Exception as e:
        print(f"Ошибка в посте ID-{post_id}: {str(e)}")
        continue

# Сортировка и генерация страниц
posts.sort(key=lambda x: x['date'], reverse=True)
total_pages = (len(posts) + POSTS_PER_PAGE - 1) // POSTS_PER_PAGE

for page in range(total_pages):
    start_idx = page * POSTS_PER_PAGE
    page_posts = posts[start_idx : start_idx + POSTS_PER_PAGE]
    
    with open('template.html', 'r', encoding='utf-8') as f:
        template = Template(f.read())
    
    html = template.render(
        posts=page_posts,
        current_page=page + 1,
        total_pages=total_pages
    )
    
    filename = 'index.html' if page == 0 else f'page{page + 1}.html'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
