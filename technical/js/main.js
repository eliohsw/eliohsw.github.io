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

document.addEventListener("DOMContentLoaded", function() {
  initSubpageTopButton();
  // Add other main entry logic here if needed in the future
});
