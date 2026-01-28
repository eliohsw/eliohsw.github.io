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
  
  fetch('../src/data/greeting.json')
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

export function initFeaturedShowcase() {
  const container = document.querySelector('.featured-container');
  if (!container) return;
  if (container.dataset.featuredInit === 'true') return;

  const stage = container.querySelector('.featured-stage');
  const track = container.querySelector('.featured-track');
  const cards = Array.from(container.querySelectorAll('.featured-card'));
  if (!stage || !track || !cards.length) return;
  container.dataset.featuredInit = 'true';

  const fadeDurationMs = 1500;
  const retainDurationMs = 4500;
  const fadeStartDelayMs = 0;
  const slideSpeedPxPerSecond = 50;

  container.style.setProperty('--featured-fade-duration', `${fadeDurationMs}ms`);
  container.style.removeProperty('--featured-slide-duration');

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slideshowQuery = window.matchMedia('(min-width: 1200px)');

  const resetCardDateToggles = (card) => {
    if (!card) return;
    card.querySelectorAll('.card-date-badge-list.is-visible').forEach((list) => {
      list.classList.remove('is-visible');
    });
    card.querySelectorAll('.card-date-toggle[aria-expanded="true"]').forEach((toggle) => {
      toggle.setAttribute('aria-expanded', 'false');
    });
  };

  let mode = '';
  let teardown = () => {};
  let syncLayout = null;
  let freezeLayout = null;
  let clearFreezeLayout = null;
  let rafId = null;
  let resizePauseTimeout = null;
  let isResizing = false;

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      updateMode();
    });
  };

  const updateMode = () => {
    const prefersReduced = reduceMotionQuery.matches;
    const canSlide = slideshowQuery.matches && cards.length >= 4;
    let nextMode = 'fade';

    if (prefersReduced) {
      nextMode = 'reduced';
    } else if (cards.length <= 1) {
      nextMode = 'static';
    } else if (canSlide) {
      nextMode = 'slideshow';
    }

    if (nextMode !== mode) {
      const prevMode = mode;
      teardown();
      mode = nextMode;
      container.dataset.featuredMode = nextMode;
      const next = setupMode(nextMode, prevMode);
      teardown = next.teardown;
      syncLayout = next.sync;
      freezeLayout = next.freeze;
      clearFreezeLayout = next.clear;
    } else if (syncLayout) {
      syncLayout();
    }
  };

  const setupMode = (nextMode, prevMode) => {
    const wasResizing = isResizing;
    container.classList.remove(
      'is-fade',
      'is-slideshow',
      'is-static',
      'is-reduced',
      'is-instant',
      'is-resizing',
      'is-fade-reset'
    );
    container.classList.add(`is-${nextMode}`);
    if (wasResizing) {
      container.classList.add('is-resizing');
    }
    track.style.transform = '';
    track.style.animation = '';
    stage.style.height = '';

    cards.forEach((card) => {
      card.classList.remove('is-active');
      card.setAttribute('aria-hidden', 'true');
    });

    if (nextMode === 'static') {
      cards.forEach((card) => card.setAttribute('aria-hidden', 'false'));
      return { teardown: () => {}, sync: null, freeze: null, clear: null };
    }

    if (nextMode === 'reduced') {
      cards.forEach((card) => card.setAttribute('aria-hidden', 'false'));
      return { teardown: () => {}, sync: null, freeze: null, clear: null };
    }

    if (nextMode === 'slideshow') {
      return setupSlideshow({ hideUntilSync: prevMode !== 'slideshow' });
    }

    if (nextMode === 'fade' && (prevMode === 'slideshow' || prevMode === '')) {
      container.classList.add('is-fade-reset');
    }

    const fadeHandlers = setupFade();
    return { ...fadeHandlers, freeze: null, clear: null };
  };

  const setupFade = () => {
    let currentIndex = 0;
    let phase = 'idle';
    let fadeTimeout = null;
    let retainTimeout = null;
    let retainStart = 0;
    let retainRemaining = retainDurationMs;
    let isPaused = false;
    let startDelayTimeout = null;
    let resizeObserver = null;
    let pendingReset = container.classList.contains('is-fade-reset');

    const updateStageHeight = () => {
      const heights = cards.map((card) => card.getBoundingClientRect().height).filter((h) => h > 0);
      if (!heights.length) return;
      const maxHeight = Math.max(...heights);
      stage.style.height = `${Math.ceil(maxHeight)}px`;
    };

    const clearTimers = () => {
      clearTimeout(fadeTimeout);
      clearTimeout(retainTimeout);
      clearTimeout(startDelayTimeout);
    };

    const pause = () => {
      if (phase !== 'retain' || isPaused) return;
      isPaused = true;
      clearTimeout(retainTimeout);
      const elapsed = performance.now() - retainStart;
      retainRemaining = Math.max(0, retainRemaining - elapsed);
    };

    const resume = () => {
      if (!isPaused || phase !== 'retain') return;
      isPaused = false;
      if (retainRemaining <= 0) {
        startFadeOut();
        return;
      }
      retainStart = performance.now();
      retainTimeout = setTimeout(startFadeOut, retainRemaining);
    };

    const startRetain = () => {
      phase = 'retain';
      retainStart = performance.now();
      retainRemaining = retainDurationMs;
      if (cards[currentIndex]?.matches(':hover')) {
        pause();
        return;
      }
      retainTimeout = setTimeout(startFadeOut, retainRemaining);
    };

    const activateCard = () => {
      const card = cards[currentIndex];
      if (!card) return;
      card.classList.add('is-active');
      card.setAttribute('aria-hidden', 'false');
      updateStageHeight();
      fadeTimeout = setTimeout(() => {
        startRetain();
      }, fadeDurationMs);
    };

    const startFadeIn = () => {
      phase = 'fade-in';
      if (pendingReset) {
        pendingReset = false;
        activateCard();
        requestAnimationFrame(() => {
          container.classList.remove('is-fade-reset');
        });
        return;
      }
      activateCard();
    };

    const startFadeOut = () => {
      phase = 'fade-out';
      const card = cards[currentIndex];
      if (card) {
        card.classList.remove('is-active');
        card.setAttribute('aria-hidden', 'true');
        setTimeout(() => resetCardDateToggles(card), fadeDurationMs);
      }
      fadeTimeout = setTimeout(() => {
        currentIndex = (currentIndex + 1) % cards.length;
        startFadeIn();
      }, fadeDurationMs);
    };

    const handleEnter = (event) => {
      const card = event.currentTarget;
      if (card !== cards[currentIndex]) return;
      pause();
    };

    const handleLeave = (event) => {
      const card = event.currentTarget;
      if (card !== cards[currentIndex]) return;
      resume();
    };

    cards.forEach((card) => {
      card.addEventListener('pointerenter', handleEnter);
      card.addEventListener('pointerleave', handleLeave);
    });

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => updateStageHeight());
      cards.forEach((card) => resizeObserver.observe(card));
    } else {
      window.addEventListener('resize', updateStageHeight);
    }

    document.fonts?.ready?.then(updateStageHeight).catch(() => {});
    window.addEventListener('load', updateStageHeight, { once: true });
    updateStageHeight();

    startDelayTimeout = setTimeout(() => {
      requestAnimationFrame(startFadeIn);
    }, fadeStartDelayMs);

    const teardownFade = () => {
      clearTimers();
      cards.forEach((card) => {
        card.removeEventListener('pointerenter', handleEnter);
        card.removeEventListener('pointerleave', handleLeave);
      });
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateStageHeight);
    };

    return { teardown: teardownFade, sync: updateStageHeight, freeze: null, clear: null };
  };

  const setupSlideshow = (options = {}) => {
    const { hideUntilSync = false } = options;
    let resizeObserver = null;
    let visibilityObserver = null;
    let rafId = null;
    let setSpan = 0;
    let firstOriginalOffset = 0;
    let firstOriginalWidth = 0;
    let anchorWithinSet = null;
    let resizeAnchorWithinSet = null;
    let resumeAnchorWithinSet = null;
    let hasSynced = false;
    let revealAfterFirstSync = Boolean(hideUntilSync);

    if (revealAfterFirstSync) {
      track.style.visibility = 'hidden';
    }

    const clearClones = () => {
      track.querySelectorAll('.featured-card[data-clone="true"]').forEach((node) => {
        node.remove();
      });
    };

    const scrubCloneIds = (clone) => {
      clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      clone.querySelectorAll('[aria-controls]').forEach((el) => el.removeAttribute('aria-controls'));
    };

    const copyCardMeasurements = (source, clone) => {
      const sourceContents = source.querySelector('.card-contents');
      const cloneContents = clone.querySelector('.card-contents');
      if (!sourceContents || !cloneContents) return;
      const heightVar = getComputedStyle(sourceContents).getPropertyValue('--card-info-height').trim();
      if (heightVar) {
        cloneContents.style.setProperty('--card-info-height', heightVar);
      }
    };

    const resetAnimation = () => {
      if (container.classList.contains('is-resizing')) return;
      track.style.animation = 'none';
      track.offsetHeight;
      track.style.animation = '';
    };

    const getTransformInfo = () => {
      const trackStyle = window.getComputedStyle(track);
      const matrix = new DOMMatrixReadOnly(trackStyle.transform);
      const currentTranslate = Number.isFinite(matrix.m41) ? matrix.m41 : 0;
      const trackRect = track.getBoundingClientRect();
      const baseLeft = trackRect.left - currentTranslate;
      return { trackStyle, trackRect, currentTranslate, baseLeft };
    };

    const normalizeWithinSet = (value) => {
      if (value === null || !setSpan) return value;
      const mod = value % setSpan;
      return mod < 0 ? mod + setSpan : mod;
    };

    const computeAnchorWithinSetFromCurrent = () => {
      if (!setSpan) return null;
      const stageRect = stage.getBoundingClientRect();
      if (!stageRect.width) return null;
      const stageCenter = stageRect.left + stageRect.width / 2;
      const { currentTranslate, baseLeft } = getTransformInfo();
      const anchorX0 = stageCenter - baseLeft - currentTranslate;
      const raw = anchorX0 - firstOriginalOffset;
      return normalizeWithinSet(raw);
    };

    const applyMarqueeFromAnchor = (anchorX0, { animate = true } = {}) => {
      if (!setSpan) return;
      const stageRect = stage.getBoundingClientRect();
      if (!stageRect.width) return;
      const stageCenter = stageRect.left + stageRect.width / 2;
      const { baseLeft } = getTransformInfo();
      const startTranslate = stageCenter - baseLeft - anchorX0;
      track.style.setProperty('--featured-marquee-start', `${startTranslate}px`);
      track.style.setProperty('--featured-marquee-end', `${startTranslate - setSpan}px`);
      if (animate) {
        track.style.transform = '';
        resetAnimation();
      } else {
        track.style.animation = 'none';
        track.style.transform = `translateX(${startTranslate}px)`;
      }
    };

    const syncMarquee = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const resizingNow = isResizing || container.classList.contains('is-resizing');
        if (resizingNow && resizeAnchorWithinSet === null) {
          resizeAnchorWithinSet = computeAnchorWithinSetFromCurrent();
        }
        let preferredAnchorWithinSet = null;
        if (resizingNow) {
          preferredAnchorWithinSet = resizeAnchorWithinSet;
        } else if (resumeAnchorWithinSet !== null) {
          preferredAnchorWithinSet = resumeAnchorWithinSet;
        } else if (hasSynced) {
          preferredAnchorWithinSet = computeAnchorWithinSetFromCurrent();
        }
        clearClones();
        const originals = Array.from(track.querySelectorAll('.featured-card')).filter(
          (card) => card.dataset.clone !== 'true'
        );
        if (!originals.length) return;
        originals.forEach((card) => card.setAttribute('aria-hidden', 'false'));
        const { trackStyle: trackStyles } = getTransformInfo();
        const gapValue = trackStyles.columnGap || trackStyles.gap || '0px';
        const gap = Number.parseFloat(gapValue) || 0;
        const setWidth = originals.reduce((total, card, index) => {
          const width = card.getBoundingClientRect().width;
          const next = total + width;
          return index < originals.length - 1 ? next + gap : next;
        }, 0);
        const setSpanRaw = setWidth + (originals.length > 0 ? gap : 0);
        if (!setWidth) {
          requestAnimationFrame(syncMarquee);
          return;
        }
        setSpan = Math.round(setSpanRaw);
        const duration = Math.max(12, setSpan / slideSpeedPxPerSecond);
        track.style.setProperty('--featured-marquee-distance', `${setSpan}px`);
        track.style.setProperty('--featured-marquee-duration', `${duration}s`);
        const stageRect = stage.getBoundingClientRect();
        const repeatSets = Math.max(1, Math.ceil(stageRect.width / setSpan) + 1);
        const fragmentBefore = document.createDocumentFragment();
        const fragmentAfter = document.createDocumentFragment();
        for (let i = 0; i < repeatSets; i += 1) {
          originals.forEach((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.clone = 'true';
            clone.setAttribute('aria-hidden', 'true');
            scrubCloneIds(clone);
            copyCardMeasurements(card, clone);
            resetCardDateToggles(clone);
            fragmentAfter.appendChild(clone);
          });
        }
        for (let i = 0; i < repeatSets; i += 1) {
          originals.forEach((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.clone = 'true';
            clone.setAttribute('aria-hidden', 'true');
            scrubCloneIds(clone);
            copyCardMeasurements(card, clone);
            resetCardDateToggles(clone);
            fragmentBefore.appendChild(clone);
          });
        }
        track.prepend(fragmentBefore);
        track.appendChild(fragmentAfter);

        const firstOriginal = originals[0];
        firstOriginalOffset = firstOriginal.offsetLeft;
        firstOriginalWidth = firstOriginal.getBoundingClientRect().width;

        let resolvedAnchorWithinSet = preferredAnchorWithinSet;
        if (resolvedAnchorWithinSet === null) {
          resolvedAnchorWithinSet = firstOriginalWidth / 2;
        }
        resolvedAnchorWithinSet = normalizeWithinSet(resolvedAnchorWithinSet);
        anchorWithinSet = resolvedAnchorWithinSet;
        if (resizingNow && resizeAnchorWithinSet === null) {
          resizeAnchorWithinSet = resolvedAnchorWithinSet;
        }
        if (!resizingNow) {
          resumeAnchorWithinSet = null;
          resizeAnchorWithinSet = null;
        }
        const anchorX0 = firstOriginalOffset + resolvedAnchorWithinSet;
        applyMarqueeFromAnchor(anchorX0, { animate: !resizingNow });
        hasSynced = true;
        if (revealAfterFirstSync) {
          track.style.visibility = '';
          revealAfterFirstSync = false;
        }
        if (visibilityObserver) {
          visibilityObserver.disconnect();
          track.querySelectorAll('.featured-card').forEach((card) => {
            visibilityObserver.observe(card);
          });
        }
      });
    };

    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              resetCardDateToggles(entry.target);
            }
          });
        },
        { root: null, threshold: 0 }
      );
    }

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => syncMarquee());
      resizeObserver.observe(stage);
      cards.forEach((card) => resizeObserver.observe(card));
    } else {
      window.addEventListener('resize', syncMarquee);
    }

    document.fonts?.ready?.then(syncMarquee).catch(() => {});
    window.addEventListener('load', syncMarquee, { once: true });
    syncMarquee();

    const teardownSlideshow = () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearClones();
      track.style.removeProperty('--featured-marquee-distance');
      track.style.removeProperty('--featured-marquee-start');
      track.style.removeProperty('--featured-marquee-end');
      track.style.removeProperty('--featured-marquee-duration');
      track.style.animation = '';
      if (visibilityObserver) {
        visibilityObserver.disconnect();
      }
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', syncMarquee);
    };

    const freezeMarquee = () => {
      const { currentTranslate, baseLeft } = getTransformInfo();
      if (resizeAnchorWithinSet === null) {
        resizeAnchorWithinSet = computeAnchorWithinSetFromCurrent() ?? anchorWithinSet;
      }
      if (!setSpan || resizeAnchorWithinSet === null) {
        track.style.animation = 'none';
        track.style.transform = `translateX(${currentTranslate}px)`;
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      if (!stageRect.width) return;
      const stageCenter = stageRect.left + stageRect.width / 2;
      const anchorX0 = firstOriginalOffset + resizeAnchorWithinSet;
      const desiredTranslate = stageCenter - baseLeft - anchorX0;
      track.style.animation = 'none';
      track.style.transform = `translateX(${desiredTranslate}px)`;
    };

    const clearFreeze = () => {
      resumeAnchorWithinSet = resizeAnchorWithinSet;
      resizeAnchorWithinSet = null;
    };

    return { teardown: teardownSlideshow, sync: syncMarquee, freeze: freezeMarquee, clear: clearFreeze };
  };

  if (reduceMotionQuery.addEventListener) {
    reduceMotionQuery.addEventListener('change', scheduleUpdate);
  } else {
    reduceMotionQuery.addListener(scheduleUpdate);
  }

  if (slideshowQuery.addEventListener) {
    slideshowQuery.addEventListener('change', scheduleUpdate);
  } else {
    slideshowQuery.addListener(scheduleUpdate);
  }

  const handleResize = () => {
    isResizing = true;
    container.classList.add('is-resizing');
    if (typeof freezeLayout === 'function') {
      freezeLayout();
    }

    clearTimeout(resizePauseTimeout);
    resizePauseTimeout = setTimeout(() => {
      isResizing = false;
      container.classList.remove('is-resizing');
      if (typeof clearFreezeLayout === 'function') {
        clearFreezeLayout();
      } else {
        track.style.transform = '';
        track.style.animation = '';
      }
      scheduleUpdate();
    }, 250);
  };

  window.addEventListener('resize', handleResize);
  updateMode();
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
  const updateImageCount = (images) => {
    const total = Number.parseInt(images.dataset.imageCount || '', 10);
    const imageTotal = Number.isFinite(total) ? total : images.querySelectorAll('.card-image').length;
    const remaining = Math.max(0, imageTotal - 1);
    let counter = images.querySelector('.card-image-count');
    if (remaining > 0) {
      if (!counter) {
        counter = document.createElement('span');
        counter.className = 'card-image-count';
        counter.setAttribute('aria-hidden', 'true');
        images.appendChild(counter);
      }
      counter.textContent = `+${remaining}`;
      counter.style.display = 'inline-flex';
    } else if (counter) {
      counter.style.display = 'none';
    }
  };
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
    if (!info) return;
    const w = card.getBoundingClientRect().width;
    if (!w) return;
    const m = measure(card, info);
    if (m.innerHTML !== info.innerHTML) m.innerHTML = info.innerHTML;
    const infoWidth = info.getBoundingClientRect().width || w;
    m.style.width = `${Math.round(infoWidth)}px`;
    const h = m.getBoundingClientRect().height;
    if (h > 0) {
      card.style.setProperty('--card-info-height', `${Math.round(h)}px`);
      if (images && images.querySelector('.card-image')) {
        images.classList.add('is-ready');
        updateImageCount(images);
      } else if (images) {
        images.classList.remove('is-ready');
      }
    }
  };
  const update = () => requestAnimationFrame(() => cards.forEach(setHeight));
  const schedule = (() => {
    const pending = new Set();
    let rafId = null;
    return (card) => {
      if (card) pending.add(card);
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (pending.size) {
          pending.forEach(setHeight);
          pending.clear();
        } else {
          cards.forEach(setHeight);
        }
        rafId = null;
      });
    };
  })();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target.closest?.('.card-contents') || entry.target;
        schedule(card);
      });
    });
    cards.forEach((card) => observer.observe(card));
    document.querySelectorAll('.card-info').forEach((info) => observer.observe(info));
  } else {
    window.addEventListener('resize', () => schedule());
  }
  window.addEventListener('cardLayoutUpdate', () => schedule());
  schedule();
  document.fonts?.ready?.then(update).catch(() => {});
  window.addEventListener('load', update);
}

