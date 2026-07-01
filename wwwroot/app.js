const storageKeys = {
  workouts: "training-journal-workouts-v2",
  exercises: "training-journal-exercises-v3",
  measurements: "training-journal-measurements-v2",
  workoutDraft: "training-journal-workout-draft-v3",
  exerciseDraft: "training-journal-exercise-draft-v2",
  measurementDraft: "training-journal-measurement-draft-v2",
  lastView: "training-journal-last-view-v2",
  pendingExerciseContext: "training-journal-pending-exercise-context-v2",
};

const views = {
  workouts: document.querySelector("#view-workouts"),
  exercises: document.querySelector("#view-exercises"),
  measurements: document.querySelector("#view-measurements"),
  more: document.querySelector("#view-more"),
};

const authShell = document.querySelector("#auth-shell");
const appShell = document.querySelector("#app-shell");
const bottomNav = document.querySelector("#bottom-nav");
const authForm = document.querySelector("#auth-form");
const authEmailInput = document.querySelector("#auth-email");
const authPasswordInput = document.querySelector("#auth-password");
const authShowPasswordInput = document.querySelector("#auth-show-password");
const authStatus = document.querySelector("#auth-status");
const authSubmitButton = document.querySelector("#auth-submit-button");
const authToggleButton = document.querySelector("#auth-toggle-button");
const accountEmail = document.querySelector("#account-email");
const syncStatusText = document.querySelector("#sync-status-text");
let logoutButton = document.querySelector("#logout-button");

const navItems = [...document.querySelectorAll(".nav-item")];
const body = document.body;
const toast = document.querySelector("#toast");

const workoutForm = document.querySelector("#workout-form");
const workoutFormTitle = document.querySelector("#workout-form-title");
const workoutDraftStatus = document.querySelector("#workout-draft-status");
const workoutIdInput = document.querySelector("#workout-id");
const workoutTitleInput = document.querySelector("#workout-title");
const workoutTypeInput = document.querySelector("#workout-type");
const workoutStatusInput = document.querySelector("#workout-status");
const workoutStartTimeInput = document.querySelector("#workout-start-time");
const workoutEndTimeInput = document.querySelector("#workout-end-time");
const workoutStartLabel = workoutStartTimeInput?.closest(".field")?.querySelector("span");
const workoutEndLabel = workoutEndTimeInput?.closest(".field")?.querySelector("span");
const workoutExercisesList = document.querySelector("#workout-exercises-list");
const workoutExerciseTemplate = document.querySelector("#workout-exercise-template");
const workoutHistoryList = document.querySelector("#workout-history-list");
const workoutHistoryCount = document.querySelector("#workout-history-count");
const workoutEmptyState = document.querySelector("#workout-empty-state");
const activeWorkoutCard = document.querySelector("#active-workout-card");
const plannedFilterButton = document.querySelector("#planned-filter-button");
const completedFilterButton = document.querySelector("#completed-filter-button");
const openWorkoutFormButton = document.querySelector("#open-workout-form-button");
const resetWorkoutButton = document.querySelector("#reset-workout-button");
const addWorkoutExerciseButton = document.querySelector("#add-workout-exercise-button");
const exercisePickerHint = document.querySelector("#exercise-picker-hint");
const createExerciseFromWorkoutButton = document.querySelector("#create-exercise-from-workout-button");

const exerciseForm = document.querySelector("#exercise-form");
const exerciseFormTitle = document.querySelector("#exercise-form-title");
const exerciseDraftStatus = document.querySelector("#exercise-draft-status");
const exerciseIdInput = document.querySelector("#exercise-id");
const exerciseNameInput = document.querySelector("#exercise-name");
const exerciseTypeInput = document.querySelector("#exercise-type");
const exerciseDescriptionInput = document.querySelector("#exercise-description");
const exerciseHistoryList = document.querySelector("#exercise-history-list");
const exerciseHistoryCount = document.querySelector("#exercise-history-count");
const exerciseEmptyState = document.querySelector("#exercise-empty-state");
const openExerciseFormButton = document.querySelector("#open-exercise-form-button");
const resetExerciseButton = document.querySelector("#reset-exercise-button");

const measurementForm = document.querySelector("#measurement-form");
const measurementFormTitle = document.querySelector("#measurement-form-title");
const measurementDraftStatus = document.querySelector("#measurement-draft-status");
const measurementIdInput = document.querySelector("#measurement-id");
const measurementTitleInput = document.querySelector("#measurement-title");
const measurementDateInput = document.querySelector("#measurement-date");
const measurementWeightInput = document.querySelector("#measurement-weight");
const measurementBodyFatInput = document.querySelector("#measurement-body-fat");
const measurementChestInput = document.querySelector("#measurement-chest");
const measurementWaistInput = document.querySelector("#measurement-waist");
const measurementBellyInput = document.querySelector("#measurement-belly");
const measurementHipsInput = document.querySelector("#measurement-hips");
const measurementArmInput = document.querySelector("#measurement-arm");
const measurementLegInput = document.querySelector("#measurement-leg");
const measurementNoteInput = document.querySelector("#measurement-note");
const measurementHistoryList = document.querySelector("#measurement-history-list");
const measurementHistoryCount = document.querySelector("#measurement-history-count");
const measurementEmptyState = document.querySelector("#measurement-empty-state");
const openMeasurementFormButton = document.querySelector("#open-measurement-form-button");
const resetMeasurementButton = document.querySelector("#reset-measurement-button");

const exportDataButton = document.querySelector("#export-data-button");
const importDataButton = document.querySelector("#import-data-button");
const importDataInput = document.querySelector("#import-data-input");
const clearAllDataButton = document.querySelector("#clear-all-data-button");

const backButtons = [...document.querySelectorAll("[data-back]")];
const viewModes = {
  workouts: "list",
  exercises: "list",
  measurements: "list",
  more: "list",
};

let activeView = "workouts";
let toastTimer = null;
let pendingDelete = null;
let suppressSaveErrors = false;
let isRegisterMode = false;
let isAuthenticated = false;
let serverSyncTimer = null;
let isApplyingServerState = false;
let workoutListFilter = "planned";
let activeWorkoutExerciseFilter = "pending";

const authKeys = {
  token: "training-journal-auth-token-v1",
  user: "training-journal-auth-user-v1",
};

const syncEntityKeys = new Set([
  storageKeys.workouts,
  storageKeys.exercises,
  storageKeys.measurements,
]);

const workoutStatuses = {
  planned: "planned",
  active: "active",
  completed: "completed",
  cancelled: "cancelled",
};

function showToast(message, { duration = 3200, actionLabel = "", onAction = null } = {}) {
  toast.hidden = false;
  toast.innerHTML = "";

  const text = document.createElement("span");
  text.textContent = message;
  toast.append(text);

  if (actionLabel && typeof onAction === "function") {
    const action = document.createElement("button");
    action.type = "button";
    action.className = "toast-action";
    action.textContent = actionLabel;
    action.addEventListener("click", () => {
      onAction();
      hideToast();
    });
    toast.append(action);
  }

  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(hideToast, duration);
}

function hideToast() {
  toast.hidden = true;
  toast.innerHTML = "";
}

function reportStorageError(actionLabel, error) {
  if (suppressSaveErrors) {
    return false;
  }

  console.error(error);
  showToast(`Не удалось ${actionLabel}. Проверь место в браузере.`);
  return false;
}

function safeSetItem(key, value, actionLabel) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return reportStorageError(actionLabel, error);
  }
}

function safeRemoveItem(key, actionLabel) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return reportStorageError(actionLabel, error);
  }
}

function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(error);
    showToast("Не удалось прочитать часть сохраненных данных.");
    return [];
  }
}

function saveList(key, value, actionLabel) {
  const ok = safeSetItem(key, JSON.stringify(value), actionLabel);
  if (ok && syncEntityKeys.has(key)) {
    queueServerSync();
  }
  return ok;
}

function loadObject(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(error);
    showToast("Не удалось прочитать часть сохраненных данных.");
    return null;
  }
}

function saveObject(key, value, actionLabel) {
  return safeSetItem(key, JSON.stringify(value), actionLabel);
}

