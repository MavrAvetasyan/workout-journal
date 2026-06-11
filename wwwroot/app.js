const storageKeys = {
  workouts: "training-journal-workouts-v2",
  exercises: "training-journal-exercises-v1",
  measurements: "training-journal-measurements-v1",
  workoutDraft: "training-journal-workout-draft-v2",
  exerciseDraft: "training-journal-exercise-draft-v1",
  measurementDraft: "training-journal-measurement-draft-v1",
};

const views = {
  workouts: document.querySelector("#view-workouts"),
  exercises: document.querySelector("#view-exercises"),
  measurements: document.querySelector("#view-measurements"),
  more: document.querySelector("#view-more"),
};

const navItems = [...document.querySelectorAll(".nav-item")];

const workoutForm = document.querySelector("#workout-form");
const workoutFormTitle = document.querySelector("#workout-form-title");
const workoutDraftStatus = document.querySelector("#workout-draft-status");
const workoutIdInput = document.querySelector("#workout-id");
const workoutTitleInput = document.querySelector("#workout-title");
const workoutTypeInput = document.querySelector("#workout-type");
const workoutStartTimeInput = document.querySelector("#workout-start-time");
const workoutEndTimeInput = document.querySelector("#workout-end-time");
const workoutExercisesList = document.querySelector("#workout-exercises-list");
const workoutExerciseTemplate = document.querySelector("#workout-exercise-template");
const workoutHistoryList = document.querySelector("#workout-history-list");
const workoutHistoryCount = document.querySelector("#workout-history-count");
const workoutEmptyState = document.querySelector("#workout-empty-state");
const openWorkoutFormButton = document.querySelector("#open-workout-form-button");
const resetWorkoutButton = document.querySelector("#reset-workout-button");
const addWorkoutExerciseButton = document.querySelector("#add-workout-exercise-button");
const exercisePickerHint = document.querySelector("#exercise-picker-hint");

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
const resetMeasurementButton = document.querySelector("#reset-measurement-button");

