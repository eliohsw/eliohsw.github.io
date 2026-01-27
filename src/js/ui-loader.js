export function loadComponent(id, url, callback) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (callback) callback();
    })
    .catch(error => {
      console.error(`Failed to load component ${id} from ${url}:`, error);
      // Still call callback even if there's an error to prevent blocking
      if (callback) callback();
    });
}

export function initComponentPlaceholders() {
  // Set a fallback timeout to ensure componentsLoaded event is always dispatched
  const fallbackTimeout = setTimeout(() => {
    console.warn('Component loading timeout - dispatching componentsLoaded event');
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
  }, 5000); // 5 second fallback

  loadComponent('navbar-placeholder', '/src/components/navbar.html', () => {
    loadComponent('mobile-sidebar-placeholder', '/src/components/mobile-sidebar.html', () => {
      loadComponent('footer-placeholder', '/src/components/footer.html', () => {
        // All components are loaded, dispatch a custom event
        clearTimeout(fallbackTimeout);
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
      });
    });
  });
} 