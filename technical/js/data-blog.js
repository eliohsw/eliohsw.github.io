async function loadBlogs() {
  const res = await fetch('../technical/data/blog.json');
  let blogs = await res.json();
  // Sort by date descending
  blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = document.querySelector('.blog-list');
  if (!list) return;
  list.innerHTML = blogs.length > 0 ? blogs.map(blog => `
    <div class="card-box">
      <div class="card-box-header">
        <div class="card-header-row">
          <span class="card-date">${blog.date}</span>
          <a class="card-link" href="${blog.url}" target="_blank" aria-label="Read Blog">
            <span>Read</span>
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </a>
        </div>
        <h2 class="card-title"><a href="${blog.url}" target="_blank">${blog.title}</a></h2>
      </div>
      <div class="card-subtitle">${blog.subtitle}</div>
    </div>
  `).join('') : '<div class="no-projects">Blog posts coming soon.</div>';
}

window.addEventListener('DOMContentLoaded', loadBlogs); 