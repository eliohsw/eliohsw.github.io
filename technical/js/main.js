import { initTheme } from './theme.js';
import { initRipple } from './ripple.js';
import { initScrollEffects } from './scroll.js';
import { initSidebar } from './sidebar.js';
import { initGreeting } from './greetings.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRipple();
  initScrollEffects();
  initSidebar();
  initGreeting();
});
