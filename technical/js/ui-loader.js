export function loadComponent(id, url, callback) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (callback) callback();
    });
}

export function initComponentPlaceholders() {
  loadComponent('navbar-placeholder', '/technical/components/navbar.html', () => {
    loadComponent('mobile-sidebar-placeholder', '/technical/components/mobile-sidebar.html', () => {
      loadComponent('footer-placeholder', '/technical/components/footer.html');
    });
  });
} 