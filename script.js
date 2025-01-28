document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const systemToggle = document.getElementById('system-toggle');
  const navBar = document.querySelector('.nav-bar');
  
  // Get current theme state
  const getThemeState = () => ({
    isSystem: !localStorage.getItem('theme'),
    currentTheme: document.documentElement.getAttribute('data-theme') || 
                 (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  });

  // Update UI state
  const updateUIState = (isSystem) => {
    systemToggle.classList.toggle('active', isSystem);
    themeToggle.classList.toggle('disabled', isSystem);
    themeToggle.style.pointerEvents = isSystem ? 'none' : 'auto';
  };

  // System toggle handler
  systemToggle.addEventListener('click', () => {
    const currentState = getThemeState();
    
    if (currentState.isSystem) {
      // If already in system mode, switch to manual with current system theme
      localStorage.setItem('theme', currentState.currentTheme);
      updateUIState(false);
    } else {
      // Switch to system mode
      localStorage.removeItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
      updateUIState(true);
    }
  });

  // Theme toggle handler
  themeToggle.addEventListener('click', () => {
    if (!themeToggle.classList.contains('disabled')) {
      const { currentTheme } = getThemeState();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      updateUIState(false);
    }
  });

  // Initialize
  const initialTheme = getThemeState();
  document.documentElement.setAttribute('data-theme', initialTheme.currentTheme);
  updateUIState(initialTheme.isSystem);

  // System theme change listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (getThemeState().isSystem) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  // Ripple effects
  document.addEventListener('click', function(e) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';

    if ('vibrate' in navigator) navigator.vibrate(10);
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      navBar.classList.add('scrolled');
    } else {
      navBar.classList.remove('scrolled');
    }
  });
});