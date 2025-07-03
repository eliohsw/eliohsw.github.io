let allProjects = [];
let activeTag = null;

function renderProjects(projects) {
  const list = document.querySelector('.projects-list');
  if (!list) return;
  list.innerHTML = projects.length > 0 ? projects.map(project => `
    <div class="project-box">
      <div class="project-box-header">
        <div class="project-header-row">
          <span class="project-date">${project.date}</span>
          <a class="project-link" href="${project.url}" target="_blank" aria-label="View Project">
            <span>View</span>
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </a>
        </div>
        <h2 class="project-title"><a href="${project.url}" target="_blank">${project.title}</a></h2>
      </div>
      <div class="project-subtitle">${project.subtitle}</div>
      <div class="project-tags">
        ${project.tags.map(tag => `<span class="project-tag" data-tag="${tag}">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('') : '<div class="no-projects">No projects found for this keyword.</div>';

  // Add click event to tags for filtering
  document.querySelectorAll('.project-tag').forEach(tagEl => {
    tagEl.style.cursor = 'pointer';
    tagEl.onclick = () => {
      const tag = tagEl.getAttribute('data-tag');
      activeTag = tag;
      renderProjects(allProjects.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase())));
      renderFilter();
      // Update filter input value
      const input = document.querySelector('.filter-input');
      if (input) input.value = tag;
    };
  });
}

function renderFilter() {
  let filterBar = document.querySelector('.projects-filter');
  if (!filterBar) {
    filterBar = document.createElement('div');
    filterBar.className = 'projects-filter';
    const container = document.querySelector('.main-content') || document.body;
    container.insertBefore(filterBar, document.querySelector('.projects-list'));
  }
  filterBar.innerHTML = `
    <button class="filter-btn${activeTag === null ? ' active' : ''}" data-tag="__all">Show All</button>
    <input type="text" class="filter-input" placeholder="Enter keyword/tag..." value="${activeTag && activeTag !== null ? activeTag : ''}" />
    <button class="filter-search-btn">Search</button>
  `;
  filterBar.querySelector('.filter-btn').onclick = () => {
    activeTag = null;
    renderProjects(allProjects);
    renderFilter();
  };
  const input = filterBar.querySelector('.filter-input');
  const searchBtn = filterBar.querySelector('.filter-search-btn');
  function doSearch() {
    const tag = input.value.trim();
    if (tag === '') {
      activeTag = null;
      renderProjects(allProjects);
    } else {
      activeTag = tag;
      renderProjects(allProjects.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase())));
    }
    renderFilter();
  }
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
  searchBtn.onclick = doSearch;
}

async function loadProjects() {
  const res = await fetch('../technical/data/projects.json');
  allProjects = await res.json();
  renderFilter();
  renderProjects(allProjects);
}

window.addEventListener('DOMContentLoaded', loadProjects); 