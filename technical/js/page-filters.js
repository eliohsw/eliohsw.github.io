function initCardFilters() {
  const filterContainer = document.querySelector('.cards-filter, .projects-filter');
  if (!filterContainer) return;

  const filterInput = filterContainer.querySelector('.filter-input');
  const filterIcon = filterContainer.querySelector('.filter-input-icon');
  const filterTagBtn = filterContainer.querySelector('.filter-tag');
  const showAllBtn = filterContainer.querySelector('.filter-all[data-tag="__all"]');
  const listEl = document.querySelector('.projects-list') || document.querySelector('.blog-list');

  if (!filterInput || !filterIcon || !filterTagBtn || !showAllBtn || !listEl) return;

  const cards = Array.from(listEl.querySelectorAll('.card-box'));
  if (!cards.length) return;

  const defaultPlaceholder = filterInput.getAttribute('placeholder') || '';
  const tagPlaceholder = filterInput.dataset.tagPlaceholder || 'Enter tag name';
  const emptyLabel = listEl.classList.contains('blog-list') ? 'posts' : 'projects';
  let isTagSearch = false;

  function updateSearchModeUI() {
    filterTagBtn.classList.toggle('active', isTagSearch);
    filterInput.placeholder = isTagSearch ? tagPlaceholder : defaultPlaceholder;
  }

  function filterCards(keyword = '') {
    const lowerKeyword = keyword.toLowerCase().trim();
    let visibleCount = 0;

    cards.forEach((card) => {
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      const titleEl = card.querySelector('.card-title');
      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const matches = lowerKeyword === '' ||
        (isTagSearch
          ? tags.includes(lowerKeyword)
          : title.includes(lowerKeyword));

      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    const noCardsMsg = listEl.querySelector('.no-cards-filter');
    if (noCardsMsg) noCardsMsg.remove();

    if (visibleCount === 0 && lowerKeyword !== '') {
      const noCardsDiv = document.createElement('div');
      noCardsDiv.className = 'no-projects no-cards-filter';
      noCardsDiv.textContent = isTagSearch
        ? `No ${emptyLabel} found for this tag.`
        : `No ${emptyLabel} found for this keyword.`;
      listEl.appendChild(noCardsDiv);
    }

    showAllBtn.classList.toggle('active', visibleCount < cards.length);
  }

  function doSearch() {
    filterCards(filterInput.value);
  }

  filterInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') doSearch();
  });

  filterInput.addEventListener('input', () => {
    filterCards(filterInput.value);
  });

  filterIcon.addEventListener('click', doSearch);

  filterTagBtn.addEventListener('click', () => {
    isTagSearch = !isTagSearch;
    updateSearchModeUI();
    filterInput.value = '';
    filterCards();
  });

  showAllBtn.addEventListener('click', () => {
    isTagSearch = false;
    updateSearchModeUI();
    filterInput.value = '';
    filterCards();
  });

  listEl.querySelectorAll('.project-tag, .blog-tag').forEach((tag) => {
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', function() {
      const tagName = this.textContent.trim();
      isTagSearch = true;
      updateSearchModeUI();
      filterInput.value = tagName;
      filterCards(tagName);
    });
  });

  updateSearchModeUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardFilters);
} else {
  initCardFilters();
}
