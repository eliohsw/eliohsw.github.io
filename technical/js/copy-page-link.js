/**
 * Copy Page Link Functionality
 * Allows users to copy the current page URL to clipboard by clicking on breadcrumb titles
 */

function copyPageLink() {
  const currentUrl = window.location.href;
  
  // Try to use the modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(currentUrl).then(() => {
      showCopyFeedback();
    }).catch(() => {
      // Fallback to the older method
      fallbackCopyTextToClipboard(currentUrl);
    });
  } else {
    // Fallback for older browsers or non-secure contexts
    fallbackCopyTextToClipboard(currentUrl);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyFeedback();
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
  
  document.body.removeChild(textArea);
}

function showCopyFeedback() {
  const breadcrumbTitle = document.querySelector('.breadcrumb-title');
  const originalText = breadcrumbTitle.textContent;
  
  // Show feedback
  breadcrumbTitle.textContent = 'Link copied';
  breadcrumbTitle.style.color = '#4CAF50';
  
  // Reset after 2 seconds
  setTimeout(() => {
    breadcrumbTitle.textContent = originalText;
    breadcrumbTitle.style.color = '';
  }, 2000);
}