function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadObject(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function clearObject(key) {
  localStorage.removeItem(key);
}

function uid() {
  if (window.crypto && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setDraftStatus(element, text = "") {
  if (!text) {
    element.hidden = true;
    element.textContent = "";
    return;
  }

  element.hidden = false;
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

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

function getWorkouts() {
  return loadList(storageKeys.workouts);
}

function setWorkouts(items) {
  saveList(storageKeys.workouts, items);
}

function getExercises() {
  return loadList(storageKeys.exercises);
}

function setExercises(items) {
  saveList(storageKeys.exercises, items);
}

function getMeasurements() {
  return loadList(storageKeys.measurements);
}

function setMeasurements(items) {
  saveList(storageKeys.measurements, items);
}

function getExerciseById(exerciseId) {
  return getExercises().find((item) => item.id === exerciseId) ?? null;
}

function normalizeWorkoutExercise(item = {}) {
  return {
    exerciseId: item.exerciseId ?? "",
    sets: item.sets ?? "",
    weight: item.weight ?? "",
    reps: item.reps ?? "",
    note: item.note ?? "",
  };
}

function renderExercisePicker(select, selectedId = "") {
  const workoutType = workoutTypeInput.value;
  const exercises = getExercises().filter((exercise) => exercise.type === workoutType);
  const placeholder = `<option value="">Выбери упражнение</option>`;
  const options = exercises
    .map((exercise) => `<option value="${exercise.id}">${escapeHtml(exercise.name)}</option>`)
    .join("");

  select.innerHTML = `${placeholder}${options}`;
  select.value = selectedId && exercises.some((item) => item.id === selectedId) ? selectedId : "";
}

function refreshWorkoutExerciseCards() {
  const cards = [...workoutExercisesList.querySelectorAll(".exercise-card")];

  cards.forEach((card, index) => {
    card.querySelector(".exercise-index-label").textContent = `Упражнение ${index + 1}`;
    const select = card.querySelector(".workout-exercise-id");
    const selectedExercise = getExerciseById(select.value);
    card.querySelector(".exercise-card-title").textContent = selectedExercise?.name || "Новый блок";
    renderExercisePicker(select, select.value);
  });

  const currentType = workoutTypeInput.value;
  const availableExercises = getExercises().filter((exercise) => exercise.type === currentType);
  exercisePickerHint.hidden = availableExercises.length > 0;
  exercisePickerHint.textContent = availableExercises.length
    ? ""
    : `Для ${workoutTypeLabel(currentType).toLowerCase()} тренировки пока нет упражнений. Сначала добавь их в раздел "Упражнения".`;
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

function buildWorkoutDraft() {
  return {
    id: workoutIdInput.value,
    title: workoutTitleInput.value.trim(),
    type: workoutTypeInput.value,
    startTime: workoutStartTimeInput.value,
    endTime: workoutEndTimeInput.value,
    exercises: collectWorkoutExercises(),
    updatedAt: new Date().toISOString(),
  };
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
    saveObject(storageKeys.workoutDraft, draft);
  } else {
    clearObject(storageKeys.workoutDraft);
  }
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
  const start = new Date(now.getTime() - 60 * 60 * 1000);
  workoutStartTimeInput.value = toLocalInputValue(start);
  workoutEndTimeInput.value = toLocalInputValue(now);
}

function resetWorkoutForm({ preserveDraft = false, preserveStatus = false } = {}) {
  workoutForm.reset();
  workoutIdInput.value = "";
  workoutFormTitle.textContent = "Тренировка";
  workoutExercisesList.innerHTML = "";
  createWorkoutExerciseCard();
  workoutTypeInput.value = "strength";
  workoutTitleInput.value = "";
  applyDefaultWorkoutTimes();
  refreshWorkoutExerciseCards();

  if (!preserveDraft) {
    clearObject(storageKeys.workoutDraft);
  }

  if (!preserveStatus) {
    setDraftStatus(workoutDraftStatus, "");
  }
}

function fillWorkoutForm(workout, { editing = false } = {}) {
  workoutIdInput.value = workout.id ?? "";
  workoutTitleInput.value = workout.title ?? "";
  workoutTypeInput.value = workout.type ?? "strength";
  workoutStartTimeInput.value = workout.startTime ?? "";
  workoutEndTimeInput.value = workout.endTime ?? "";
  workoutFormTitle.textContent = editing ? "Редактирование тренировки" : "Тренировка";
  workoutExercisesList.innerHTML = "";

  if (workout.exercises?.length) {
    workout.exercises.forEach((exercise) => createWorkoutExerciseCard(exercise));
  } else {
    createWorkoutExerciseCard();
  }

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
  const title = workout.title?.trim();
  if (title) {
    return title;
  }

  return `${workoutTypeLabel(workout.type)} · ${formatDateOnly(workout.startTime)}`;
}

function renderWorkoutHistory() {
  const workouts = getWorkouts().sort((left, right) => new Date(right.startTime) - new Date(left.startTime));
  workoutHistoryList.innerHTML = "";
  workoutHistoryCount.textContent = `${workouts.length} ${pluralize(workouts.length, "запись", "записи", "записей")}`;
  workoutEmptyState.hidden = workouts.length > 0;

  workouts.forEach((workout) => {
    const card = document.createElement("article");
    card.className = "history-card";

    const summary = workout.exercises.length
      ? workout.exercises.map((entry) => {
          const exercise = getExerciseById(entry.exerciseId);
          return exercise?.name || "Удаленное упражнение";
        }).join(", ")
      : "Без упражнений";

    card.innerHTML = `
      <div class="history-row">
        <div>
          <span class="pill">${workoutTypeLabel(workout.type)}</span>
          <h4 class="history-title">${escapeHtml(workoutListTitle(workout))}</h4>
        </div>
      </div>
      <p class="history-meta">${formatDate(workout.startTime)}</p>
      <p class="history-summary">${escapeHtml(summary)}</p>
      <div class="history-card-actions">
        <button class="secondary-button edit-workout-button" type="button">Редактировать</button>
        <button class="ghost-button delete-workout-button" type="button">Удалить</button>
      </div>
    `;

    card.querySelector(".edit-workout-button").addEventListener("click", () => {
      fillWorkoutForm({
        ...workout,
        startTime: toLocalInputValue(new Date(workout.startTime)),
        endTime: toLocalInputValue(new Date(workout.endTime)),
      }, { editing: true });
      setDraftStatus(workoutDraftStatus, "");
      persistWorkoutDraft();
      switchView("workouts");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    card.querySelector(".delete-workout-button").addEventListener("click", () => {
      const nextWorkouts = getWorkouts().filter((item) => item.id !== workout.id);
      setWorkouts(nextWorkouts);
      renderWorkoutHistory();
      if (workoutIdInput.value === workout.id) {
        resetWorkoutForm();
      }
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
    saveObject(storageKeys.exerciseDraft, draft);
  } else {
    clearObject(storageKeys.exerciseDraft);
  }
}

function resetExerciseForm({ preserveDraft = false, preserveStatus = false } = {}) {
  exerciseForm.reset();
  exerciseIdInput.value = "";
  exerciseFormTitle.textContent = "Упражнение";
  exerciseTypeInput.value = "strength";

  if (!preserveDraft) {
    clearObject(storageKeys.exerciseDraft);
  }

  if (!preserveStatus) {
    setDraftStatus(exerciseDraftStatus, "");
  }
}

function fillExerciseForm(exercise) {
  exerciseIdInput.value = exercise.id ?? "";
  exerciseNameInput.value = exercise.name ?? "";
  exerciseTypeInput.value = exercise.type ?? "strength";
  exerciseDescriptionInput.value = exercise.description ?? "";
  exerciseFormTitle.textContent = exercise.id ? "Редактирование упражнения" : "Упражнение";
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
  const exercises = getExercises().sort((left, right) => left.name.localeCompare(right.name, "ru"));
  exerciseHistoryList.innerHTML = "";
  exerciseHistoryCount.textContent = `${exercises.length} ${pluralize(exercises.length, "запись", "записи", "записей")}`;
  exerciseEmptyState.hidden = exercises.length > 0;

  exercises.forEach((exercise) => {
    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-row">
        <div>
          <span class="pill">${exerciseTypeLabel(exercise.type)}</span>
          <h4 class="history-title">${escapeHtml(exercise.name)}</h4>
        </div>
      </div>
      <p class="history-summary">${escapeHtml(exercise.description || "Без описания")}</p>
      <div class="history-card-actions">
        <button class="secondary-button edit-exercise-button" type="button">Редактировать</button>
        <button class="ghost-button delete-exercise-button" type="button">Удалить</button>
      </div>
    `;

    card.querySelector(".edit-exercise-button").addEventListener("click", () => {
      fillExerciseForm(exercise);
      setDraftStatus(exerciseDraftStatus, "");
      persistExerciseDraft();
      switchView("exercises");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    card.querySelector(".delete-exercise-button").addEventListener("click", () => {
      const nextExercises = getExercises().filter((item) => item.id !== exercise.id);
      setExercises(nextExercises);
      renderExerciseHistory();
      refreshWorkoutExerciseCards();

      const workouts = getWorkouts().map((workout) => ({
        ...workout,
        exercises: workout.exercises.filter((entry) => entry.exerciseId !== exercise.id),
      }));
      setWorkouts(workouts);
      renderWorkoutHistory();

      if (exerciseIdInput.value === exercise.id) {
        resetExerciseForm();
      }
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
    draft.id ||
    draft.title ||
    draft.date ||
    draft.weight ||
    draft.bodyFat ||
    draft.chest ||
    draft.waist ||
    draft.belly ||
    draft.hips ||
    draft.arm ||
    draft.leg ||
    draft.note
  );

  if (hasMeaning) {
    saveObject(storageKeys.measurementDraft, draft);
  } else {
    clearObject(storageKeys.measurementDraft);
  }
}

function resetMeasurementForm({ preserveDraft = false, preserveStatus = false } = {}) {
  measurementForm.reset();
  measurementIdInput.value = "";
  measurementFormTitle.textContent = "Замер";
  measurementDateInput.value = new Date().toISOString().slice(0, 10);

  if (!preserveDraft) {
    clearObject(storageKeys.measurementDraft);
  }

  if (!preserveStatus) {
    setDraftStatus(measurementDraftStatus, "");
  }
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
  measurementFormTitle.textContent = item.id ? "Редактирование замера" : "Замер";
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
  const items = getMeasurements().sort((left, right) => new Date(right.date) - new Date(left.date));
  measurementHistoryList.innerHTML = "";
  measurementHistoryCount.textContent = `${items.length} ${pluralize(items.length, "запись", "записи", "записей")}`;
  measurementEmptyState.hidden = items.length > 0;

  items.forEach((item) => {
    const details = [
      item.weight ? `Вес: ${item.weight} кг` : null,
      item.bodyFat ? `Жир: ${item.bodyFat}%` : null,
      item.waist ? `Талия: ${item.waist}` : null,
    ].filter(Boolean).join(" · ") || "Без дополнительных полей";

    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-row">
        <div>
          <span class="pill">Замер</span>
          <h4 class="history-title">${escapeHtml(measurementListTitle(item))}</h4>
        </div>
      </div>
      <p class="history-meta">${formatDateOnly(item.date)}</p>
      <p class="history-summary">${escapeHtml(details)}</p>
      <div class="history-card-actions">
        <button class="secondary-button edit-measurement-button" type="button">Редактировать</button>
        <button class="ghost-button delete-measurement-button" type="button">Удалить</button>
      </div>
    `;

    card.querySelector(".edit-measurement-button").addEventListener("click", () => {
      fillMeasurementForm(item);
      setDraftStatus(measurementDraftStatus, "");
      persistMeasurementDraft();
      switchView("measurements");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    card.querySelector(".delete-measurement-button").addEventListener("click", () => {
      const nextItems = getMeasurements().filter((entry) => entry.id !== item.id);
      setMeasurements(nextItems);
      renderMeasurementHistory();
      if (measurementIdInput.value === item.id) {
        resetMeasurementForm();
      }
    });

    measurementHistoryList.append(card);
  });
}

function switchView(viewName) {
  Object.entries(views).forEach(([key, element]) => {
    element.classList.toggle("is-active", key === viewName);
  });

  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewName);
  });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => switchView(item.dataset.view));
});

workoutTypeInput.addEventListener("change", () => {
  refreshWorkoutExerciseCards();
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

openWorkoutFormButton.addEventListener("click", () => {
  switchView("workouts");
  workoutTitleInput.focus();
});

resetWorkoutButton.addEventListener("click", () => resetWorkoutForm());
resetExerciseButton.addEventListener("click", () => resetExerciseForm());
resetMeasurementButton.addEventListener("click", () => resetMeasurementForm());
addWorkoutExerciseButton.addEventListener("click", () => createWorkoutExerciseCard());

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const entries = collectWorkoutExercises().filter((entry) => entry.exerciseId);

  if (!entries.length) {
    alert("Добавь хотя бы одно упражнение в тренировку.");
    return;
  }

  const invalidEntry = entries.find((entry) => {
    const exercise = getExerciseById(entry.exerciseId);
    return !exercise || exercise.type !== workoutTypeInput.value;
  });

  if (invalidEntry) {
    alert("В тренировке есть упражнение неподходящего типа. Проверь выбранные упражнения.");
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
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    exercises: entries.map((entry) => ({
      exerciseId: entry.exerciseId,
      sets: entry.sets === "" ? null : Number(entry.sets),
      weight: entry.weight === "" ? null : Number(entry.weight),
      reps: entry.reps === "" ? null : Number(entry.reps),
      note: entry.note,
    })),
  };

  const workouts = getWorkouts();
  const existingIndex = workouts.findIndex((item) => item.id === workout.id);
  if (existingIndex >= 0) {
    workouts[existingIndex] = workout;
  } else {
    workouts.push(workout);
  }

  setWorkouts(workouts);
  clearObject(storageKeys.workoutDraft);
  resetWorkoutForm();
  renderWorkoutHistory();
});

exerciseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const exercise = {
    id: exerciseIdInput.value || uid(),
    name: exerciseNameInput.value.trim(),
    type: exerciseTypeInput.value,
    description: exerciseDescriptionInput.value.trim(),
  };

  const exercises = getExercises();
  const existingIndex = exercises.findIndex((item) => item.id === exercise.id);
  if (existingIndex >= 0) {
    exercises[existingIndex] = exercise;
  } else {
    exercises.push(exercise);
  }

  setExercises(exercises);
  clearObject(storageKeys.exerciseDraft);
  resetExerciseForm();
  renderExerciseHistory();
  refreshWorkoutExerciseCards();
});

measurementForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!measurementDateInput.value) {
    alert("Укажи дату замера.");
    return;
  }

  const measurement = {
    id: measurementIdInput.value || uid(),
    title: measurementTitleInput.value.trim(),
    date: measurementDateInput.value,
    weight: measurementWeightInput.value.trim(),
    bodyFat: measurementBodyFatInput.value.trim(),
    chest: measurementChestInput.value.trim(),
    waist: measurementWaistInput.value.trim(),
    belly: measurementBellyInput.value.trim(),
    hips: measurementHipsInput.value.trim(),
    arm: measurementArmInput.value.trim(),
    leg: measurementLegInput.value.trim(),
    note: measurementNoteInput.value.trim(),
  };

  const measurements = getMeasurements();
  const existingIndex = measurements.findIndex((item) => item.id === measurement.id);
  if (existingIndex >= 0) {
    measurements[existingIndex] = measurement;
  } else {
    measurements.push(measurement);
  }

  setMeasurements(measurements);
  clearObject(storageKeys.measurementDraft);
  resetMeasurementForm();
  renderMeasurementHistory();
});

restoreWorkoutDraft();
restoreExerciseDraft();
restoreMeasurementDraft();
renderExerciseHistory();
renderWorkoutHistory();
renderMeasurementHistory();
refreshWorkoutExerciseCards();
switchView("workouts");
