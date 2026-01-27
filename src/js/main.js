function initSubpageTopButton() {
  const topBtn = document.getElementById('subpage-top-btn');
  if (!topBtn) return;

  let ticking = false;

  const updateVisibility = () => {
    const threshold = window.innerHeight * 0.2;
    topBtn.classList.toggle('is-visible', window.scrollY > threshold);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateVisibility();
      ticking = false;
    });
  };

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  updateVisibility();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateVisibility);
}

function initTaskListToggle() {
  if (document.querySelector('.subpage-ind-page')) return;
  const items = document.querySelectorAll('li.task-list-item');
  if (!items.length) return;

  items.forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (checkbox?.checked) {
      item.classList.add('is-checked');
    }

    item.setAttribute('tabindex', '0');

    const toggleItem = () => {
      const nextState = !item.classList.contains('is-checked');
      item.classList.toggle('is-checked', nextState);
      if (checkbox) {
        checkbox.checked = nextState;
      }
    };

    item.addEventListener('click', (event) => {
      if (event.target.closest('a, button, input, textarea, select')) return;
      toggleItem();
    });

    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleItem();
    });
  });
}

function initCardDateBadgeToggle() {
  const wraps = document.querySelectorAll('.card-date-wrap');
  if (!wraps.length) return;

  wraps.forEach((wrap, index) => {
    const date = wrap.querySelector('.card-date');
    const badgeList = wrap.querySelector('.card-date-badge-list');
    if (!date || !badgeList) return;
    if (!badgeList.querySelector('.date-badge-item')) return;

    const badgeId = badgeList.id || `card-date-badges-${index + 1}`;
    badgeList.id = badgeId;

    date.classList.add('card-date-toggle');
    date.setAttribute('role', 'button');
    date.setAttribute('tabindex', '0');
    date.setAttribute('aria-controls', badgeId);
    date.setAttribute('aria-expanded', 'false');

    const toggleBadges = () => {
      const isVisible = badgeList.classList.toggle('is-visible');
      date.setAttribute('aria-expanded', String(isVisible));
    };

    date.addEventListener('click', (event) => {
      event.preventDefault();
      toggleBadges();
    });

    date.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleBadges();
    });
  });
}

function initSubpageMetaToggle() {
  const metas = document.querySelectorAll('.subpage-ind-meta');
  if (!metas.length) return;

  metas.forEach((meta, index) => {
    const date = meta.querySelector('.subpage-ind-date');
    const secondary = meta.querySelector('.subpage-ind-meta-secondary');
    if (!date || !secondary) return;

    const secondaryId = secondary.id || `subpage-meta-secondary-${index + 1}`;
    secondary.id = secondaryId;

    date.classList.add('subpage-ind-date-toggle');
    date.setAttribute('role', 'button');
    date.setAttribute('tabindex', '0');
    date.setAttribute('aria-controls', secondaryId);
    date.setAttribute('aria-expanded', 'false');

    const toggleSecondary = () => {
      const isVisible = secondary.classList.toggle('is-visible');
      date.setAttribute('aria-expanded', String(isVisible));
    };

    date.addEventListener('click', (event) => {
      event.preventDefault();
      toggleSecondary();
    });

    date.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleSecondary();
    });
  });
}

document.addEventListener("DOMContentLoaded", function() {
  initSubpageTopButton();
  initTaskListToggle();
  initCardDateBadgeToggle();
  initSubpageMetaToggle();
  // Add other main entry logic here if needed in the future
});
