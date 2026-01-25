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

document.addEventListener("DOMContentLoaded", function() {
  initSubpageTopButton();
  initTaskListToggle();
  // Add other main entry logic here if needed in the future
});
