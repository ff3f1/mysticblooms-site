from bs4 import BeautifulSoup
from jinja2 import Template
import os
import datetime

POSTS_PER_PAGE = 10

with open('messages.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

posts = []
for msg in soup.select('.message.default'):
    try:
        date_element = msg.select_one('.date')
        if not date_element:
            continue
        
        date_str = date_element['title'].split('UTC')[0].strip()
        post_date = datetime.datetime.strptime(date_str, "%d.%m.%Y %H:%M:%S")
        
        post_id = int(msg['id'].split('-')[-1])
        
        posts.append({
            'id': post_id,
            'date': post_date,
            'content': str(msg)
        })
    except Exception as e:
        print(f"Ошибка в посте: {str(e)}")
        continue

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
