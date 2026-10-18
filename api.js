const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type ? `status ${type}` : "status";
}

// Reusable helper for HTTP requests and error handling.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`The server returned HTTP ${response.status}. Please try again.`);
  }

  if (response.status === 204) {
    return { status: response.status, data: null };
  }

  return { status: response.status, data: await response.json() };
}

function createNoteElement(note) {
  const item = document.createElement("li");
  item.className = "note-card";
  item.dataset.noteId = String(note.id);

  const title = document.createElement("h3");
  title.textContent = note.title || "Untitled note";

  const body = document.createElement("p");
  body.textContent = note.body || "No note content.";

  const actions = document.createElement("div");
  actions.className = "note-actions";

  const idLabel = document.createElement("span");
  idLabel.className = "note-id";
  idLabel.textContent = `Note ID: ${note.id}`;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteNote(note.id, deleteButton));

  actions.append(idLabel, deleteButton);
  item.append(title, body, actions);
  return item;
}

function showEmptyState(message = "No notes to display. Load notes or create your first note.") {
  notesList.replaceChildren();
  const item = document.createElement("li");
  item.className = "empty-state";
  item.textContent = message;
  notesList.append(item);
}

function addNoteToList(note) {
  notesList.querySelector(".empty-state")?.remove();
  notesList.prepend(createNoteElement(note));
}

async function loadNotes() {
  loadButton.disabled = true;
  setStatus("Loading notes...");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    notesList.replaceChildren();

    if (!Array.isArray(result.data) || result.data.length === 0) {
      showEmptyState("No notes were found.");
      setStatus("No notes were found.", "success");
      return;
    }

    result.data.forEach(note => notesList.append(createNoteElement(note)));
    setStatus(`Loaded ${result.data.length} notes from the server.`, "success");
  } catch (error) {
    setStatus(`Could not load notes. ${error.message}`, "error");
    if (notesList.children.length === 0) {
      showEmptyState("Notes could not be loaded. Check your connection and try again.");
    }
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a title for your note.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  setStatus("Creating note...");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    // JSONPlaceholder simulates POST requests but does not permanently save posts.
    // Display the returned note locally; a later reload may not include it.
    addNoteToList(result.data);
    noteForm.reset();
    setStatus(
      `Note created (status ${result.status}, id ${result.data.id}). Demo changes are not permanently saved.`,
      "success"
    );
  } catch (error) {
    setStatus(`Could not create the note. ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(id, button) {
  button.disabled = true;
  setStatus(`Deleting note ${id}...`);

  try {
    const result = await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    const item = [...notesList.querySelectorAll("[data-note-id]")]
      .find(note => note.dataset.noteId === String(id));

    item?.remove();

    if (notesList.children.length === 0) {
      showEmptyState();
    }

    setStatus(
      `Note deleted (status ${result.status}). Demo changes are not permanently saved.`,
      "success"
    );
  } catch (error) {
    setStatus(`Could not delete note ${id}. ${error.message}`, "error");
    button.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
showEmptyState();
