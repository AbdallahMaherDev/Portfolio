document.addEventListener("DOMContentLoaded", () => {
  fetchProjects();
  setupFilters();
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
  }
}

function filterProjects(filterValue) {
  const filteredProjects =
    filterValue === "all"
      ? allProjects
      : allProjects.filter((project) => project.tech.includes(filterValue));

  renderProjects(filteredProjects);
}
document.querySelector(".header_toggle").addEventListener("click", () => {
  document.querySelector(".header_links").classList.toggle("active");
});
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
  const displayCount = 6; // عدد المشاريع المرئية في البداية
  let visibleIndex = 0;

  // عرض كل المشاريع مع التحكم في الظهور
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
        }" target="_blank" class="project-link live-demo">
          <img src="./assets/Netlify-Icon.svg" alt="Netlify Live Demo" class="project-icon">
          Live Demo
        </a>
        <a href="${project.github}" target="_blank" class="project-link github">
          <img src="./assets/Github-Icons.svg" alt="GitHub Repo" class="project-icon">
          GitHub
        </a>
      </div>
    `;

    projectCard.style.opacity = index < displayCount ? "1" : "0"; // 6 أولى مرئية
    projectCard.dataset.category = project.tech;
    if (index >= displayCount) projectCard.classList.add("hidden"); // الباقي مخفي
    fragment.appendChild(projectCard);

    if (index < displayCount) {
      setTimeout(() => {
        projectCard.classList.add("show");
      }, 100 * index);
    }
  });

  container.appendChild(fragment);

  // إظهار المشاريع المخفية عند التمرير
  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
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
