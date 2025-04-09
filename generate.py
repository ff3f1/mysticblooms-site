from bs4 import BeautifulSoup
from jinja2 import Template
import os
import datetime

# Настройки
POSTS_PER_PAGE = 10

# Парсим архив
with open('messages.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

posts = []
for msg in soup.select('.message.default.clearfix'):
    try:
        date_str = msg.select_one('.date')['title']
        post_id = msg['id'].split('-')[-1]
        posts.append({
            'id': int(post_id),
            'date': datetime.datetime.strptime(date_str, "%d.%m.%Y %H:%M:%S UTC+03:00"),
            'content': str(msg)
        })
    except:
        continue

# Сортируем от новых к старым
posts.sort(key=lambda x: x['date'], reverse=True)

# Генерируем страницы
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