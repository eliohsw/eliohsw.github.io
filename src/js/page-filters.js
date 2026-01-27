function initCardFilters() {
  const filterContainer = document.querySelector('.cards-filter, .projects-filter');
  if (!filterContainer) return;

  const filterInput = filterContainer.querySelector('.filter-input');
  const filterIcon = filterContainer.querySelector('.filter-input-icon');
  const filterTagBtn = filterContainer.querySelector('.filter-tag');
  const showAllBtn = filterContainer.querySelector('.filter-all[data-tag="__all"]');
  const listEl = document.querySelector('.subpage-collection-list');

  if (!filterInput || !filterIcon || !filterTagBtn || !showAllBtn || !listEl) return;

  const cards = Array.from(listEl.querySelectorAll('.card-box'));
  if (!cards.length) return;

  const defaultPlaceholder = filterInput.getAttribute('placeholder') || '';
  const tagPlaceholder = filterInput.dataset.tagPlaceholder || 'Enter keyword';
  const emptyLabel = listEl.id === 'blog-list' ? 'posts' : 'projects';
  let isTagSearch = false;
  let layoutUpdatePending = false;

  function requestCardLayoutUpdate() {
    if (layoutUpdatePending) return;
    layoutUpdatePending = true;
    requestAnimationFrame(() => {
      layoutUpdatePending = false;
      window.dispatchEvent(new CustomEvent('cardLayoutUpdate'));
    });
  }

  function updateSearchModeUI() {
    filterTagBtn.classList.toggle('active', isTagSearch);
    filterInput.placeholder = isTagSearch ? tagPlaceholder : defaultPlaceholder;
  }

  function parseCardTags(card) {
    const rawTags = card.dataset.tagsJson;
    if (!rawTags) return [];
    try {
      const parsed = JSON.parse(rawTags);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function renderCardTags(card, highlightTag = '') {
    const tagContainer = card.querySelector('.card-tags');
    if (!tagContainer) return;

    const tags = parseCardTags(card);
    const tagsLower = tags.map((tag) => tag.toLowerCase());
    const pdfUrl = (card.dataset.pdfUrl || '').trim();
    const hasPdf = pdfUrl !== '';
    const totalTags = tags.length + (hasPdf ? 1 : 0);
    const overflowCount = totalTags > 4 ? totalTags - 4 : 0;
    const displayLimit = Math.max(0, 4 - (hasPdf ? 1 : 0));
    const highlight = highlightTag.trim().toLowerCase();
    const tagType = card.dataset.tagType;

    let orderedTags = tags;
    if (highlight) {
      let matchIndex = tagsLower.indexOf(highlight);
      if (matchIndex === -1) {
        matchIndex = tagsLower.findIndex((tag) => tag.includes(highlight));
      }
      if (matchIndex !== -1) {
        orderedTags = [tags[matchIndex], ...tags.filter((_, index) => index !== matchIndex)];
      }
    }

    tagContainer.innerHTML = '';

    if (hasPdf) {
      const pdfTag = document.createElement('a');
      pdfTag.className = 'card-tag card-tag--pdf';
      pdfTag.textContent = 'PDF';
      pdfTag.href = pdfUrl;
      pdfTag.target = '_blank';
      pdfTag.rel = 'noopener';
      if (tagType) pdfTag.dataset.type = tagType;
      tagContainer.appendChild(pdfTag);
    }

    orderedTags.slice(0, displayLimit).forEach((tag) => {
      const tagEl = document.createElement('span');
      tagEl.className = 'card-tag';
      tagEl.textContent = tag;
      tagEl.dataset.tag = tag.toLowerCase();
      if (tagType) tagEl.dataset.type = tagType;
      tagEl.style.cursor = 'pointer';
      tagContainer.appendChild(tagEl);
    });

    if (overflowCount > 0) {
      const overflowTag = document.createElement('span');
      overflowTag.className = 'card-tag card-tag--overflow';
      overflowTag.textContent = `+${overflowCount}`;
      overflowTag.setAttribute('aria-hidden', 'true');
      tagContainer.appendChild(overflowTag);
    }
  }

  function updateCardTagsDisplay(highlightTag = '') {
    cards.forEach((card) => renderCardTags(card, highlightTag));
    requestCardLayoutUpdate();
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
    updateCardTagsDisplay(isTagSearch ? lowerKeyword : '');
    requestCardLayoutUpdate();
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

  listEl.addEventListener('click', (event) => {
    const tag = event.target.closest('.card-tag');
    if (!tag) return;
    if (tag.classList.contains('card-tag--overflow') || tag.classList.contains('card-tag--pdf')) return;
    const tagName = tag.textContent.trim();
    isTagSearch = true;
    updateSearchModeUI();
    filterInput.value = tagName;
    filterCards(tagName);
  });

  updateSearchModeUI();
  updateCardTagsDisplay();
  requestCardLayoutUpdate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardFilters);
} else {
  initCardFilters();
}
