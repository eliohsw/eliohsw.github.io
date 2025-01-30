export function initSidebar() {
  const menuBtn = document.querySelector('.menu-btn');
  const mobileSidebar = document.querySelector('.mobile-sidebar');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // Toggle sidebar on menu button click
  menuBtn.addEventListener('click', () => {
    toggleSidebar();
  });

  // Close sidebar when overlay is clicked
  overlay.addEventListener('click', () => {
    closeSidebar();
  });

  // Close sidebar when any link inside is clicked
  mobileSidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  // Optional: Close sidebar on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  function toggleSidebar() {
    mobileSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  }

  function closeSidebar() {
    mobileSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
}
