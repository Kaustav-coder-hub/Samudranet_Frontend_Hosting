// This is a helper script to force initialization of THREE.js components
// when elements become visible in the DOM

// Function to check if an element is visible in the viewport
function isElementVisible(el) {
  if (!el) return false;
  
  const rect = el.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to force renderer resize when container becomes visible
function handleVisibilityChange(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is now visible
      console.log('DNA viewer container is now visible');
      
      // Force a resize event to ensure THREE.js canvas resizes properly
      window.dispatchEvent(new Event('resize'));
      
      // If the container has a canvas, ensure it's properly sized
      const canvas = entry.target.querySelector('canvas');
      if (canvas) {
        const width = entry.target.clientWidth;
        const height = entry.target.clientHeight;
        
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          console.log('Resized canvas to', width, 'x', height);
        }
      }
    }
  });
}

// Set up the Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
  // Wait for the DOM to be fully loaded
  setTimeout(() => {
    const dnaContainer = document.getElementById('dna-viewer-container');
    
    if (dnaContainer) {
      console.log('Setting up visibility observer for DNA viewer');
      
      const observer = new IntersectionObserver(handleVisibilityChange, {
        root: null, // viewport
        threshold: 0.1 // trigger when at least 10% is visible
      });
      
      observer.observe(dnaContainer);
      
      // Also handle tab changes for the container
      const tabs = document.querySelectorAll('[role="tab"]');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Wait for tab content to become visible
          setTimeout(() => {
            if (isElementVisible(dnaContainer)) {
              console.log('DNA container visible after tab change');
              window.dispatchEvent(new Event('resize'));
            }
          }, 100);
        });
      });
    }
  }, 1000); // Wait a second for React to render everything
});

// Export for potential importing
export { isElementVisible, handleVisibilityChange };