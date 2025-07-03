import { initTheme } from './theme.js';
import { initRipple } from './ripple.js';
import { initScrollEffects } from './scroll.js';
import { initSidebar } from './sidebar.js';
import { initGreeting } from './greetings.js';

// Remove the DOMContentLoaded block to avoid initializing before navbar is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   initTheme();
//   initRipple();
//   initScrollEffects();
//   initSidebar();
//   initGreeting();
// });
