document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const systemToggle = document.getElementById('system-toggle');
  const navBar = document.querySelector('.nav-bar');

  const menuBtn = document.querySelector('.menu-btn');
  const mobileSidebar = document.querySelector('.mobile-sidebar');
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
  
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
  
  // Scroll effects
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      navBar.classList.add('scrolled');
    } else {
      navBar.classList.remove('scrolled');
    }
  });

  menuBtn.addEventListener('click', () => {
    mobileSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });

  // Close sidebar when clicking outside or on a link
  overlay.addEventListener('click', closeSidebar);
  mobileSidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  function closeSidebar() {
    mobileSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  // Optional: Close sidebar on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar();
  });

  const greetings = [
    "Hello, I’m Elio.",
    "Hallo, ich bin Elio.",
    "Hola, soy Elio.",
    "Bonjour, je suis Elio.",
    "Ciao, sono Elio.",
    "Olá, eu sou Elio.",
    "Cześć, jestem Elio.",
    "Hallo, ik ben Elio.",
    "Zdravo, ja sam Elio.",
    "Привет, я Elio.",
    "Hei, olen Elio.",
    "Hei, jeg er Elio."
  ];

  let currentIndex = 0;
  const greetingElement = document.getElementById('greeting');

  function changeText() {
      // Fade out current text
      greetingElement.classList.add('fade');
      
      setTimeout(() => {
          // Update text after fade out
          currentIndex = (currentIndex + 1) % greetings.length;
          greetingElement.textContent = greetings[currentIndex];
          
          // Fade in new text
          greetingElement.classList.remove('fade');
      }, 1000); // Matches transition duration
  }

  // Start cycling after initial 2 seconds and repeat every 4 seconds
  setTimeout(() => {
      changeText();
      setInterval(changeText, 4000); // Total cycle time (fade out + display + fade in)
  }, 2000);
});