export function initGreeting() {
  const greetings = [
    "Hello, I’m Elio.",
    "Hallo, ich bin Elio.",
    "Hola, soy Elio.",
    "Bonjour, je suis Elio.",
    "Ciao, sono Elio.",
    "Olá, eu sou Elio.",
    "Cześć, jestem Elio.",
    "Hallo, ik ben Elio.",
    "Zdravo, ja sam Elio.",
    "Привет, я Elio.",
    "Hei, olen Elio.",
    "Hei, jeg er Elio."
  ];

  let currentIndex = 0;
  const greetingElement = document.getElementById('greeting');

  function changeText() {
    // Fade out current text
    greetingElement.classList.add('fade');
    
    setTimeout(() => {
      // Update text after fade out
      currentIndex = (currentIndex + 1) % greetings.length;
      greetingElement.textContent = greetings[currentIndex];
      
      // Fade in new text
      greetingElement.classList.remove('fade');
    }, 1000); // Matches your fade transition
  }

  // Start cycling after initial 2 seconds and repeat every 4 seconds
  setTimeout(() => {
    changeText();
    setInterval(changeText, 4000);
  }, 2000);
}
