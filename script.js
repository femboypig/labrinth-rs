document.addEventListener("DOMContentLoaded", function () {
  // Loading overlay handling
  const loadingOverlay = document.getElementById("loading-overlay");
  const spinner = document.querySelector(".spinner");
  const container = document.querySelector(".container");
  const footer = document.querySelector(".site-footer");

  // Set data attributes for number length to handle dynamic padding
  document.querySelectorAll(".rules-list li").forEach((item) => {
    const numValue = item.getAttribute("data-num");
    if (numValue) {
      // Count the number of characters in the numbering
      const numLength = numValue.length;
      item.setAttribute("data-num-length", numLength);
    }
  });

  // Hide content until animation completes
  container.style.display = "block";
  footer.style.display = "block";

  // After animation completes, fade out the overlay and show the content
  setTimeout(() => {
    loadingOverlay.style.opacity = "0";

    setTimeout(() => {
      loadingOverlay.style.display = "none";

      // Show container and footer with fade-in effect
      container.style.opacity = "1";
      footer.style.opacity = "1";

      // Start the content animations after the overlay is gone
      initializeContentAnimations();
    }, 800); // Match transition time from CSS
  }, 3000); // 3 seconds for the spinning animation

  function initializeContentAnimations() {
    // Make the page feel more responsive with subtle animations
    const title = document.querySelector(".title");
    const author = document.querySelector(".author");
    const content = document.querySelector(".content");
    const elements = document.querySelectorAll("h3, p, blockquote, figure");

    // Initial fade-in animation
    setTimeout(() => {
      title.style.opacity = "1";

      setTimeout(() => {
        author.style.opacity = "1";

        let delay = 100;
        elements.forEach((el) => {
          setTimeout(() => {
            el.style.opacity = "1";
          }, delay);
          delay += 100;
        });
      }, 250);
    }, 200);
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Parallax effect for images
  const images = document.querySelectorAll(".image-container img");

  window.addEventListener("scroll", () => {
    images.forEach((img) => {
      const speed = 0.1;
      const rect = img.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const yPos = -(rect.top - windowHeight) * speed;
        img.style.transform = `translateY(${yPos}px)`;
      }
    });
  });

  // Highlight current section in view
  const h3Elements = document.querySelectorAll("h3");

  window.addEventListener("scroll", () => {
    let current = "";

    h3Elements.forEach((h3) => {
      const rect = h3.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom >= 150) {
        h3.classList.add("active");
      } else {
        h3.classList.remove("active");
      }
    });
  });
});
