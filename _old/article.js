// 文章动态加载脚本
async function loadArticle(articleSlug, pathPrefix = '') {
  try {
    const response = await fetch(pathPrefix + 'data/articles.json');
    const data = await response.json();
    const article = data.articles.find(a => a.slug === articleSlug);

    if (!article) {
      document.getElementById('article-body').innerHTML =
        `<p>文章未找到。<a href="${pathPrefix}index.html">返回首页</a></p>`;
      return;
    }

    // 更新页面标题和元信息
    document.title = article.title + ' - 生活妙招';
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-title-breadcrumb').textContent = article.title;
    document.getElementById('category-link').textContent = article.categoryLabel;
    document.getElementById('article-author').textContent = article.author;
    document.getElementById('publish-date').textContent = article.publishDate;
    document.getElementById('read-time').textContent = article.readTime + ' 分钟';
    document.getElementById('likes-count').textContent = article.likes;

    // 插入文章正文 HTML
    document.getElementById('article-body').innerHTML = article.body;

    // 加载相关文章
    loadRelatedArticles(data.articles, article.category, article.id, pathPrefix);

  } catch (error) {
    console.error('加载文章失败:', error);
    document.getElementById('article-body').innerHTML =
      `<p>加载失败，请稍后重试。<a href="${pathPrefix}index.html">返回首页</a></p>`;
  }
}

function loadRelatedArticles(allArticles, currentCategory, currentId, pathPrefix = '') {
  const relatedArticles = allArticles
    .filter(a => a.category === currentCategory && a.id !== currentId)
    .slice(0, 3);

  const relatedContainer = document.getElementById('related-articles');

  if (relatedArticles.length === 0) {
    relatedContainer.innerHTML = '<p style="text-align:center;color:#666;">暂无相关文章</p>';
    return;
  }

  relatedContainer.innerHTML = relatedArticles.map(article => `
    <a href="${pathPrefix}${article.category}/${article.slug}.html" class="related-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <span style="font-size:1.5rem;">${article.icon}</span>
        <span style="font-size:.75rem;color:#00a8a8;font-weight:600;">${article.categoryLabel}</span>
      </div>
      <h4>${article.title}</h4>
      <p>${article.summary}</p>
    </a>
  `).join('');
}