const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');

const projects = [];

let editingId = null;

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Add Project';
  cancelButton.hidden = true;
}

function renderProjects() {
  projectList.replaceChildren();

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }

  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('strong');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` — ${project.status} `;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', () => {
      editingId = project.id;

      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;
      message.textContent = 'Editing project.';

      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', () => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}"?`
      );

      if (!confirmed) {
        message.textContent = 'Deletion cancelled.';
        return;
      }

      const index = projects.findIndex(item => item.id === project.id);

      if (index === -1) {
        return;
      }

      if (editingId === project.id) {
        resetForm();
      }

      projects.splice(index, 1);

      renderProjects();
      message.textContent = 'Project deleted successfully!';
    });

    listItem.append(
      projectName,
      projectStatus,
      editButton,
      deleteButton
    );

    projectList.appendChild(listItem);
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    message.textContent = 'Please enter a project name.';
    nameInput.focus();
    return;
  }

  if (editingId !== null) {
    const project = projects.find(item => item.id === editingId);

    if (project) {
      project.name = name;
      project.status = status;
      message.textContent = 'Project updated successfully!';
    }

    resetForm();
    renderProjects();
    nameInput.focus();
    return;
  }

  const project = {
    id: crypto.randomUUID(),
    name: name,
    status: status
  };

  projects.push(project);

  renderProjects();
  resetForm();

  message.textContent = 'Project added successfully!';
  nameInput.focus();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  message.textContent = 'Edit cancelled.';
  nameInput.focus();
});

renderProjects();