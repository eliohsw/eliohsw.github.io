export function initLastUpdated() {
  const page = window.location.pathname.split('/').filter(Boolean).pop().replace('index.html', '') || 'home';
  fetch('/technical/data/data-updated.json')
    .then(res => res.json())
    .then(data => {
      let key = page === '' ? 'home' : page;
      if (data[key]) {
        const el = document.getElementById('last-updated');
        if (el) {
          el.textContent = `${data[key]}`;
        }
      }
    });
} 