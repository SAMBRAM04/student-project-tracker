const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';

let projects = [];
let editingId = null;
let storageAvailable = true;

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    storageAvailable = true;
    return true;
  } catch (error) {
    storageAvailable = false;
    message.textContent =
      'Changes could not be saved in this browser. Please check browser storage settings.';
    return false;
  }
}

function loadProjects() {
  let storedData;

  try {
    storedData = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    storageAvailable = false;
    message.textContent =
      'Could not read saved projects from browser storage.';
    return;
  }

  if (storedData === null) {
    projects = [];
    return;
  }

  try {
    const parsedData = JSON.parse(storedData);

    const validData =
      Array.isArray(parsedData) &&
      parsedData.every(project =>
        project &&
        typeof project.id === 'string' &&
        typeof project.name === 'string' &&
        typeof project.status === 'string'
      );

    if (!validData) {
      message.textContent =
        'Saved project data is invalid. Your stored data has not been overwritten.';
      return;
    }

    projects = parsedData;
  } catch (error) {
    message.textContent =
      'Saved project data could not be read. Your stored data has not been overwritten.';
  }
}

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

      if (saveProjects()) {
        message.textContent = 'Project deleted successfully!';
      }
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

    if (!project) {
      resetForm();
      renderProjects();
      message.textContent = 'Project could not be found.';
      return;
    }

    const oldName = project.name;
    const oldStatus = project.status;

    project.name = name;
    project.status = status;

    if (saveProjects()) {
      message.textContent = 'Project updated successfully!';
    } else {
      project.name = oldName;
      project.status = oldStatus;
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

  if (saveProjects()) {
    message.textContent = 'Project added successfully!';
  } else {
    projects.pop();
  }

  renderProjects();
  resetForm();
  nameInput.focus();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  message.textContent = 'Edit cancelled.';
  nameInput.focus();
});

loadProjects();
renderProjects();