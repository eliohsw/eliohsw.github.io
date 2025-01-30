export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const systemToggle = document.getElementById('system-toggle');

  // Helper to get current theme state
  function getThemeState() {
    return {
      isSystem: !localStorage.getItem('theme'),
      currentTheme:
        document.documentElement.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    };
  }

  // Update UI state
  function updateUIState(isSystem) {
    systemToggle.classList.toggle('active', isSystem);
    themeToggle.classList.toggle('disabled', isSystem);
    themeToggle.style.pointerEvents = isSystem ? 'none' : 'auto';
  }

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

  // Initialize theme on page load
  const initialTheme = getThemeState();
  document.documentElement.setAttribute('data-theme', initialTheme.currentTheme);
  updateUIState(initialTheme.isSystem);

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (getThemeState().isSystem) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}
