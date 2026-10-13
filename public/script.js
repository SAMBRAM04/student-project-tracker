const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

const projects = [];

function renderProjects() {
  // Clear the list before displaying projects again
  projectList.replaceChildren();

  // Show or hide the empty-state message
  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }

  // Display every project
  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('strong');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` — ${project.status}`;

    listItem.append(projectName, projectStatus);
    projectList.appendChild(listItem);
  });
}

// Handle adding a project
form.addEventListener('submit', event => {
  event.preventDefault();

  // Read the values entered by the user
  const name = nameInput.value.trim();
  const status = statusInput.value;

  // Reject an empty project name
  if (!name) {
    nameInput.focus();
    return;
  }

  // Create a new project object
  const project = {
    id: crypto.randomUUID(),
    name: name,
    status: status
  };

  // Add the project to the temporary collection
  projects.push(project);

  // Display all projects
  renderProjects();

  // Clear the form for the next project
  form.reset();
  nameInput.focus();
});

// Display the initial empty state
renderProjects();