export function initCardImagePreview() {
  const cardImages = Array.from(document.querySelectorAll('.card-image'));
  if (!cardImages.length) return;

  let overlay = document.querySelector('.image-preview-overlay');
  let previewImage = null;
  let closeButton = null;
  let activeSource = null;

  const buildOverlay = () => {
    overlay = document.createElement('div');
    overlay.className = 'image-preview-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="image-preview-dialog" role="dialog" aria-modal="true" aria-label="Image preview">
        <button class="image-preview-close" type="button" aria-label="Close preview">
          <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512" aria-hidden="true">
            <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"></path>
          </svg>
        </button>
        <img class="image-preview-image" alt="" />
      </div>
    `;
    document.body.appendChild(overlay);
    previewImage = overlay.querySelector('.image-preview-image');
    closeButton = overlay.querySelector('.image-preview-close');

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closePreview();
    });

    closeButton.addEventListener('click', closePreview);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('is-visible')) {
        closePreview();
      }
    });
  };

  const ensureOverlay = () => {
    if (!overlay) buildOverlay();
    if (!previewImage) previewImage = overlay.querySelector('.image-preview-image');
    if (!closeButton) closeButton = overlay.querySelector('.image-preview-close');
  };

  const setPreviewSize = (sourceImage) => {
    if (!previewImage || !sourceImage) return;
    const naturalWidth = previewImage.naturalWidth || sourceImage.naturalWidth;
    const naturalHeight = previewImage.naturalHeight || sourceImage.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;

    const baseWidth = naturalWidth;
    const baseHeight = naturalHeight;
    const maxWidth = Math.min(baseWidth * 1, window.innerWidth * 0.9);
    const maxHeight = Math.min(baseHeight * 1, window.innerHeight * 0.9);
    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
    const displayWidth = Math.max(1, Math.floor(naturalWidth * scale));
    const displayHeight = Math.max(1, Math.floor(naturalHeight * scale));

    previewImage.style.width = `${displayWidth}px`;
    previewImage.style.height = `${displayHeight}px`;
  };

  const openPreview = (sourceImage) => {
    ensureOverlay();
    activeSource = sourceImage;
    previewImage.removeAttribute('srcset');
    previewImage.removeAttribute('sizes');

    if (sourceImage.srcset) {
      previewImage.srcset = sourceImage.srcset;
      if (sourceImage.sizes) previewImage.sizes = sourceImage.sizes;
    }

    previewImage.src = sourceImage.currentSrc || sourceImage.src;
    previewImage.alt = sourceImage.alt || 'Image preview';

    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('image-preview-open');

    const applySize = () => setPreviewSize(sourceImage);
    if (previewImage.complete) {
      applySize();
    } else {
      previewImage.addEventListener('load', applySize, { once: true });
    }
  };

  const closePreview = () => {
    if (!overlay) return;
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('image-preview-open');
    const clearPreviewImage = () => {
      if (!previewImage || overlay?.classList.contains('is-visible')) return;
      previewImage.removeAttribute('src');
      previewImage.removeAttribute('srcset');
      previewImage.removeAttribute('sizes');
      previewImage.style.width = '';
      previewImage.style.height = '';
      previewImage.alt = '';
    };
    if (previewImage) {
      overlay.addEventListener(
        'transitionend',
        (event) => {
          if (event.target !== overlay) return;
          clearPreviewImage();
        },
        { once: true }
      );
      setTimeout(clearPreviewImage, 260);
    }
    activeSource = null;
  };

  cardImages.forEach((image) => {
    image.addEventListener('click', (event) => {
      event.preventDefault();
      openPreview(image);
    });

    image.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openPreview(image);
    });

    if (!image.hasAttribute('tabindex')) {
      image.setAttribute('tabindex', '0');
    }
    image.setAttribute('role', 'button');
    if (!image.hasAttribute('aria-label')) {
      const labelText = image.alt ? `Preview ${image.alt}` : 'Preview image';
      image.setAttribute('aria-label', labelText);
    }
  });

  window.addEventListener('resize', () => {
    if (overlay?.classList.contains('is-visible') && activeSource) {
      setPreviewSize(activeSource);
    }
  });
}

export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const systemToggle = document.getElementById('system-toggle');
  const logoImage = document.querySelector('.nav-logo-image');
  
  if (!themeToggle) {
    console.warn('Theme toggle not found - theme initialization skipped');
    return;
  }

  const rotateLogo = (direction) => {
    if (!logoImage) return;
    logoImage.classList.remove('logo-rotate-ccw', 'logo-rotate-cw');
    // Force reflow so the animation restarts on each theme change.
    void logoImage.offsetWidth;
    logoImage.classList.add(direction === 'ccw' ? 'logo-rotate-ccw' : 'logo-rotate-cw');
  };
  
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
    rotateLogo(newTheme === 'dark' ? 'ccw' : 'cw');
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
      const nextTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      animateLinkTransition();
      rotateLogo(nextTheme === 'dark' ? 'ccw' : 'cw');
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
