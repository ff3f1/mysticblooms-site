from bs4 import BeautifulSoup
from jinja2 import Template
from datetime import datetime
import re

POSTS_PER_PAGE = 10
seen_ids = set()

with open('messages.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

posts = []
for msg in soup.select('.message.default.clearfix'):
    try:
        # Извлекаем ID поста
        msg_id = msg.get('id', '')
        if not msg_id.startswith('message'):
            continue

        # Ищем числовой ID через регулярку
        post_id_match = re.search(r'\d+', msg_id)
        if not post_id_match:
            continue
        post_id = int(post_id_match.group())
        
        if post_id in seen_ids:
            continue
        seen_ids.add(post_id)

        # Извлекаем дату
        date_element = msg.select_one('.date')
        if not date_element:
            continue
        date_str = date_element['title'].split('UTC+03:00')[0].strip()
        post_date = datetime.strptime(date_str, "%d.%m.%Y %H:%M:%S")

        # Формируем пост
        posts.append({
            'id': post_id,
            'date': post_date,
            'content': str(msg)
        })
    except Exception as e:
        print(f"Ошибка в сообщении {msg_id}: {str(e)}")
        continue

# Сортируем и генерируем страницы
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