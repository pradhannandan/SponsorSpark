document.addEventListener('DOMContentLoaded', () => {
  // --- Clickable Organizer and Sponsor Buttons ---
  const organizerBtn = document.getElementById('organizer-btn');
  const sponsorBtn = document.getElementById('sponsor-btn');

  organizerBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  sponsorBtn.addEventListener('click', () => {
    window.location.href = 'index1.html';
  });

  // --- Page Load Animations ---
  const animateOnLoadElements = document.querySelectorAll('.animate-on-load');
  animateOnLoadElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('is-visible');
      // Add a transition delay for a staggered effect
      el.style.transitionDelay = `${index * 100}ms`;
    }, 100); // Start animation shortly after page load
  });

  // --- Scroll-Triggered Animations (Intersection Observer) ---
  const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: Stop observing the element once it's visible
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // Trigger when 10% of the element is visible
  });

  animateOnScrollElements.forEach(el => {
    observer.observe(el);
  });
});