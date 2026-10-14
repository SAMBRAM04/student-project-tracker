const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');

let projects = [];
let editingId = null;
let isBusy = false;
let hasLoadedSuccessfully = false;

function showMessage(text) {
  message.textContent = text;
}

async function apiRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Network error. Check that the server is running.');
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }

  return data;
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Add Project';
  cancelButton.hidden = true;
}

function renderControls() {
  saveButton.disabled = isBusy;
  cancelButton.disabled = isBusy;

  projectList.querySelectorAll('button').forEach(button => {
    button.disabled = isBusy;
  });
}

function renderProjects() {
  projectList.replaceChildren();

  emptyState.hidden =
    !hasLoadedSuccessfully || projects.length > 0;

  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('strong');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ' — ' + project.status + ' ';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', () => {
      if (isBusy) return;

      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;

      showMessage('Editing project.');
      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', async () => {
      if (isBusy) return;

      const confirmed = window.confirm(
        'Are you sure you want to delete "' + project.name + '"?'
      );

      if (!confirmed) {
        showMessage('Deletion cancelled.');
        return;
      }

      isBusy = true;
      renderControls();
      showMessage('Deleting project...');

      try {
        await apiRequest(
          '/api/projects/' + encodeURIComponent(project.id),
          { method: 'DELETE' }
        );

        if (editingId === project.id) {
          resetForm();
        }

        await refreshProjects('Project deleted successfully!');
      } catch (error) {
        showMessage('Error: ' + error.message);
      } finally {
        isBusy = false;
        renderProjects();
        renderControls();
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

  renderControls();
}

async function refreshProjects(successMessage = 'Projects loaded.') {
  try {
    const data = await apiRequest('/api/projects');

    if (!Array.isArray(data)) {
      throw new Error('The server returned an invalid project list.');
    }

    projects = data;
    hasLoadedSuccessfully = true;

    if (
      editingId !== null &&
      !projects.some(project => project.id === editingId)
    ) {
      resetForm();
    }

    renderProjects();
    showMessage(successMessage);

    return true;
  } catch (error) {
    renderProjects();
    showMessage('Could not load projects: ' + error.message);

    return false;
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (isBusy) return;

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    showMessage('Please enter a project name.');
    nameInput.focus();
    return;
  }

  if (name.length > 80) {
    showMessage('Project name must be 80 characters or fewer.');
    nameInput.focus();
    return;
  }

  if (!['Planned', 'In Progress', 'Completed'].includes(status)) {
    showMessage('Please select a valid project status.');
    return;
  }

  const wasEditing = editingId !== null;
  const currentId = editingId;

  if (
    wasEditing &&
    !projects.some(project => project.id === currentId)
  ) {
    resetForm();
    showMessage('Project could not be found. Reload the project list.');
    return;
  }

  const url = wasEditing
    ? '/api/projects/' + encodeURIComponent(currentId)
    : '/api/projects';

  const options = {
    method: wasEditing ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, status })
  };

  isBusy = true;
  renderControls();
  showMessage(wasEditing ? 'Saving changes...' : 'Adding project...');

  try {
    await apiRequest(url, options);

    resetForm();

    await refreshProjects(
      wasEditing
        ? 'Project updated successfully!'
        : 'Project added successfully!'
    );

    nameInput.focus();
  } catch (error) {
    showMessage('Error: ' + error.message);
  } finally {
    isBusy = false;
    renderProjects();
    renderControls();
  }
});

cancelButton.addEventListener('click', () => {
  if (isBusy) return;

  resetForm();
  showMessage('Edit cancelled.');
  nameInput.focus();
});

async function initialize() {
  isBusy = true;
  renderControls();
  showMessage('Loading projects...');

  try {
    await refreshProjects();
  } finally {
    isBusy = false;
    renderProjects();
    renderControls();
  }
}

initialize();