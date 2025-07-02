export function initRipple() {
  let clickCount = 0;
  let lastClickTime = 0;
  let lastX = 0;
  let lastY = 0;
  let timeoutId = null;
  const CLICK_THRESHOLD = 1; // Pixel radius for considering it the "same spot"
  const REQUIRED_CLICKS = 8;
  const TIME_WINDOW = 1000; // 1 second

  document.addEventListener('click', function(e) {
    // Existing ripple effect code
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

    // Easter egg detection logic
    const currentTime = Date.now();
    const currentX = e.clientX;
    const currentY = e.clientY;

    // Check if click is within threshold and time window
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

    // Reset count if no subsequent click within time window
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      clickCount = 0;
    }, TIME_WINDOW);

    // Trigger Easter egg if reached required clicks
    if (clickCount === REQUIRED_CLICKS) {
      createSuperClicker(currentX, currentY);
      clickCount = 0;
    }
  });

  function createSuperClicker(x, y) {
    const text = document.createElement('div');
    text.className = 'super-clicker';
    text.textContent = 'SUPERCLICKER';
    
    // Position text at click location
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    
    document.body.appendChild(text);

    // Remove element after animation
    text.addEventListener('animationend', () => {
      text.remove();
    });
  }
}