function clearObject(key, actionLabel) {
  return safeRemoveItem(key, actionLabel);
}

function loadAuthToken() {
  return localStorage.getItem(authKeys.token) || "";
}

function saveAuthSession(token, user) {
  safeSetItem(authKeys.token, token, "сохранить токен");
  safeSetItem(authKeys.user, JSON.stringify(user), "сохранить пользователя");
}

function clearAuthSession() {
  localStorage.removeItem(authKeys.token);
  localStorage.removeItem(authKeys.user);
}

async function apiRequest(path, { method = "GET", body = null, auth = true } = {}) {
  const headers = {};
  if (body !== null) headers["Content-Type"] = "application/json";

  const token = loadAuthToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === null ? null : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Ошибка запроса (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.detail) message = payload.detail;
    } catch {
      // ignore invalid JSON
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function updateAccountSummary(user = null) {
  if (accountEmail) {
    accountEmail.textContent = user?.email ? `Выполнен вход: ${user.email}` : "Не выполнен вход.";
  }
}

function updateSyncStatus(text = "") {
  if (syncStatusText) {
    syncStatusText.textContent = text || "После входа приложение загружает данные с сервера и автоматически отправляет изменения обратно.";
  }
}

function setAuthenticatedUI(authenticated, user = null) {
  isAuthenticated = authenticated;
  authShell.hidden = authenticated;
  appShell.hidden = !authenticated;
  bottomNav.hidden = !authenticated;
  updateAccountSummary(user);
  if (authenticated) {
    updateSyncStatus("Сервер подключен. Все изменения будут синхронизированы автоматически.");
  } else {
    updateSyncStatus();
  }
}

function uid() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setDraftStatus(element, text = "") {
  element.hidden = !text;
  element.textContent = text;
}

function formatDate(dateTime) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateTime));
}

function formatDateOnly(dateValue) {
  const date = dateValue.includes("T") ? new Date(dateValue) : new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toLocalInputValue(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function workoutTypeLabel(type) {
  return type === "cardio" ? "Кардио" : "Силовая";
}

function workoutStatusLabel(status) {
  switch (status) {
    case workoutStatuses.planned:
      return "Запланирована";
    case workoutStatuses.active:
      return "Активна";
    case workoutStatuses.cancelled:
      return "Отменена";
    case workoutStatuses.completed:
    default:
      return "Завершена";
  }
}

function exerciseTypeLabel(type) {
  return type === "cardio" ? "Кардио" : "Силовое";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function normalizeWorkoutMetricValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeWorkoutPhase(item = {}) {
  return {
    sets: normalizeWorkoutMetricValue(item.sets),
    weight: normalizeWorkoutMetricValue(item.weight),
    reps: normalizeWorkoutMetricValue(item.reps),
    note: item.note?.trim?.() ?? item.note ?? "",
  };
}

function normalizeWorkoutEntry(item = {}) {
  const plan = item.plan ? normalizeWorkoutPhase(item.plan) : null;
  const fact = item.fact
    ? normalizeWorkoutPhase(item.fact)
    : item.actual
      ? normalizeWorkoutPhase(item.actual)
      : (item.sets !== undefined || item.weight !== undefined || item.reps !== undefined || item.note !== undefined)
        ? normalizeWorkoutPhase(item)
        : null;

  return {
    id: item.id ?? uid(),
    exerciseId: item.exerciseId ?? "",
    status: typeof item.status === "string" ? item.status : "pending",
    plan,
    fact,
  };
}

function normalizeWorkout(item = {}) {
  const rawStatus = typeof item.status === "string" ? item.status : "";
  const status = Object.values(workoutStatuses).includes(rawStatus)
    ? rawStatus
    : item.startTime || item.endTime || item.completedAt
      ? workoutStatuses.completed
      : workoutStatuses.planned;

  const scheduledStart = item.scheduledStartTime ?? (status === workoutStatuses.planned ? item.startTime ?? "" : "");
  const scheduledEnd = item.scheduledEndTime ?? (status === workoutStatuses.planned ? item.endTime ?? "" : "");
  const actualStart = item.actualStartTime ?? (status !== workoutStatuses.planned ? item.startTime ?? "" : "");
  const actualEnd = item.actualEndTime ?? (status === workoutStatuses.completed ? item.endTime ?? "" : "");

  return {
    id: item.id ?? uid(),
    title: item.title?.trim?.() ?? item.title ?? "",
    type: item.type === "cardio" ? "cardio" : "strength",
    status,
    startTime: actualStart || scheduledStart || "",
    endTime: actualEnd || scheduledEnd || "",
    scheduledStartTime: scheduledStart,
    scheduledEndTime: scheduledEnd,
    actualStartTime: actualStart,
    actualEndTime: actualEnd,
    createdAt: item.createdAt ?? item.startTime ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
    exercises: Array.isArray(item.exercises) ? item.exercises.map(normalizeWorkoutEntry) : [],
  };
}

function getWorkouts() {
  return loadList(storageKeys.workouts).map(normalizeWorkout);
}

function setWorkouts(items) {
  return saveList(storageKeys.workouts, items.map(normalizeWorkout), "сохранить тренировки");
}

function getExercises() {
  return loadList(storageKeys.exercises).map((item) => ({ ...item, archived: Boolean(item.archived) }));
}

function setExercises(items) {
  return saveList(storageKeys.exercises, items, "сохранить упражнения");
}

function getActiveExercises() {
  return getExercises().filter((item) => !item.archived);
}

function getExerciseById(id) {
  return getExercises().find((item) => item.id === id) ?? null;
}

function getMeasurements() {
  return loadList(storageKeys.measurements);
}

function setMeasurements(items) {
  return saveList(storageKeys.measurements, items, "сохранить замеры");
}

function normalizeWorkoutExercise(item = {}) {
  const source = item.plan ?? item.fact ?? item.actual ?? item;
  return {
    exerciseId: item.exerciseId ?? "",
    sets: source.sets ?? "",
    weight: source.weight ?? "",
    reps: source.reps ?? "",
    note: source.note ?? "",
  };
}

function workoutStatusSortOrder(status) {
  switch (status) {
    case workoutStatuses.active:
      return 0;
    case workoutStatuses.planned:
      return 1;
    case workoutStatuses.completed:
      return 2;
    case workoutStatuses.cancelled:
      return 3;
    default:
      return 4;
  }
}

function hasMeaningfulWorkoutInProgress() {
  const draft = buildWorkoutDraft();
  return Boolean(
    draft.id ||
    draft.title ||
    draft.type !== "strength" ||
    draft.exercises.some((item) => item.exerciseId || item.sets || item.weight || item.reps || item.note)
  );
}

function hasMeaningfulExerciseDraft() {
  const draft = buildExerciseDraft();
  return Boolean(draft.id || draft.name || draft.type !== "strength" || draft.description);
}

function loadPendingExerciseContext() {
  return loadObject(storageKeys.pendingExerciseContext);
}

function savePendingExerciseContext(value) {
  return saveObject(storageKeys.pendingExerciseContext, value, "сохранить контекст создания упражнения");
}

function clearPendingExerciseContext() {
  return clearObject(storageKeys.pendingExerciseContext, "очистить контекст создания упражнения");
}

function findPendingWorkoutCardIndex() {
  const cards = [...workoutExercisesList.querySelectorAll(".exercise-card")];
  const firstEmptyIndex = cards.findIndex((card) => !card.querySelector(".workout-exercise-id").value);
  return firstEmptyIndex >= 0 ? firstEmptyIndex : Math.max(cards.length - 1, 0);
}

function ensureWorkoutCardAtIndex(index) {
  while (workoutExercisesList.children.length <= index) {
    createWorkoutExerciseCard();
  }
}

function applyExerciseToWorkoutCard(index, exerciseId) {
  ensureWorkoutCardAtIndex(index);
  const cards = [...workoutExercisesList.querySelectorAll(".exercise-card")];
  const card = cards[index] ?? cards[cards.length - 1];
  if (!card) return;
  card.querySelector(".workout-exercise-id").value = exerciseId;
  refreshWorkoutExerciseCards();
  persistWorkoutDraft();
}

function updateBodyDetailMode() {
  const isDetail = viewModes[activeView] === "form";
  body.classList.toggle("is-detail-mode", isDetail);
}

function saveLastView(viewName) {
  saveObject(storageKeys.lastView, viewName, "сохранить активный раздел");
}

function getLastView() {
  const value = loadObject(storageKeys.lastView);
  return typeof value === "string" && views[value] ? value : "workouts";
}

function showView(viewName) {
  activeView = viewName;
  Object.entries(views).forEach(([key, element]) => {
    element.classList.toggle("is-active", key === viewName);
  });
  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewName);
  });
  updateBodyDetailMode();
  saveLastView(viewName);
}

