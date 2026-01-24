/**
 * Copy Page Link Functionality
 * Allows users to copy the current page URL to clipboard using the breadcrumb copy button
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
  const copyButton = document.querySelector('.breadcrumb-copy-btn');
  if (!copyButton) return;

  const originalAriaLabel = copyButton.getAttribute('aria-label') || 'Copy link to this page';
  const originalTitle = copyButton.getAttribute('title') || 'Copy link to this page';

  copyButton.classList.add('is-copied');
  copyButton.setAttribute('aria-label', 'Link copied');
  copyButton.setAttribute('title', 'Link copied');

  // Reset after 2 seconds
  setTimeout(() => {
    copyButton.classList.remove('is-copied');
    copyButton.setAttribute('aria-label', originalAriaLabel);
    copyButton.setAttribute('title', originalTitle);
  }, 2000);
}
