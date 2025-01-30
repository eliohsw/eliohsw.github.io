export function initRipple() {
  document.addEventListener('click', function(e) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';

    // Optional: vibration on click
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  });
}