let allProjects = [];
let activeTag = null;

function renderProjects(projects) {
  const list = document.querySelector('.projects-list');
  if (!list) return;
  list.innerHTML = projects.length > 0 ? projects.map(project => `
    <div class="card-box">
      <div class="card-box-header">
        <div class="card-header-row">
          <span class="card-date">${project.date}</span>
          <a class="card-link" href="${project.url}" target="_blank" aria-label="View Project">
            <span>View</span>
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </a>
        </div>
        <h2 class="card-title"><a href="${project.url}" target="_blank">${project.title}</a></h2>
      </div>
      <div class="card-subtitle">${project.subtitle}</div>
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
    <div class="filter-input-wrapper">
      <input type="text" class="filter-input" placeholder="Enter keyword" value="${activeTag && activeTag !== null ? activeTag : ''}" />
      <ion-icon class="filter-input-icon" name="search"></ion-icon>
    </div>
    <button class="filter-btn${activeTag === null ? ' active' : ''}" data-tag="__all">Show All</button>
  `;
  filterBar.querySelector('.filter-btn').onclick = () => {
    activeTag = null;
    renderProjects(allProjects);
    renderFilter();
  };
  const input = filterBar.querySelector('.filter-input');
  const icon = filterBar.querySelector('.filter-input-icon');
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
  icon.onclick = doSearch;
}

async function loadProjects() {
  const res = await fetch('../technical/data/projects.json');
  allProjects = await res.json();
  renderFilter();
  renderProjects(allProjects);
}

window.addEventListener('DOMContentLoaded', loadProjects); 