document.addEventListener('DOMContentLoaded', function() {
    // Ленивая загрузка изображений
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
  
      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback для старых браузеров
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
      });
    }
  
    // Обработка ошибок загрузки изображений
    document.querySelectorAll('img').forEach(img => {
      img.onerror = function() {
        if (this.dataset.fallback) {
          this.src = this.dataset.fallback;
        } else if (this.src.includes('.jpg') && this.src.includes('_thumb') === false) {
          this.src = this.src.replace('.jpg', '_thumb.jpg');
        }
      };
    });
  });