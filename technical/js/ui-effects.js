// UI Effects Bundle
// This file merges greetings, ripple, scroll, sidebar, and theme logic.

export function initGreeting() {
  const greetingElement = document.getElementById('greeting');
  if (!greetingElement) return;
  greetingElement.textContent = "Loading...";
  fetch('../technical/data/greeting.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(greetings => {
      greetingElement.textContent = greetings[0];
      let currentIndex = 0;
      function changeText() {
        greetingElement.classList.add('fade');
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % greetings.length;
          greetingElement.textContent = greetings[currentIndex];
          greetingElement.classList.remove('fade');
        }, 1000);
      }
      setTimeout(() => {
        changeText();
        setInterval(changeText, 4000);
      }, 2000);
    })
    .catch(error => {
      console.error('Error loading greetings:', error);
      greetingElement.textContent = "Hi, I'm Elio";
    });
}

export function initRipple() {
  let clickCount = 0;
  let lastClickTime = 0;
  let lastX = 0;
  let lastY = 0;
  let timeoutId = null;
  const CLICK_THRESHOLD = 1;
  const REQUIRED_CLICKS = 8;
  const TIME_WINDOW = 1000;
  document.addEventListener('click', function(e) {
    if (e.clientY < 200) {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    }
    const currentTime = Date.now();
    const currentX = e.clientX;
    const currentY = e.clientY;
    if (clickCount > 0 && 
        (currentTime - lastClickTime > TIME_WINDOW ||
         Math.abs(currentX - lastX) > CLICK_THRESHOLD ||
         Math.abs(currentY - lastY) > CLICK_THRESHOLD)) {
      clickCount = 0;
    }
    clickCount++;
    lastX = currentX;
    lastY = currentY;
    lastClickTime = currentTime;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      clickCount = 0;
    }, TIME_WINDOW);
    if (clickCount === REQUIRED_CLICKS) {
      createSuperClicker(currentX, currentY);
      clickCount = 0;
    }
  });
  function createSuperClicker(x, y) {
    const text = document.createElement('div');
    text.className = 'super-clicker';
    text.textContent = 'SUPERCLICKER';
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    document.body.appendChild(text);
    text.addEventListener('animationend', () => {
      text.remove();
    });
  }
}

export function initScrollEffects() {
  const navBar = document.querySelector('.nav-bar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      navBar.classList.add('scrolled');
    } else {
      navBar.classList.remove('scrolled');
    }
  });
}

export function initSidebar() {
  const menuBtn = document.querySelector('.menu-btn');
  const mobileSidebar = document.querySelector('.mobile-sidebar');
  
  if (!menuBtn) {
    console.warn('Menu button not found - sidebar initialization skipped');
    return;
  }
  
  if (!mobileSidebar) {
    console.warn('Mobile sidebar not found - sidebar initialization skipped');
    return;
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
  menuBtn.addEventListener('click', () => {
    toggleSidebar();
  });
  overlay.addEventListener('click', () => {
    closeSidebar();
  });
  mobileSidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
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

export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const systemToggle = document.getElementById('system-toggle');
  
  if (!themeToggle) {
    console.warn('Theme toggle not found - theme initialization skipped');
    return;
  }
  
  if (!systemToggle) {
    console.warn('System toggle not found - theme initialization skipped');
    return;
  }
  
  function getThemeState() {
    return {
      isSystem: !localStorage.getItem('theme'),
      currentTheme:
        document.documentElement.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    };
  }
  function updateUIState(isSystem) {
    systemToggle.classList.toggle('active', isSystem);
    themeToggle.classList.remove('disabled');
    themeToggle.style.pointerEvents = 'auto';
  }
  themeToggle.addEventListener('click', () => {
    const { currentTheme } = getThemeState();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    animateLinkTransition();
    updateUIState(false);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  });
  const initialTheme = getThemeState();
  document.documentElement.setAttribute('data-theme', initialTheme.currentTheme);
  updateUIState(initialTheme.isSystem);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (getThemeState().isSystem) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      animateLinkTransition();
    }
  });
}

// Helper for theme transitions (from theme.js)
function animateLinkTransition() {
  document.body.classList.add('theme-transition');
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 300);
} 