function showSubview(viewName, mode) {
  viewModes[viewName] = mode;
  const subviews = [...views[viewName].querySelectorAll(".subview")];
  subviews.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.subview === mode);
  });
  updateBodyDetailMode();
}

function openListView(viewName) {
  showView(viewName);
  showSubview(viewName, "list");
}

function openFormView(viewName) {
  showView(viewName);
  showSubview(viewName, "form");
}

function buildWorkoutDraft() {
  return {
    id: workoutIdInput.value,
    title: workoutTitleInput.value.trim(),
    type: workoutTypeInput.value,
    status: workoutStatusInput.value,
    startTime: workoutStartTimeInput.value,
    endTime: workoutEndTimeInput.value,
    exercises: collectWorkoutExercises(),
    updatedAt: new Date().toISOString(),
  };
}

function collectWorkoutExercises() {
  return [...workoutExercisesList.querySelectorAll(".exercise-card")]
    .map((card) => ({
      exerciseId: card.querySelector(".workout-exercise-id").value,
      sets: card.querySelector(".exercise-sets").value,
      weight: card.querySelector(".exercise-weight").value,
      reps: card.querySelector(".exercise-reps").value,
      note: card.querySelector(".exercise-note").value.trim(),
    }))
    .filter((item) => item.exerciseId || item.sets || item.weight || item.reps || item.note);
}

function persistWorkoutDraft() {
  const draft = buildWorkoutDraft();
  const hasMeaning = Boolean(
    draft.id ||
    draft.title ||
    draft.type !== "strength" ||
    draft.startTime ||
    draft.endTime ||
    draft.exercises.length
  );
  if (hasMeaning) {
    saveObject(storageKeys.workoutDraft, draft, "сохранить черновик тренировки");
  } else {
    clearObject(storageKeys.workoutDraft, "очистить черновик тренировки");
  }
}

function renderExercisePicker(select, selectedId = "") {
  const workoutType = workoutTypeInput.value;
  const exercises = getActiveExercises().filter((item) => item.type === workoutType);
  const options = exercises
    .map((exercise) => `<option value="${exercise.id}">${escapeHtml(exercise.name)}</option>`)
    .join("");
  select.innerHTML = `<option value="">Выбери упражнение</option>${options}`;
  select.value = selectedId && exercises.some((item) => item.id === selectedId) ? selectedId : "";
}

function refreshWorkoutExerciseCards() {
  const cards = [...workoutExercisesList.querySelectorAll(".exercise-card")];
  cards.forEach((card, index) => {
    card.querySelector(".exercise-index-label").textContent = `Упражнение ${index + 1}`;
    const select = card.querySelector(".workout-exercise-id");
    const selectedExercise = getExerciseById(select.value);
    renderExercisePicker(select, select.value);
    card.querySelector(".exercise-card-title").textContent = selectedExercise?.name || "Новый блок";
  });

  const currentType = workoutTypeInput.value;
  const availableExercises = getActiveExercises().filter((item) => item.type === currentType);
  exercisePickerHint.hidden = availableExercises.length > 0;
  createExerciseFromWorkoutButton.hidden = availableExercises.length > 0;
  exercisePickerHint.textContent = availableExercises.length
    ? ""
    : `Для ${workoutTypeLabel(currentType).toLowerCase()} тренировки пока нет упражнений. Сначала добавь их в раздел "Упражнения".`;
  createExerciseFromWorkoutButton.textContent = `Создать ${workoutTypeLabel(currentType).toLowerCase()} упражнение`;
}

function createWorkoutExerciseCard(value = {}) {
  const fragment = workoutExerciseTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".exercise-card");
  const normalized = normalizeWorkoutExercise(value);
  const select = card.querySelector(".workout-exercise-id");
  const setsInput = card.querySelector(".exercise-sets");
  const weightInput = card.querySelector(".exercise-weight");
  const repsInput = card.querySelector(".exercise-reps");
  const noteInput = card.querySelector(".exercise-note");

  renderExercisePicker(select, normalized.exerciseId);
  setsInput.value = normalized.sets;
  weightInput.value = normalized.weight;
  repsInput.value = normalized.reps;
  noteInput.value = normalized.note;

  [select, setsInput, weightInput, repsInput, noteInput].forEach((input) => {
    input.addEventListener("input", () => {
      refreshWorkoutExerciseCards();
      persistWorkoutDraft();
    });
    input.addEventListener("change", () => {
      refreshWorkoutExerciseCards();
      persistWorkoutDraft();
    });
  });

  card.querySelector(".remove-exercise-button").addEventListener("click", () => {
    card.remove();
    if (!workoutExercisesList.children.length) {
      createWorkoutExerciseCard();
    }
    refreshWorkoutExerciseCards();
    persistWorkoutDraft();
  });

  workoutExercisesList.append(card);
  refreshWorkoutExerciseCards();
}

function applyDefaultWorkoutTimes() {
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  workoutStartTimeInput.value = toLocalInputValue(start);
  workoutEndTimeInput.value = toLocalInputValue(end);
}

function syncWorkoutDateLabels() {
  const isCompleted = workoutStatusInput.value === workoutStatuses.completed;
  if (workoutStartLabel) workoutStartLabel.textContent = isCompleted ? "Фактическое начало" : "Плановое начало";
  if (workoutEndLabel) workoutEndLabel.textContent = isCompleted ? "Фактическое окончание" : "Плановое окончание";
}

function resetWorkoutForm({ preserveDraft = false, preserveStatus = false } = {}) {
  workoutForm.reset();
  workoutIdInput.value = "";
  workoutFormTitle.textContent = "Новая тренировка";
  workoutExercisesList.innerHTML = "";
  createWorkoutExerciseCard();
  workoutTypeInput.value = "strength";
  workoutStatusInput.value = workoutStatuses.planned;
  applyDefaultWorkoutTimes();
  syncWorkoutDateLabels();
  refreshWorkoutExerciseCards();
  if (!preserveDraft) clearObject(storageKeys.workoutDraft, "очистить черновик тренировки");
  if (!preserveStatus) setDraftStatus(workoutDraftStatus, "");
}

function fillWorkoutForm(workout, { editing = false } = {}) {
  workoutIdInput.value = workout.id ?? "";
  workoutTitleInput.value = workout.title ?? "";
  workoutTypeInput.value = workout.type ?? "strength";
  workoutStatusInput.value = workout.status ?? workoutStatuses.planned;
  workoutStartTimeInput.value = workout.status === workoutStatuses.completed
    ? (workout.actualStartTime ?? workout.startTime ?? "")
    : (workout.scheduledStartTime ?? workout.startTime ?? "");
  workoutEndTimeInput.value = workout.status === workoutStatuses.completed
    ? (workout.actualEndTime ?? workout.endTime ?? "")
    : (workout.scheduledEndTime ?? workout.endTime ?? "");
  workoutFormTitle.textContent = editing ? "Редактирование тренировки" : "Новая тренировка";
  workoutExercisesList.innerHTML = "";
  if (workout.exercises?.length) {
    workout.exercises.forEach((item) => createWorkoutExerciseCard(item));
  } else {
    createWorkoutExerciseCard();
  }
  syncWorkoutDateLabels();
  refreshWorkoutExerciseCards();
}

function restoreWorkoutDraft() {
  const draft = loadObject(storageKeys.workoutDraft);
  if (!draft) {
    resetWorkoutForm({ preserveDraft: true, preserveStatus: true });
    return;
  }
  fillWorkoutForm(draft, { editing: Boolean(draft.id) });
  if (draft.updatedAt) {
    setDraftStatus(workoutDraftStatus, `Черновик тренировки восстановлен: ${formatDate(draft.updatedAt)}`);
  }
}

