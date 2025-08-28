document.addEventListener('DOMContentLoaded', function() {
  // Get the header element to determine where to place the button
  const header = document.querySelector('.project-header, .blog-post-header');
  const content = document.querySelector('.project-content, .blog-post-content');
  
  if (!header || !content) return; // Exit if no header or content found
  
  // Create the to-top button
  const toTopButton = document.createElement('button');
  toTopButton.className = 'to-top-button';
  toTopButton.innerHTML = '<ion-icon name="chevron-up-outline"></ion-icon><span>TOP</span>';
  toTopButton.setAttribute('aria-label', 'Back to top');
  toTopButton.setAttribute('title', 'Back to top');
  
  // Insert the button at the beginning of the content section
  content.insertBefore(toTopButton, content.firstChild);
  
  // Show/hide button based on scroll position
  function toggleToTopButton() {
    const headerBottom = header.offsetTop + header.offsetHeight;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollPosition > headerBottom) {
      toTopButton.classList.add('visible');
    } else {
      toTopButton.classList.remove('visible');
    }
  }
  
  // Smooth scroll to top when button is clicked
  toTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Listen for scroll events
  window.addEventListener('scroll', toggleToTopButton);
  
  // Initial check
  toggleToTopButton();
});
