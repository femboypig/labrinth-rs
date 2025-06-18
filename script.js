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
      
      // Fetch mods data after animations complete
      fetchModsData();
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

  // Fetch mods data from GitHub
  function fetchModsData() {
    fetch('https://raw.githubusercontent.com/femboypig/labrinth-rs/refs/heads/main/mods.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data && data.mods) {
          displayModsTable(data.mods);
        }
      })
      .catch(error => {
        console.error('Error fetching mods data:', error);
        const modsTableContainer = document.querySelector(".mods-table-container");
        if (modsTableContainer) {
          modsTableContainer.innerHTML = '<p class="error-message">Ошибка загрузки данных о модах. Пожалуйста, попробуйте позже.</p>';
        }
      });
  }

  // Create and display mods table
  function displayModsTable(mods) {
    const modsTableContainer = document.querySelector(".mods-table-container");
    if (!modsTableContainer) return;

    // Create table structure
    const table = document.createElement('table');
    table.className = 'loaders-table';
    
    // Create header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Название</th>
        <th>Статус</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Filter out mods with state "hide"
    const visibleMods = mods.filter(mod => mod.state !== 'hide');
    
    // Sort mods first by status priority (yes, warn, no) and then by name
    const statusPriority = { 'yes': 1, 'warn': 2, 'no': 3 };
    visibleMods.sort((a, b) => {
      // First sort by status priority
      const statusA = statusPriority[a.state] || 4; // Unknown status gets lowest priority
      const statusB = statusPriority[b.state] || 4;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
    
    // Track notes and their occurrences
    const notesMap = new Map(); // Map to store unique notes and their assigned numbers
    const uniqueNotes = new Map(); // Map to store unique notes and their reference numbers
    
    // First pass: identify all unique notes and assign numbers
    let noteCounter = 1;
    visibleMods.forEach(mod => {
      if (mod.notes) {
        const noteText = mod.notes.ru || mod.notes.en || '';
        if (!notesMap.has(noteText)) {
          notesMap.set(noteText, noteCounter++);
        }
      }
    });
    
    // Second pass: add mods to table and collect note references
    visibleMods.forEach(mod => {
      const tr = document.createElement('tr');
      tr.className = mod.state === 'warn' ? 'mod-warning' : '';
      
      // Name column with URL link
      const tdName = document.createElement('td');
      const modLink = document.createElement('a');
      modLink.href = mod.url;
      modLink.target = '_blank';
      modLink.textContent = mod.name;
      
      // Add note reference if mod has notes
      if (mod.notes) {
        const noteText = mod.notes.ru || mod.notes.en || '';
        const noteNumber = notesMap.get(noteText);
        
        const noteRef = document.createElement('sup');
        noteRef.className = 'note-ref';
        noteRef.textContent = noteNumber;
        noteRef.title = noteText;
        modLink.appendChild(noteRef);
        
        // Add this reference to our tracking
        if (!uniqueNotes.has(noteText)) {
          uniqueNotes.set(noteText, [noteNumber]);
        } else {
          const numbers = uniqueNotes.get(noteText);
          if (!numbers.includes(noteNumber)) {
            numbers.push(noteNumber);
          }
        }
      }
      
      tdName.appendChild(modLink);
      
      // Status column with icon
      const tdStatus = document.createElement('td');
      tdStatus.className = 'mod-status';
      
      // Handle all possible state values
      switch(mod.state) {
        case 'yes':
          tdStatus.innerHTML = '✅';
          tdStatus.title = 'Разрешено';
          break;
        case 'warn':
          tdStatus.innerHTML = '⚠️';
          tdStatus.title = 'Разрешено с ограничениями';
          break;
        case 'no':
          tdStatus.innerHTML = '❌';
          tdStatus.title = 'Запрещено';
          break;
        default:
          // Show the state value if it's not one of the expected ones
          tdStatus.innerHTML = mod.state || 'N/A';
          break;
      }
      
      // Add columns to the row
      tr.appendChild(tdName);
      tr.appendChild(tdStatus);
      
      // Add row to table body
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // Create notes container
    const notesContainer = document.createElement('div');
    notesContainer.className = 'mods-notes-container';
    
    // Format and add unique notes with ranges
    if (uniqueNotes.size > 0) {
      // Convert the unique notes to an array for sorting
      const notesArray = Array.from(uniqueNotes.entries()).map(([text, numbers]) => {
        // Sort the numbers for sequential detection
        numbers.sort((a, b) => a - b);
        return { text, numbers };
      });
      
      // Sort the notes by the first number in each range
      notesArray.sort((a, b) => a.numbers[0] - b.numbers[0]);
      
      notesArray.forEach(note => {
        const { text, numbers } = note;
        
        // Format the numbers as ranges where possible
        const formattedNumbers = formatNumbersAsRanges(numbers);
        
        // Create the note element
        const noteItem = document.createElement('div');
        noteItem.className = 'mod-note';
        noteItem.innerHTML = `<sup>${formattedNumbers}</sup> ${text}`;
        notesContainer.appendChild(noteItem);
      });
    }
    
    // Helper function to format numbers as ranges
    function formatNumbersAsRanges(numbers) {
      if (!numbers || numbers.length === 0) return '';
      
      const ranges = [];
      let rangeStart = numbers[0];
      let rangeEnd = rangeStart;
      
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === rangeEnd + 1) {
          // Continue the current range
          rangeEnd = numbers[i];
        } else {
          // End the current range and start a new one
          if (rangeStart === rangeEnd) {
            ranges.push(`${rangeStart}`);
          } else {
            ranges.push(`${rangeStart}-${rangeEnd}`);
          }
          rangeStart = rangeEnd = numbers[i];
        }
      }
      
      // Add the last range
      if (rangeStart === rangeEnd) {
        ranges.push(`${rangeStart}`);
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
      }
      
      return ranges.join(', ');
    }
    
    // Clear and update the container
    modsTableContainer.innerHTML = '';
    modsTableContainer.appendChild(table);
    
    // Add notes below the table if there are any
    if (uniqueNotes.size > 0) {
      modsTableContainer.appendChild(notesContainer);
    }
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