function workoutListTitle(workout) {
  if (workout.title?.trim()) {
    return workout.title.trim();
  }

  if (workout.startTime) {
    return `${workoutTypeLabel(workout.type)} · ${formatDateOnly(workout.startTime)}`;
  }

  return workoutTypeLabel(workout.type);
}

function runDeleteWithUndo(config) {
  if (pendingDelete?.finalize) pendingDelete.finalize();
  const applied = config.apply();
  if (applied === false) return;
  pendingDelete = { finalize: () => { pendingDelete = null; }, restore: config.restore };
  showToast(config.message, {
    actionLabel: "Отменить",
    onAction: () => {
      config.restore();
      pendingDelete = null;
    },
  });
}

function getWorkoutPrimaryStart(workout) {
  return workout.actualStartTime || workout.scheduledStartTime || workout.startTime || "";
}

function getWorkoutPrimaryEnd(workout) {
  return workout.actualEndTime || workout.scheduledEndTime || workout.endTime || "";
}

function workoutDateMeta(workout) {
  if (workout.status === workoutStatuses.planned) {
    return workout.scheduledStartTime ? `План: ${formatDate(workout.scheduledStartTime)}` : "Без планового времени";
  }
  if (workout.status === workoutStatuses.active) {
    const planned = workout.scheduledStartTime ? `План: ${formatDate(workout.scheduledStartTime)}` : "Без планового старта";
    const actual = workout.actualStartTime ? `Старт: ${formatDate(workout.actualStartTime)}` : "";
    return [planned, actual].filter(Boolean).join(" · ");
  }
  return workout.actualStartTime ? `Факт: ${formatDate(workout.actualStartTime)}` : "Без даты";
}

function workoutExerciseSummary(entry) {
  const source = entry.fact ?? entry.plan ?? null;
  if (!source) return "Без данных";
  const parts = [];
  if (source.sets !== null && source.sets !== undefined) parts.push(`${source.sets} пдх`);
  if (source.reps !== null && source.reps !== undefined) parts.push(`${source.reps} повт`);
  if (source.weight !== null && source.weight !== undefined) parts.push(`${source.weight} кг`);
  return parts.join(" · ") || (source.note || "Без данных");
}

function changeWorkoutStatus(workoutId, updater) {
  const workouts = getWorkouts();
  const index = workouts.findIndex((item) => item.id === workoutId);
  if (index < 0) return;
  const updated = updater(normalizeWorkout(workouts[index]));
  workouts[index] = normalizeWorkout({ ...updated, updatedAt: new Date().toISOString() });
  if (!setWorkouts(workouts)) return;
  renderWorkoutHistory();
}

function toggleWorkoutExerciseDone(workoutId, entryId) {
  changeWorkoutStatus(workoutId, (workout) => ({
    ...workout,
    exercises: workout.exercises.map((entry) => {
      if (entry.id !== entryId) return entry;
      const nextStatus = entry.status === "done" ? "pending" : "done";
      const fallbackFact = entry.fact ?? entry.plan ?? null;
      return {
        ...entry,
        status: nextStatus,
        fact: nextStatus === "done" ? (entry.fact ?? fallbackFact) : entry.fact,
      };
    }),
  }));
}

function activateWorkout(workoutId) {
  const activeExists = getWorkouts().some((item) => item.status === workoutStatuses.active && item.id !== workoutId);
  if (activeExists) {
    alert("Сначала заверши текущую активную тренировку.");
    return;
  }
  changeWorkoutStatus(workoutId, (workout) => ({
    ...workout,
    status: workoutStatuses.active,
    actualStartTime: new Date().toISOString(),
  }));
}

function completeWorkout(workoutId) {
  changeWorkoutStatus(workoutId, (workout) => ({
    ...workout,
    status: workoutStatuses.completed,
    actualStartTime: workout.actualStartTime || new Date().toISOString(),
    actualEndTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
  }));
}

function renderActiveWorkoutCard(workout) {
  if (!workout) {
    activeWorkoutCard.hidden = true;
    activeWorkoutCard.innerHTML = "";
    return;
  }

  const pendingCount = workout.exercises.filter((entry) => entry.status !== "done").length;
  const doneCount = workout.exercises.filter((entry) => entry.status === "done").length;
  const entries = workout.exercises.filter((entry) => {
    if (activeWorkoutExerciseFilter === "done") return entry.status === "done";
    if (activeWorkoutExerciseFilter === "pending") return entry.status !== "done";
    return true;
  });

  activeWorkoutCard.hidden = false;
  activeWorkoutCard.innerHTML = `
    <div class="active-workout-top">
      <div class="active-workout-copy">
        <p class="section-kicker">Активная тренировка</p>
        <h3>${escapeHtml(workoutListTitle(workout))}</h3>
        <p class="history-meta">${escapeHtml(workoutDateMeta(workout))}</p>
      </div>
      <button class="mini-icon-button active-card-edit" type="button" aria-label="Редактировать план">✎</button>
    </div>
    <div class="active-workout-statusbar">
      <span class="tiny-pill tiny-pill-success">${workoutStatusLabel(workout.status)}</span>
      <span class="tiny-pill">${pendingCount} осталось</span>
      <span class="tiny-pill">${doneCount} сделано</span>
    </div>
    <div class="workout-filter-row compact">
      <button class="filter-chip ${activeWorkoutExerciseFilter === "pending" ? "is-active" : ""}" type="button" data-active-filter="pending">Запланированные</button>
      <button class="filter-chip ${activeWorkoutExerciseFilter === "done" ? "is-active" : ""}" type="button" data-active-filter="done">Сделанные</button>
    </div>
    <div class="active-exercise-list">
      ${entries.length ? entries.map((entry) => `
        <article class="active-exercise-item ${entry.status === "done" ? "is-done" : ""}">
          <div class="active-exercise-copy">
            <h4>${escapeHtml(getExerciseById(entry.exerciseId)?.name || "Упражнение")}</h4>
            <p>${escapeHtml(workoutExerciseSummary(entry))}</p>
          </div>
          <button class="active-exercise-toggle ${entry.status === "done" ? "is-done" : ""}" type="button" data-entry-id="${entry.id}" aria-label="${entry.status === "done" ? "Вернуть в запланированные" : "Отметить как выполненное"}">
            ${entry.status === "done" ? "✓" : "Готово"}
          </button>
        </article>
      `).join("") : `<p class="helper-text">В этом фильтре пока нет упражнений.</p>`}
    </div>
    <div class="active-workout-actions">
      <button class="primary-button active-primary-action" type="button" data-active-complete="${workout.id}">Завершить тренировку</button>
      <button class="ghost-button active-secondary-action" type="button" data-active-edit="${workout.id}">Изменить план</button>
    </div>
  `;

  activeWorkoutCard.querySelectorAll("[data-active-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeWorkoutExerciseFilter = button.dataset.activeFilter;
      renderWorkoutHistory();
    });
  });

  activeWorkoutCard.querySelectorAll(".active-exercise-toggle").forEach((button) => {
    button.addEventListener("click", () => toggleWorkoutExerciseDone(workout.id, button.dataset.entryId));
  });

  activeWorkoutCard.querySelector("[data-active-complete]")?.addEventListener("click", () => completeWorkout(workout.id));
  const openEdit = () => {
    fillWorkoutForm({
      ...workout,
      scheduledStartTime: workout.scheduledStartTime ? toLocalInputValue(new Date(workout.scheduledStartTime)) : "",
      scheduledEndTime: workout.scheduledEndTime ? toLocalInputValue(new Date(workout.scheduledEndTime)) : "",
      actualStartTime: workout.actualStartTime ? toLocalInputValue(new Date(workout.actualStartTime)) : "",
      actualEndTime: workout.actualEndTime ? toLocalInputValue(new Date(workout.actualEndTime)) : "",
    }, { editing: true });
    openFormView("workouts");
  };

  activeWorkoutCard.querySelector(".active-card-edit")?.addEventListener("click", openEdit);
  activeWorkoutCard.querySelector("[data-active-edit]")?.addEventListener("click", openEdit);
}

