// 分类筛选
const tags = document.querySelectorAll('.tag');
const cards = document.querySelectorAll('.card');

tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tags.forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    const filter = tag.dataset.filter;
    cards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// 移动端导航切换
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.display = open ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '60px';
    navLinks.style.right = '20px';
    navLinks.style.background = '#fff';
    navLinks.style.padding = '16px 24px';
    navLinks.style.borderRadius = '12px';
    navLinks.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)';
  });
}
