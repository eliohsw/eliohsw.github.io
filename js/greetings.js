export function initGreeting() {
  const greetingElement = document.getElementById('greeting');
  if (!greetingElement) return; // Exit if greeting element does not exist
  // Show loading state initially
  greetingElement.textContent = "Loading...";

  // Fetch translations from JSON file
  fetch('../data/greeting.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(greetings => {
      // Set initial text
      greetingElement.textContent = greetings[0];
      
      let currentIndex = 0;

      function changeText() {
        greetingElement.classList.add('fade');
        
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % greetings.length;
          greetingElement.textContent = greetings[currentIndex];
          greetingElement.classList.remove('fade');
        }, 1000);
      }

      // Start animation after initial load
      setTimeout(() => {
        changeText();
        setInterval(changeText, 4000);
      }, 2000);
    })
    .catch(error => {
      console.error('Error loading greetings:', error);
      // Fallback to default text
      greetingElement.textContent = "Hi, I'm Elio";
    });
}