function renderWorkoutHistory() {
  const workouts = getWorkouts().sort((a, b) => {
    const statusOrder = workoutStatusSortOrder(a.status) - workoutStatusSortOrder(b.status);
    if (statusOrder !== 0) return statusOrder;
    return new Date(getWorkoutPrimaryStart(b) || b.createdAt || 0) - new Date(getWorkoutPrimaryStart(a) || a.createdAt || 0);
  });

  const activeWorkout = workouts.find((item) => item.status === workoutStatuses.active) ?? null;
  const filteredWorkouts = workouts.filter((workout) => {
    if (workout.status === workoutStatuses.active) return false;
    if (workoutListFilter === "planned") return workout.status === workoutStatuses.planned;
    return workout.status === workoutStatuses.completed || workout.status === workoutStatuses.cancelled;
  });

  renderActiveWorkoutCard(activeWorkout);
  workoutHistoryList.innerHTML = "";
  workoutHistoryCount.textContent = `${filteredWorkouts.length} ${pluralize(filteredWorkouts.length, "запись", "записи", "записей")}`;
  workoutEmptyState.hidden = filteredWorkouts.length > 0 || Boolean(activeWorkout);
  plannedFilterButton?.classList.toggle("is-active", workoutListFilter === "planned");
  completedFilterButton?.classList.toggle("is-active", workoutListFilter === "completed");

  filteredWorkouts.forEach((workout) => {
    const summary = workout.exercises.length
      ? workout.exercises.map((entry) => getExerciseById(entry.exerciseId)?.name || "Удалённое упражнение").join(" · ")
      : "Без упражнений";
    const card = document.createElement("article");
    card.className = "history-card compact-history-card";
    card.innerHTML = `
      <div class="history-topline">
        <div>
          <h4 class="history-title">${escapeHtml(workoutListTitle(workout))}</h4>
          <p class="history-meta">${workoutDateMeta(workout)} · ${workoutTypeLabel(workout.type)} · ${workoutStatusLabel(workout.status)}</p>
        </div>
        <span class="pill">${workoutStatusLabel(workout.status)}</span>
      </div>
      <p class="history-summary">${escapeHtml(summary)}</p>
      <div class="history-card-actions">
        ${workout.status === workoutStatuses.planned ? `<button class="secondary-button activate-workout-button" type="button">Активировать</button>` : ""}
        <button class="mini-icon-button edit-workout-button" type="button" aria-label="Редактировать">✎</button>
        <button class="ghost-button delete-workout-button" type="button">Удалить</button>
      </div>
    `;
    card.querySelector(".edit-workout-button").addEventListener("click", () => {
      fillWorkoutForm({
        ...workout,
        scheduledStartTime: workout.scheduledStartTime ? toLocalInputValue(new Date(workout.scheduledStartTime)) : "",
        scheduledEndTime: workout.scheduledEndTime ? toLocalInputValue(new Date(workout.scheduledEndTime)) : "",
        actualStartTime: workout.actualStartTime ? toLocalInputValue(new Date(workout.actualStartTime)) : "",
        actualEndTime: workout.actualEndTime ? toLocalInputValue(new Date(workout.actualEndTime)) : "",
      }, { editing: true });
      setDraftStatus(workoutDraftStatus, "");
      persistWorkoutDraft();
      openFormView("workouts");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    card.querySelector(".activate-workout-button")?.addEventListener("click", () => activateWorkout(workout.id));
    card.querySelector(".delete-workout-button").addEventListener("click", () => {
      if (!window.confirm("Удалить эту тренировку?")) return;
      const previous = getWorkouts();
      const next = previous.filter((item) => item.id !== workout.id);
      runDeleteWithUndo({
        message: "Тренировка удалена.",
        apply: () => {
          if (!setWorkouts(next)) return false;
          renderWorkoutHistory();
          if (workoutIdInput.value === workout.id) resetWorkoutForm();
          return true;
        },
        restore: () => {
          setWorkouts(previous);
          renderWorkoutHistory();
        },
      });
    });
    workoutHistoryList.append(card);
  });
}

function buildExerciseDraft() {
  return {
    id: exerciseIdInput.value,
    name: exerciseNameInput.value.trim(),
    type: exerciseTypeInput.value,
    description: exerciseDescriptionInput.value.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function persistExerciseDraft() {
  const draft = buildExerciseDraft();
  const hasMeaning = Boolean(draft.id || draft.name || draft.type !== "strength" || draft.description);
  if (hasMeaning) {
    saveObject(storageKeys.exerciseDraft, draft, "сохранить черновик упражнения");
  } else {
    clearObject(storageKeys.exerciseDraft, "очистить черновик упражнения");
  }
}

function resetExerciseForm({ preserveDraft = false, preserveStatus = false } = {}) {
  exerciseForm.reset();
  exerciseIdInput.value = "";
  exerciseFormTitle.textContent = "Новое упражнение";
  exerciseTypeInput.value = "strength";
  if (!preserveDraft) clearObject(storageKeys.exerciseDraft, "очистить черновик упражнения");
  if (!preserveStatus) setDraftStatus(exerciseDraftStatus, "");
}

function fillExerciseForm(exercise) {
  exerciseIdInput.value = exercise.id ?? "";
  exerciseNameInput.value = exercise.name ?? "";
  exerciseTypeInput.value = exercise.type ?? "strength";
  exerciseDescriptionInput.value = exercise.description ?? "";
  exerciseFormTitle.textContent = exercise.id ? "Редактирование упражнения" : "Новое упражнение";
}

function restoreExerciseDraft() {
  const draft = loadObject(storageKeys.exerciseDraft);
  if (!draft) {
    resetExerciseForm({ preserveDraft: true, preserveStatus: true });
    return;
  }
  fillExerciseForm(draft);
  if (draft.updatedAt) {
    setDraftStatus(exerciseDraftStatus, `Черновик упражнения восстановлен: ${formatDate(draft.updatedAt)}`);
  }
}

function renderExerciseHistory() {
  const exercises = getActiveExercises().sort((a, b) => a.name.localeCompare(b.name, "ru"));
  exerciseHistoryList.innerHTML = "";
  exerciseHistoryCount.textContent = `${exercises.length} ${pluralize(exercises.length, "запись", "записи", "записей")}`;
  exerciseEmptyState.hidden = exercises.length > 0;

  exercises.forEach((exercise) => {
    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-topline">
        <div>
          <h4 class="history-title">${escapeHtml(exercise.name)}</h4>
          <p class="history-meta">${exerciseTypeLabel(exercise.type)}</p>
        </div>
        <button class="mini-icon-button edit-exercise-button" type="button" aria-label="Редактировать">✎</button>
      </div>
      <div class="history-card-actions">
        <button class="ghost-button delete-exercise-button" type="button">Скрыть</button>
      </div>
    `;
    card.querySelector(".edit-exercise-button").addEventListener("click", () => {
      fillExerciseForm(exercise);
      setDraftStatus(exerciseDraftStatus, "");
      persistExerciseDraft();
      openFormView("exercises");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    card.querySelector(".delete-exercise-button").addEventListener("click", () => {
      if (!window.confirm("Скрыть упражнение из справочника? В старых тренировках оно останется.")) return;
      const previous = getExercises();
      const next = previous.map((item) => item.id === exercise.id ? { ...item, archived: true } : item);
      runDeleteWithUndo({
        message: "Упражнение скрыто из справочника.",
        apply: () => {
          if (!setExercises(next)) return false;
          renderExerciseHistory();
          refreshWorkoutExerciseCards();
          if (exerciseIdInput.value === exercise.id) resetExerciseForm();
          return true;
        },
        restore: () => {
          setExercises(previous);
          renderExerciseHistory();
          refreshWorkoutExerciseCards();
        },
      });
    });
    exerciseHistoryList.append(card);
  });
}

function buildMeasurementDraft() {
  return {
    id: measurementIdInput.value,
    title: measurementTitleInput.value.trim(),
    date: measurementDateInput.value,
    weight: measurementWeightInput.value,
    bodyFat: measurementBodyFatInput.value,
    chest: measurementChestInput.value,
    waist: measurementWaistInput.value,
    belly: measurementBellyInput.value,
    hips: measurementHipsInput.value,
    arm: measurementArmInput.value,
    leg: measurementLegInput.value,
    note: measurementNoteInput.value.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function persistMeasurementDraft() {
  const draft = buildMeasurementDraft();
  const hasMeaning = Boolean(
    draft.id || draft.title || draft.date || draft.weight || draft.bodyFat || draft.chest ||
    draft.waist || draft.belly || draft.hips || draft.arm || draft.leg || draft.note
  );
  if (hasMeaning) {
    saveObject(storageKeys.measurementDraft, draft, "сохранить черновик замера");
  } else {
    clearObject(storageKeys.measurementDraft, "очистить черновик замера");
  }
}

function measurementNumericFields() {
  return [
    measurementWeightInput,
    measurementBodyFatInput,
    measurementChestInput,
    measurementWaistInput,
    measurementBellyInput,
    measurementHipsInput,
    measurementArmInput,
    measurementLegInput,
  ];
}

function getLastMeasurement() {
  return getMeasurements().sort((a, b) => new Date(b.date) - new Date(a.date))[0] ?? null;
}

function applyMeasurementPlaceholders() {
  const last = getLastMeasurement();
  const pairs = [
    [measurementWeightInput, last?.weight],
    [measurementBodyFatInput, last?.bodyFat],
    [measurementChestInput, last?.chest],
    [measurementWaistInput, last?.waist],
    [measurementBellyInput, last?.belly],
    [measurementHipsInput, last?.hips],
    [measurementArmInput, last?.arm],
    [measurementLegInput, last?.leg],
  ];
  pairs.forEach(([input, value]) => {
    input.placeholder = value ? String(value) : input.defaultPlaceholder || input.placeholder;
  });
}

function resetMeasurementForm({ preserveDraft = false, preserveStatus = false } = {}) {
  measurementForm.reset();
  measurementIdInput.value = "";
  measurementFormTitle.textContent = "Новый замер";
  measurementDateInput.value = new Date().toISOString().slice(0, 10);
  if (!preserveDraft) clearObject(storageKeys.measurementDraft, "очистить черновик замера");
  if (!preserveStatus) setDraftStatus(measurementDraftStatus, "");
  applyMeasurementPlaceholders();
}

function fillMeasurementForm(item) {
  measurementIdInput.value = item.id ?? "";
  measurementTitleInput.value = item.title ?? "";
  measurementDateInput.value = item.date ?? "";
  measurementWeightInput.value = item.weight ?? "";
  measurementBodyFatInput.value = item.bodyFat ?? "";
  measurementChestInput.value = item.chest ?? "";
  measurementWaistInput.value = item.waist ?? "";
  measurementBellyInput.value = item.belly ?? "";
  measurementHipsInput.value = item.hips ?? "";
  measurementArmInput.value = item.arm ?? "";
  measurementLegInput.value = item.leg ?? "";
  measurementNoteInput.value = item.note ?? "";
  measurementFormTitle.textContent = item.id ? "Редактирование замера" : "Новый замер";
  applyMeasurementPlaceholders();
}

function restoreMeasurementDraft() {
  const draft = loadObject(storageKeys.measurementDraft);
  if (!draft) {
    resetMeasurementForm({ preserveDraft: true, preserveStatus: true });
    return;
  }
  fillMeasurementForm(draft);
  if (draft.updatedAt) {
    setDraftStatus(measurementDraftStatus, `Черновик замера восстановлен: ${formatDate(draft.updatedAt)}`);
  }
}

function measurementListTitle(item) {
  return item.title?.trim() || "Замер";
}

function renderMeasurementHistory() {
  const items = getMeasurements().sort((a, b) => new Date(b.date) - new Date(a.date));
  measurementHistoryList.innerHTML = "";
  measurementHistoryCount.textContent = `${items.length} ${pluralize(items.length, "запись", "записи", "записей")}`;
  measurementEmptyState.hidden = items.length > 0;
  applyMeasurementPlaceholders();

  items.forEach((item) => {
    const details = [
      item.weight ? `Вес: ${item.weight} кг` : null,
      item.bodyFat ? `Жир: ${item.bodyFat}%` : null,
      item.waist ? `Талия: ${item.waist}` : null,
    ].filter(Boolean).join(" · ") || "Без дополнительных полей";
    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-topline">
        <div>
          <h4 class="history-title">${escapeHtml(measurementListTitle(item))}</h4>
          <p class="history-meta">${formatDateOnly(item.date)}</p>
        </div>
        <button class="mini-icon-button edit-measurement-button" type="button" aria-label="Редактировать">✎</button>
      </div>
      <p class="history-summary">${escapeHtml(details)}</p>
      <div class="history-card-actions">
        <button class="ghost-button delete-measurement-button" type="button">Удалить</button>
      </div>
    `;
    card.querySelector(".edit-measurement-button").addEventListener("click", () => {
      fillMeasurementForm(item);
      setDraftStatus(measurementDraftStatus, "");
      persistMeasurementDraft();
      openFormView("measurements");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    card.querySelector(".delete-measurement-button").addEventListener("click", () => {
      if (!window.confirm("Удалить этот замер?")) return;
      const previous = getMeasurements();
      const next = previous.filter((entry) => entry.id !== item.id);
      runDeleteWithUndo({
        message: "Замер удален.",
        apply: () => {
          if (!setMeasurements(next)) return false;
          renderMeasurementHistory();
          if (measurementIdInput.value === item.id) resetMeasurementForm();
          return true;
        },
        restore: () => {
          setMeasurements(previous);
          renderMeasurementHistory();
        },
      });
    });
    measurementHistoryList.append(card);
  });
}

function normalizeExerciseName(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
}

function collectAllData() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    workouts: getWorkouts(),
    exercises: getExercises(),
    measurements: getMeasurements(),
    drafts: {
      workout: loadObject(storageKeys.workoutDraft),
      exercise: loadObject(storageKeys.exerciseDraft),
      measurement: loadObject(storageKeys.measurementDraft),
    },
  };
}

function applyImportedData(payload) {
  suppressSaveErrors = true;
  isApplyingServerState = true;
  try {
    const writes = [
      saveList(storageKeys.workouts, Array.isArray(payload.workouts) ? payload.workouts : [], "импортировать тренировки"),
      saveList(storageKeys.exercises, Array.isArray(payload.exercises) ? payload.exercises : [], "импортировать упражнения"),
      saveList(storageKeys.measurements, Array.isArray(payload.measurements) ? payload.measurements : [], "импортировать замеры"),
    ];
    const drafts = payload.drafts && typeof payload.drafts === "object" ? payload.drafts : {};
    writes.push(drafts.workout ? saveObject(storageKeys.workoutDraft, drafts.workout, "импортировать черновик тренировки") : clearObject(storageKeys.workoutDraft, "очистить черновик тренировки"));
    writes.push(drafts.exercise ? saveObject(storageKeys.exerciseDraft, drafts.exercise, "импортировать черновик упражнения") : clearObject(storageKeys.exerciseDraft, "очистить черновик упражнения"));
    writes.push(drafts.measurement ? saveObject(storageKeys.measurementDraft, drafts.measurement, "импортировать черновик замера") : clearObject(storageKeys.measurementDraft, "очистить черновик замера"));
    return writes.every(Boolean);
  } finally {
    isApplyingServerState = false;
    suppressSaveErrors = false;
  }
}

async function pullServerData() {
  const payload = await apiRequest("/sync");
  if (!applyImportedData(payload)) {
    throw new Error("Не удалось применить данные с сервера");
  }
  restoreWorkoutDraft();
  restoreExerciseDraft();
  restoreMeasurementDraft();
  renderWorkoutHistory();
  renderExerciseHistory();
  renderMeasurementHistory();
  refreshWorkoutExerciseCards();
}

async function pushServerData() {
  if (!isAuthenticated || isApplyingServerState) return;
  const payload = collectAllData();
  await apiRequest("/sync", {
    method: "PUT",
    body: {
      workouts: payload.workouts,
      exercises: payload.exercises,
      measurements: payload.measurements,
    },
  });
  updateSyncStatus(`Последняя синхронизация: ${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`);
}

function queueServerSync() {
  if (!isAuthenticated || isApplyingServerState) return;
  clearTimeout(serverSyncTimer);
  serverSyncTimer = window.setTimeout(() => {
    pushServerData().catch((error) => {
      console.error(error);
      updateSyncStatus("Не удалось синхронизировать изменения. Попробуй ещё раз.");
      showToast("Не удалось синхронизировать изменения с сервером.");
    });
  }, 500);
}

function exportData() {
  const blob = new Blob([JSON.stringify(collectAllData(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `workout-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Резервная копия выгружена.");
}

function clearAllData() {
  if (!window.confirm("Очистить все тренировки, упражнения, замеры и черновики на этом устройстве?")) return;
  const snapshot = collectAllData();
  suppressSaveErrors = true;
  try {
    Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    suppressSaveErrors = false;
    reportStorageError("очистить данные", error);
    return;
  }
  suppressSaveErrors = false;
  resetWorkoutForm();
  resetExerciseForm();
  resetMeasurementForm();
  renderWorkoutHistory();
  renderExerciseHistory();
  renderMeasurementHistory();
  refreshWorkoutExerciseCards();
  showToast("Все локальные данные очищены.", {
    duration: 5000,
    actionLabel: "Отменить",
    onAction: () => {
      applyImportedData(snapshot);
      restoreWorkoutDraft();
      restoreExerciseDraft();
      restoreMeasurementDraft();
      renderWorkoutHistory();
      renderExerciseHistory();
      renderMeasurementHistory();
      refreshWorkoutExerciseCards();
    },
  });
}

function importDataFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(String(reader.result));
      if (!window.confirm("Импорт заменит текущие локальные данные на этом устройстве. Продолжить?")) return;
      if (!applyImportedData(payload)) {
        showToast("Импорт не завершен. Проверь файл и место в браузере.");
        return;
      }
      restoreWorkoutDraft();
      restoreExerciseDraft();
      restoreMeasurementDraft();
      renderWorkoutHistory();
      renderExerciseHistory();
      renderMeasurementHistory();
      refreshWorkoutExerciseCards();
      showToast("Данные успешно импортированы.");
    } catch (error) {
      console.error(error);
      showToast("Не удалось импортировать файл. Проверь формат JSON.");
    } finally {
      importDataInput.value = "";
    }
  });
  reader.addEventListener("error", () => {
    showToast("Не удалось прочитать файл.");
    importDataInput.value = "";
  });
  reader.readAsText(file);
}

function startExerciseCreationFromWorkout() {
  const workoutType = workoutTypeInput.value;
  savePendingExerciseContext({
    workoutType,
    targetCardIndex: findPendingWorkoutCardIndex(),
    createdAt: new Date().toISOString(),
  });
  openFormView("exercises");
  if (!hasMeaningfulExerciseDraft()) {
    resetExerciseForm({ preserveDraft: false, preserveStatus: true });
    exerciseTypeInput.value = workoutType;
  }
  setDraftStatus(
    exerciseDraftStatus,
    `Создай ${workoutTypeLabel(workoutType).toLowerCase()} упражнение. После сохранения вернем его в текущую тренировку.`
  );
  persistExerciseDraft();
  exerciseNameInput.focus();
}

function openWorkoutForm({ editing = false } = {}) {
  if (!editing && !loadObject(storageKeys.workoutDraft)) {
    resetWorkoutForm({ preserveDraft: true, preserveStatus: true });
  }
  openFormView("workouts");
}

function openExerciseForm() {
  if (!loadObject(storageKeys.exerciseDraft)) {
    resetExerciseForm({ preserveDraft: true, preserveStatus: true });
  }
  openFormView("exercises");
}

function openMeasurementForm() {
  if (!loadObject(storageKeys.measurementDraft)) {
    resetMeasurementForm({ preserveDraft: true, preserveStatus: true });
  }
  openFormView("measurements");
}

function setAuthMode(registerMode) {
  isRegisterMode = registerMode;
  authSubmitButton.textContent = registerMode ? "Создать аккаунт" : "Войти";
  authToggleButton.textContent = registerMode ? "У меня уже есть аккаунт" : "Создать аккаунт";
  setDraftStatus(authStatus, "");
}

async function submitAuthForm(event) {
  event.preventDefault();
  const email = authEmailInput.value.trim().toLowerCase();
  const password = authPasswordInput.value;
  if (!email || !password) return;

  authSubmitButton.disabled = true;
  authToggleButton.disabled = true;
  setDraftStatus(authStatus, isRegisterMode ? "Создаем аккаунт..." : "Входим...");

  try {
    const payload = await apiRequest(isRegisterMode ? "/auth/register" : "/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });

    saveAuthSession(payload.access_token, payload.user);
    setAuthenticatedUI(true, payload.user);
    await pullServerData();
    authPasswordInput.value = "";
    setDraftStatus(authStatus, "");
    showToast(isRegisterMode ? "Аккаунт создан." : "Вход выполнен.");
  } catch (error) {
    console.error(error);
    setDraftStatus(authStatus, error.message || "Не удалось выполнить вход.");
  } finally {
    authSubmitButton.disabled = false;
    authToggleButton.disabled = false;
  }
}

async function logout() {
  clearTimeout(serverSyncTimer);
  clearAuthSession();
  setAuthenticatedUI(false, null);
  authPasswordInput.value = "";
  showToast("Вы вышли из аккаунта.");
}

async function bootstrapAuth() {
  if (!logoutButton && clearAllDataButton?.parentElement) {
    logoutButton = document.createElement("button");
    logoutButton.id = "logout-button";
    logoutButton.className = "ghost-button";
    logoutButton.type = "button";
    logoutButton.textContent = "Выйти";
    clearAllDataButton.parentElement.append(logoutButton);
    logoutButton.addEventListener("click", logout);
  }

  const token = loadAuthToken();
  if (!token) {
    setAuthenticatedUI(false, null);
    setAuthMode(false);
    return;
  }

  try {
    const user = await apiRequest("/auth/me");
    setAuthenticatedUI(true, user);
    await pullServerData();
  } catch (error) {
    console.error(error);
    clearAuthSession();
    setAuthenticatedUI(false, null);
    setAuthMode(false);
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    openListView(item.dataset.view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const viewName = button.dataset.back;
    clearPendingExerciseContext();
    openListView(viewName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

openWorkoutFormButton.addEventListener("click", () => {
  resetWorkoutForm({ preserveDraft: true, preserveStatus: true });
  openWorkoutForm();
  workoutTitleInput.focus();
});

openExerciseFormButton.addEventListener("click", () => {
  resetExerciseForm({ preserveDraft: true, preserveStatus: true });
  openExerciseForm();
  exerciseNameInput.focus();
});

openMeasurementFormButton.addEventListener("click", () => {
  resetMeasurementForm({ preserveDraft: true, preserveStatus: true });
  openMeasurementForm();
  measurementTitleInput.focus();
});

workoutTypeInput.addEventListener("change", () => {
  refreshWorkoutExerciseCards();
  persistWorkoutDraft();
});

workoutStatusInput.addEventListener("change", () => {
  syncWorkoutDateLabels();
  persistWorkoutDraft();
});

[workoutTitleInput, workoutStartTimeInput, workoutEndTimeInput].forEach((input) => {
  input.addEventListener("input", persistWorkoutDraft);
  input.addEventListener("change", persistWorkoutDraft);
});

[exerciseNameInput, exerciseTypeInput, exerciseDescriptionInput].forEach((input) => {
  input.addEventListener("input", persistExerciseDraft);
  input.addEventListener("change", persistExerciseDraft);
});

[
  measurementTitleInput,
  measurementDateInput,
  measurementWeightInput,
  measurementBodyFatInput,
  measurementChestInput,
  measurementWaistInput,
  measurementBellyInput,
  measurementHipsInput,
  measurementArmInput,
  measurementLegInput,
  measurementNoteInput,
].forEach((input) => {
  input.addEventListener("input", persistMeasurementDraft);
  input.addEventListener("change", persistMeasurementDraft);
});

addWorkoutExerciseButton.addEventListener("click", () => createWorkoutExerciseCard());
createExerciseFromWorkoutButton.addEventListener("click", startExerciseCreationFromWorkout);
resetWorkoutButton.addEventListener("click", () => resetWorkoutForm());
resetExerciseButton.addEventListener("click", () => resetExerciseForm());
resetMeasurementButton.addEventListener("click", () => resetMeasurementForm());
exportDataButton.addEventListener("click", exportData);
importDataButton.addEventListener("click", () => importDataInput.click());
importDataInput.addEventListener("change", () => importDataFromFile(importDataInput.files?.[0]));
clearAllDataButton.addEventListener("click", clearAllData);
authForm.addEventListener("submit", submitAuthForm);
authToggleButton.addEventListener("click", () => setAuthMode(!isRegisterMode));
if (logoutButton) logoutButton.addEventListener("click", logout);
plannedFilterButton?.addEventListener("click", () => {
  workoutListFilter = "planned";
  renderWorkoutHistory();
});
completedFilterButton?.addEventListener("click", () => {
  workoutListFilter = "completed";
  renderWorkoutHistory();
});
if (authShowPasswordInput) {
  authShowPasswordInput.addEventListener("change", () => {
    authPasswordInput.type = authShowPasswordInput.checked ? "text" : "password";
  });
}

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const entries = collectWorkoutExercises().filter((entry) => entry.exerciseId);
  if (!entries.length) {
    alert("Добавь хотя бы одно упражнение в тренировку.");
    return;
  }
  const invalidEntry = entries.find((entry) => {
    const exercise = getExerciseById(entry.exerciseId);
    return !exercise || exercise.type !== workoutTypeInput.value || exercise.archived;
  });
  if (invalidEntry) {
    alert("В тренировке есть упражнение неподходящего типа или скрытое упражнение.");
    return;
  }
  const startTime = new Date(workoutStartTimeInput.value);
  const endTime = new Date(workoutEndTimeInput.value);
  if (Number.isNaN(startTime.valueOf()) || Number.isNaN(endTime.valueOf())) {
    alert("Проверь дату и время тренировки.");
    return;
  }
  if (endTime < startTime) {
    alert("Окончание тренировки не может быть раньше начала.");
    return;
  }

  const workout = {
    id: workoutIdInput.value || uid(),
    title: workoutTitleInput.value.trim(),
    type: workoutTypeInput.value,
    status: workoutStatusInput.value,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    scheduledStartTime: workoutStatusInput.value === workoutStatuses.planned ? startTime.toISOString() : "",
    scheduledEndTime: workoutStatusInput.value === workoutStatuses.planned ? endTime.toISOString() : "",
    actualStartTime: workoutStatusInput.value === workoutStatuses.completed ? startTime.toISOString() : "",
    actualEndTime: workoutStatusInput.value === workoutStatuses.completed ? endTime.toISOString() : "",
    createdAt: getWorkouts().find((item) => item.id === workoutIdInput.value)?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: entries.map((entry) => ({
      id: uid(),
      exerciseId: entry.exerciseId,
      status: workoutStatusInput.value === workoutStatuses.completed ? "done" : "pending",
      plan: {
        sets: entry.sets === "" ? null : Number(entry.sets),
        weight: entry.weight === "" ? null : Number(entry.weight),
        reps: entry.reps === "" ? null : Number(entry.reps),
        note: entry.note,
      },
      fact: workoutStatusInput.value === workoutStatuses.completed
        ? {
            sets: entry.sets === "" ? null : Number(entry.sets),
            weight: entry.weight === "" ? null : Number(entry.weight),
            reps: entry.reps === "" ? null : Number(entry.reps),
            note: entry.note,
          }
        : null,
    })),
  };

  const workouts = getWorkouts();
  const existingIndex = workouts.findIndex((item) => item.id === workout.id);
  if (existingIndex >= 0) workouts[existingIndex] = workout;
  else workouts.push(workout);

  if (!setWorkouts(workouts)) return;
  clearObject(storageKeys.workoutDraft, "очистить черновик тренировки");
  resetWorkoutForm();
  renderWorkoutHistory();
  openListView("workouts");
  showToast("Тренировка сохранена.");
});

exerciseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = exerciseNameInput.value.trim();
  const normalizedName = normalizeExerciseName(name);
  const exercises = getExercises();
  const duplicate = exercises.find((item) => item.id !== exerciseIdInput.value && normalizeExerciseName(item.name) === normalizedName && !item.archived);
  if (duplicate) {
    alert("Упражнение с таким названием уже есть в справочнике.");
    return;
  }
  const archivedDuplicate = exercises.find((item) => item.id !== exerciseIdInput.value && normalizeExerciseName(item.name) === normalizedName && item.archived);
  if (archivedDuplicate && !window.confirm("Такое упражнение уже было скрыто. Сохранить новое заново?")) {
    return;
  }

  const exercise = {
    id: exerciseIdInput.value || uid(),
    name,
    type: exerciseTypeInput.value,
    description: exerciseDescriptionInput.value.trim(),
    archived: false,
  };

  const existingIndex = exercises.findIndex((item) => item.id === exercise.id);
  if (existingIndex >= 0) exercises[existingIndex] = exercise;
  else exercises.push(exercise);
  if (!setExercises(exercises)) return;

  const pendingContext = loadPendingExerciseContext();
  clearObject(storageKeys.exerciseDraft, "очистить черновик упражнения");
  resetExerciseForm();
  renderExerciseHistory();
  refreshWorkoutExerciseCards();

  if (pendingContext && pendingContext.workoutType === exercise.type) {
    applyExerciseToWorkoutCard(pendingContext.targetCardIndex ?? 0, exercise.id);
    clearPendingExerciseContext();
    openFormView("workouts");
    showToast("Упражнение сохранено и добавлено в текущую тренировку.");
    return;
  }

  clearPendingExerciseContext();
  openListView("exercises");
  showToast("Упражнение сохранено.");
});

measurementForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!measurementDateInput.value) {
    alert("Укажи дату замера.");
    return;
  }
  const bodyFat = measurementBodyFatInput.value.trim();
  if (bodyFat && (Number(bodyFat) < 0 || Number(bodyFat) > 100)) {
    alert("Процент жира должен быть в диапазоне от 0 до 100.");
    return;
  }
  const hasAnyNumeric = measurementNumericFields().some((input) => input.value.trim() !== "");
  if (!hasAnyNumeric) {
    alert("Для замера нужно заполнить хотя бы одно числовое поле.");
    return;
  }

  const measurement = {
    id: measurementIdInput.value || uid(),
    title: measurementTitleInput.value.trim(),
    date: measurementDateInput.value,
    weight: measurementWeightInput.value.trim(),
    bodyFat: bodyFat,
    chest: measurementChestInput.value.trim(),
    waist: measurementWaistInput.value.trim(),
    belly: measurementBellyInput.value.trim(),
    hips: measurementHipsInput.value.trim(),
    arm: measurementArmInput.value.trim(),
    leg: measurementLegInput.value.trim(),
    note: measurementNoteInput.value.trim(),
  };

  const items = getMeasurements();
  const existingIndex = items.findIndex((item) => item.id === measurement.id);
  if (existingIndex >= 0) items[existingIndex] = measurement;
  else items.push(measurement);
  if (!setMeasurements(items)) return;

  clearObject(storageKeys.measurementDraft, "очистить черновик замера");
  resetMeasurementForm();
  renderMeasurementHistory();
  openListView("measurements");
  showToast("Замер сохранен.");
});

measurementNumericFields().forEach((input) => {
  input.defaultPlaceholder = input.placeholder;
});

function initializeLocalUI() {
  restoreWorkoutDraft();
  restoreExerciseDraft();
  restoreMeasurementDraft();
  renderWorkoutHistory();
  renderExerciseHistory();
  renderMeasurementHistory();
  refreshWorkoutExerciseCards();
  showView(getLastView());
  showSubview(activeView, viewModes[activeView]);
}

async function initApp() {
  initializeLocalUI();
  await bootstrapAuth();
}

initApp().catch((error) => {
  console.error(error);
  showToast("Не удалось запустить приложение.");
});
