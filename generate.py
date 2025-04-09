from bs4 import BeautifulSoup
from jinja2 import Template
from datetime import datetime
import os

POSTS_PER_PAGE = 10
seen_ids = set()  # Для фильтрации дублей

with open('messages.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

posts = []
for msg in soup.select('.message.default.clearfix'):
    try:
        # Извлекаем ID поста
        msg_id = msg.get('id', '')
        if not msg_id.startswith('message'):
            continue
            
        post_id = int(msg_id.split('-')[-1])
        if post_id in seen_ids:
            continue
            
        seen_ids.add(post_id)

        # Парсим дату
        date_str = msg.select_one('.date')['title'].split('UTC+03:00')[0].strip()
        post_date = datetime.strptime(date_str, "%d.%m.%Y %H:%M:%S")

        posts.append({
            'id': post_id,
            'date': post_date,
            'content': str(msg)
        })
    except Exception as e:
        print(f"Ошибка в посте {post_id}: {str(e)}")
        continue

# Сортируем и разбиваем на страницы
posts.sort(key=lambda x: x['date'], reverse=True)
total_pages = (len(posts) + POSTS_PER_PAGE - 1) // POSTS_PER_PAGE

# Генерация HTML
for page in range(total_pages):
    start = page * POSTS_PER_PAGE
    page_posts = posts[start:start+POSTS_PER_PAGE]
    
    with open('template.html', 'r', encoding='utf-8') as f:
        template = Template(f.read())
    
    html = template.render(
        posts=page_posts,
        current_page=page+1,
        total_pages=total_pages
    )
    
    filename = 'index.html' if page == 0 else f'page{page+1}.html'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
