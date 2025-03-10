document.addEventListener("DOMContentLoaded", () => {
  fetchProjects();
  setupFilters();
  setupSmoothScrolling();
  setupHeaderLinks();
});

let allProjects = [];

async function fetchProjects() {
  try {
    const response = await fetch("./assets/Data/projects.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    allProjects = await response.json();
    renderProjects(allProjects);
  } catch (error) {
    console.error("❌ Error loading projects:", error);
    // Show a fallback message in the projects container
    document.getElementById("projects-container").innerHTML =
      '<div class="error-message">Sorry, could not load projects. Please try again later.</div>';
  }
}

function filterProjects(filterValue) {
  const filteredProjects =
    filterValue === "all"
      ? allProjects
      : allProjects.filter((project) => project.tech.includes(filterValue));

  renderProjects(filteredProjects);
}

// New function for smooth scrolling
function setupSmoothScrolling() {
  // Select all links with hashes
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      // Only prevent default if the link is to an anchor on the same page
      if (this.getAttribute("href").startsWith("#")) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          // For mobile menu - close the menu when a link is clicked
          document.querySelector(".header_links").classList.remove("active");

          // Smooth scroll to element
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for header height
            behavior: "smooth",
          });

          // Update active link
          updateActiveLink(targetId);
        }
      }
    });
  });
}

// New function to update active link based on current section
function updateActiveLink(activeId) {
  document.querySelectorAll(".header_links a").forEach((link) => {
    if (link.getAttribute("href") === activeId) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}

// New function to handle active link on scroll
function setupHeaderLinks() {
  const headerLinks = document.querySelectorAll(".header_links a");

  // Toggle mobile menu
  document.querySelector(".header_toggle").addEventListener("click", () => {
    document.querySelector(".header_links").classList.toggle("active");
  });

  // Add active state to links on scroll
  window.addEventListener("scroll", () => {
    let current = "";
    const sections = document.querySelectorAll("section");

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (pageYOffset >= sectionTop - 150) {
        current = section.getAttribute("id");
      }
    });

    headerLinks.forEach((link) => {
      link.classList.remove("active-link");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active-link");
      }
    });
  });
}

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelector(".filter-btn.active")?.classList.remove("active");
      this.classList.add("active");
      filterProjects(this.getAttribute("data-filter"));
    });
  });
}

function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const displayCount = 6; // Number of initially visible projects
  let visibleIndex = 0;

  // Display all projects with controlled visibility
  projects.forEach((project, index) => {
    const projectCard = document.createElement("div");
    projectCard.classList.add("project-card");
    projectCard.innerHTML = `
      <img src="${project.video || "./default-image.jpg"}" alt="${
      project.title || "Project"
    }">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-links">
        <a href="${
          project.liveDemo
        }" target="_blank" rel="noopener noreferrer" class="project-link live-demo">
          <img src="./assets/Netlify-Icon.svg" alt="Netlify Live Demo" class="project-icon">
          Live Demo
        </a>
        <a href="${
          project.github
        }" target="_blank" rel="noopener noreferrer" class="project-link github">
          <img src="./assets/Github-Icons.svg" alt="GitHub Repo" class="project-icon">
          GitHub
        </a>
      </div>
    `;

    projectCard.style.opacity = index < displayCount ? "1" : "0"; // First 6 visible
    projectCard.dataset.category = project.tech;
    if (index >= displayCount) projectCard.classList.add("hidden"); // Rest are hidden
    fragment.appendChild(projectCard);

    if (index < displayCount) {
      setTimeout(() => {
        projectCard.classList.add("show");
      }, 100 * index);
    }
  });

  container.appendChild(fragment);

  // Reveal hidden projects on scroll
  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          setTimeout(() => {
            card.style.opacity = "1";
            card.classList.add("show");
            card.classList.remove("hidden");
          }, 100 * (visibleIndex++ % displayCount));
        }
      });
    },
    { threshold: 0.1 }
  );

  const projectCards = container.querySelectorAll(".project-card");
  projectCards.forEach((card) => observer.observe(card));
}
