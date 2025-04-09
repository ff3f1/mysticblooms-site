document.addEventListener('DOMContentLoaded', () => {
  // Удаление дублей
  const posts = new Set();
  document.querySelectorAll('.post-card script').forEach(script => {
    const postId = script.dataset.telegramPost.split('/')[1];
    if(posts.has(postId)) {
      script.closest('.post-card').remove();
    } else {
      posts.add(postId);
    }
  });
});