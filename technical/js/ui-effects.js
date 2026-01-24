// UI Effects Bundle
// This file merges greetings, ripple, scroll, sidebar, and theme logic.

export function initGreeting() {
  const greetingElement = document.getElementById('greeting');
  if (!greetingElement) return;
  greetingElement.textContent = "Hi, I’m Elio.";
  
  let allGreetings = [];
  let validGreetings = [];
  let currentIndex = 0;
  let changeTextInterval = null;
  
  // Helper function to measure text width
  function getTextWidth(text, lang, element) {
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontSize = getComputedStyle(element).fontSize;
    tempElement.style.fontFamily = getComputedStyle(element).fontFamily;
    tempElement.style.fontWeight = getComputedStyle(element).fontWeight;
    
    // Apply language-specific font styling
    if (lang === 'ja' || lang === 'ko') {
      tempElement.style.fontFamily = "'Inter', 'Noto Sans JP', 'Noto Sans KR', sans-serif";
      tempElement.style.fontWeight = '620';
    } else {
      tempElement.style.fontFamily = "'Inter', 'Noto Sans Thai', 'Noto Sans Tamil', 'Noto Sans Devanagari', sans-serif";
      tempElement.style.fontWeight = '640';
    }
    
    tempElement.textContent = text;
    document.body.appendChild(tempElement);
    const width = tempElement.offsetWidth;
    document.body.removeChild(tempElement);
    return width;
  }
  
  // Function to filter greetings based on current container width
  function filterGreetingsByWidth() {
    const containerWidth = greetingElement.parentElement ? 
      greetingElement.parentElement.offsetWidth : 
      greetingElement.offsetWidth || window.innerWidth * 0.8;
    
    const filteredGreetings = allGreetings.filter(greeting => {
      const textWidth = getTextWidth(greeting.text, greeting.lang, greetingElement);
      return textWidth <= containerWidth;
    });
    
    return filteredGreetings.length > 0 ? filteredGreetings : allGreetings;
  }
  
  // Function to update greeting list and restart rotation
  function updateGreetingList() {
    const newValidGreetings = filterGreetingsByWidth();
    
    // If the valid greetings changed, update and restart
    if (JSON.stringify(newValidGreetings) !== JSON.stringify(validGreetings)) {
      validGreetings = newValidGreetings;
      
      // Find the current greeting in the new list or reset to 0
      const currentText = greetingElement.textContent;
      const newIndex = validGreetings.findIndex(greeting => greeting.text === currentText);
      currentIndex = newIndex !== -1 ? newIndex : 0;
      
      // If current greeting is not in the new valid list, change immediately
      if (newIndex === -1) {
        greetingElement.textContent = validGreetings[currentIndex].text;
        greetingElement.setAttribute('lang', validGreetings[currentIndex].lang);
      }
    }
  }
  
  function changeText() {
    greetingElement.classList.add('fade');
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % validGreetings.length;
      greetingElement.textContent = validGreetings[currentIndex].text;
      greetingElement.setAttribute('lang', validGreetings[currentIndex].lang);
      greetingElement.classList.remove('fade');
    }, 1000);
  }
  
  // Debounced resize handler to avoid excessive recalculations
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateGreetingList();
    }, 100);
  }
  
  fetch('../technical/data/greeting.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(greetings => {
      allGreetings = greetings;
      validGreetings = filterGreetingsByWidth();
      
      greetingElement.textContent = validGreetings[0].text;
      greetingElement.setAttribute('lang', validGreetings[0].lang);
      currentIndex = 0;
      
      // Add resize listener for dynamic updates
      window.addEventListener('resize', handleResize);
      
      setTimeout(() => {
        changeText();
        changeTextInterval = setInterval(changeText, 4000);
      }, 2000);
    })
    .catch(error => {
      console.error('Error loading greetings:', error);
      greetingElement.textContent = "Hi, I’m Elio";
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
  const pageBanner = document.querySelector('.page-banner');
  
  // Function to update navigation opacity based on scroll position
  function updateNavOpacity() {
    if (pageBanner) {
      // If there's a page banner, check if we've scrolled past it
      const bannerBottom = pageBanner.offsetTop + pageBanner.offsetHeight;
      const scrollPosition = window.scrollY;
      
      if (scrollPosition > bannerBottom) {
        // Scrolled past banner - set opacity to 0.5
        document.documentElement.style.setProperty('--nav-opacity', '0.5');
      } else {
        document.documentElement.style.setProperty('--nav-opacity', '1');
      }
    } else {
      document.documentElement.style.setProperty('--nav-opacity', '0.5');
    }
  }
  
  // Function to update scrolled class and effects
  function updateScrolledState() {
    if (window.scrollY > 0) {
      navBar.classList.add('scrolled');
    } else {
      navBar.classList.remove('scrolled');
    }
  }
  
  // Combined update function
  function updateAllScrollEffects() {
    updateScrolledState();
    updateNavOpacity();
  }
  
  window.addEventListener('scroll', updateAllScrollEffects);
  
  // Initialize both opacity and scrolled state on page load
  updateAllScrollEffects();
  
  // Handle browser scroll restoration with multiple checks
  // Check again after a short delay in case browser restores scroll position
  setTimeout(updateAllScrollEffects, 100);
  setTimeout(updateAllScrollEffects, 300);
  
  // Also listen for page show event (when returning from cache)
  window.addEventListener('pageshow', updateAllScrollEffects);
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

export function initCardImageHeights() {
  const cards = document.querySelectorAll('.card-contents');
  if (!cards.length) return;
  cards.forEach(card => {
    const images = card.querySelector('.card-images');
    if (images) images.classList.remove('is-ready');
  });
  const measures = new WeakMap();
  const measure = (card, info) => {
    let m = measures.get(card);
    if (!m) {
      m = info.cloneNode(true);
      Object.assign(m.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: '-9999px', top: '0', height: 'auto', maxWidth: 'none', width: '0px' });
      document.body.appendChild(m);
      measures.set(card, m);
    }
    return m;
  };
  const setHeight = (card) => {
    const info = card.querySelector('.card-info');
    const images = card.querySelector('.card-images');
    if (!info || !images || !images.querySelector('.card-image')) return;
    const w = card.getBoundingClientRect().width;
    if (!w) return;
    const m = measure(card, info);
    if (m.innerHTML !== info.innerHTML) m.innerHTML = info.innerHTML;
    m.style.width = `${Math.round(w)}px`;
    const h = m.getBoundingClientRect().height;
    if (h > 0) {
      card.style.setProperty('--card-info-height', `${Math.round(h)}px`);
      images.classList.add('is-ready');
    }
  };
  const update = () => requestAnimationFrame(() => cards.forEach(setHeight));
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(update, 100); });
  update();
  document.fonts?.ready?.then(update).catch(() => {});
  window.addEventListener('load', update);
}

export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const systemToggle = document.getElementById('system-toggle');
  
  if (!themeToggle) {
    console.warn('Theme toggle not found - theme initialization skipped');
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
    if (systemToggle) {
      systemToggle.classList.toggle('active', isSystem);
    }
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
