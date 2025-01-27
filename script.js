document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Get preferred theme
  const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  };

  // Set theme without persistence
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Persist theme choice
  const persistTheme = (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  };

  // Initial setup
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Toggle handler
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    persistTheme(newTheme);
  });

  // System theme change listener
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const systemThemeHandler = (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  };
  colorSchemeQuery.addEventListener('change', systemThemeHandler);

  // Cleanup
  window.addEventListener('beforeunload', () => {
    colorSchemeQuery.removeEventListener('change', systemThemeHandler);
  });

  document.addEventListener('click', function(e) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';

    if ('vibrate' in navigator) navigator.vibrate(10);
    
    // Use fixed positioning coordinates
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    
    document.body.appendChild(ripple);
  
    // Remove element after animation
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  });
});
