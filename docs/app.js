const storageKey = "training-journal-workouts-v1";
const draftStorageKey = "training-journal-draft-v1";

const form = document.querySelector("#workout-form");
const formTitle = document.querySelector("#form-title");
const workoutIdInput = document.querySelector("#workout-id");
const workoutTypeInput = document.querySelector("#workout-type");
const startTimeInput = document.querySelector("#start-time");
const endTimeInput = document.querySelector("#end-time");
const workoutNoteInput = document.querySelector("#workout-note");
const exercisesList = document.querySelector("#exercises-list");
const exerciseTemplate = document.querySelector("#exercise-template");
const historyList = document.querySelector("#history-list");
const emptyState = document.querySelector("#empty-state");
const historyCount = document.querySelector("#history-count");
const addExerciseButton = document.querySelector("#add-exercise-button");
const resetButton = document.querySelector("#reset-button");
const startWorkoutButton = document.querySelector("#start-workout-button");
const draftStatus = document.querySelector("#draft-status");

function loadWorkouts() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts) {
  localStorage.setItem(storageKey, JSON.stringify(workouts));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(draftStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft) {
  localStorage.setItem(draftStorageKey, JSON.stringify(draft));
}

function clearDraft() {
  localStorage.removeItem(draftStorageKey);
}

function setDraftStatus(message = "") {
  if (!message) {
    draftStatus.hidden = true;
    draftStatus.textContent = "";
    return;
  }

  draftStatus.hidden = false;
  draftStatus.textContent = message;
}

function uid() {
  if (window.crypto && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `workout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function workoutTypeLabel(type) {
  return type === "cardio" ? "Кардио" : "Силовая";
}

function toLocalInputValue(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function refreshExerciseTitles() {
  [...exercisesList.querySelectorAll(".exercise-card")].forEach((card, index) => {
    card.querySelector(".exercise-index-label").textContent = `Упражнение ${index + 1}`;

    const name = card.querySelector(".exercise-name").value.trim();
    card.querySelector(".exercise-card-title").textContent = name || "Новый блок";
  });
}

function createExerciseCard(exercise = {}) {
  const fragment = exerciseTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".exercise-card");
  const nameInput = card.querySelector(".exercise-name");
  const setsInput = card.querySelector(".exercise-sets");
  const weightInput = card.querySelector(".exercise-weight");
  const repsInput = card.querySelector(".exercise-reps");

  nameInput.value = exercise.name ?? "";
  setsInput.value = exercise.sets ?? "";
  weightInput.value = exercise.weight ?? "";
  repsInput.value = exercise.reps ?? "";

  card.querySelector(".remove-exercise-button").addEventListener("click", () => {
    card.remove();

    if (!exercisesList.children.length) {
      addExerciseCard();
    } else {
      refreshExerciseTitles();
    }

    persistDraft();
  });

  [nameInput, setsInput, weightInput, repsInput].forEach((input) => {
    input.addEventListener("input", () => {
      refreshExerciseTitles();
      persistDraft();
    });
  });

  exercisesList.append(card);
  refreshExerciseTitles();
}

function addExerciseCard(exercise = {}) {
  createExerciseCard(exercise);
  persistDraft();
}

function getExerciseValues() {
  return [...exercisesList.querySelectorAll(".exercise-card")]
    .map((card) => ({
      name: card.querySelector(".exercise-name").value.trim(),
      sets: card.querySelector(".exercise-sets").value === ""
        ? null
        : Number(card.querySelector(".exercise-sets").value),
      weight: card.querySelector(".exercise-weight").value === ""
        ? null
        : Number(card.querySelector(".exercise-weight").value),
      reps: card.querySelector(".exercise-reps").value === ""
        ? null
        : Number(card.querySelector(".exercise-reps").value),
    }))
    .filter((exercise) => exercise.name || exercise.sets !== null || exercise.weight !== null || exercise.reps !== null);
}

function buildDraftFromForm() {
  return {
    id: workoutIdInput.value || "",
    type: workoutTypeInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value,
    note: workoutNoteInput.value.trim(),
    exercises: getExerciseValues(),
    updatedAt: new Date().toISOString(),
  };
}

function isDraftMeaningful(draft) {
  return Boolean(
    draft.id ||
    draft.note ||
    draft.type !== "strength" ||
    draft.exercises.length ||
    draft.startTime !== "" ||
    draft.endTime !== ""
  );
}

function persistDraft() {
  const draft = buildDraftFromForm();

  if (isDraftMeaningful(draft)) {
    saveDraft(draft);
  } else {
    clearDraft();
  }
}

function applyDefaultTimes() {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000);
  startTimeInput.value = toLocalInputValue(start);
  endTimeInput.value = toLocalInputValue(now);
}

function resetForm({ preserveStatus = false } = {}) {
  form.reset();
  workoutIdInput.value = "";
  formTitle.textContent = "Тренировка";
  exercisesList.innerHTML = "";
  createExerciseCard();
  applyDefaultTimes();
  clearDraft();

  if (!preserveStatus) {
    setDraftStatus("");
  }
}

function fillForm(workout) {
  workoutIdInput.value = workout.id ?? "";
  workoutTypeInput.value = workout.type ?? "strength";
  startTimeInput.value = workout.startTime ?? "";
  endTimeInput.value = workout.endTime ?? "";
  workoutNoteInput.value = workout.note ?? "";
  formTitle.textContent = workout.id ? "Редактирование" : "Тренировка";

  exercisesList.innerHTML = "";

  if (workout.exercises?.length) {
    workout.exercises.forEach((exercise) => createExerciseCard(exercise));
  } else {
    createExerciseCard();
  }

  refreshExerciseTitles();
}

function restoreDraft() {
  const draft = loadDraft();
  if (!draft) {
    resetForm({ preserveStatus: true });
    return;
  }

  fillForm(draft);
  setDraftStatus(`Черновик восстановлен автоматически: ${formatDate(draft.updatedAt)}`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pluralize(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "запись";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "записи";
  }

  return "записей";
}

function pluralExercise(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "упражнение";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "упражнения";
  }

  return "упражнений";
}

function buildWorkoutTitle(workout) {
  const exerciseCount = workout.exercises.length;
  return `${workoutTypeLabel(workout.type)} · ${exerciseCount} ${pluralExercise(exerciseCount)}`;
}

function renderHistory() {
  const workouts = loadWorkouts()
    .sort((left, right) => new Date(right.startTime) - new Date(left.startTime));

  historyList.innerHTML = "";
  historyCount.textContent = `${workouts.length} ${pluralize(workouts.length)}`;
  emptyState.hidden = workouts.length > 0;

  workouts.forEach((workout) => {
    const card = document.createElement("article");
    card.className = "history-card";

    const exerciseSummary = workout.exercises.length
      ? workout.exercises.map((exercise) => {
          const pieces = [escapeHtml(exercise.name), `${exercise.sets ?? "-"} п.`];

          if (exercise.weight !== null) {
            pieces.push(`${exercise.weight} кг`);
          }

          if (exercise.reps !== null) {
            pieces.push(`${exercise.reps} повт.`);
          }

          return pieces.join(" · ");
        }).join(", ")
      : "Без упражнений";

    card.innerHTML = `
      <div class="history-row">
        <div class="history-main">
          <span class="pill">${workoutTypeLabel(workout.type)}</span>
          <h3 class="history-title">${buildWorkoutTitle(workout)}</h3>
        </div>
        <span class="history-time">${formatDate(workout.startTime)}</span>
      </div>
      <p class="history-meta">С ${formatDate(workout.startTime)} до ${formatDate(workout.endTime)}</p>
      <p class="exercise-summary">${exerciseSummary}</p>
      ${workout.note ? `<p class="history-note">${escapeHtml(workout.note)}</p>` : ""}
      <div class="history-card-actions">
        <button class="secondary-button edit-button" type="button">Редактировать</button>
        <button class="ghost-button delete-button" type="button">Удалить</button>
      </div>
    `;

    card.querySelector(".edit-button").addEventListener("click", () => {
      clearDraft();
      fillForm({
        ...workout,
        startTime: toLocalInputValue(new Date(workout.startTime)),
        endTime: toLocalInputValue(new Date(workout.endTime)),
      });
      setDraftStatus("");
      persistDraft();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    card.querySelector(".delete-button").addEventListener("click", () => {
      const workoutsList = loadWorkouts().filter((item) => item.id !== workout.id);
      saveWorkouts(workoutsList);
      renderHistory();

      if (workoutIdInput.value === workout.id) {
        resetForm();
      }
    });

    historyList.append(card);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const exercises = getExerciseValues()
    .filter((exercise) => exercise.name)
    .map((exercise) => ({
      name: exercise.name,
      sets: exercise.sets ?? 0,
      weight: exercise.weight,
      reps: exercise.reps,
    }));

  const startTime = new Date(startTimeInput.value);
  const endTime = new Date(endTimeInput.value);

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
    type: workoutTypeInput.value,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    note: workoutNoteInput.value.trim(),
    exercises,
  };

  const workouts = loadWorkouts();
  const existingIndex = workouts.findIndex((item) => item.id === workout.id);

  if (existingIndex >= 0) {
    workouts[existingIndex] = workout;
  } else {
    workouts.push(workout);
  }

  saveWorkouts(workouts);
  clearDraft();
  resetForm();
  renderHistory();
});

[workoutTypeInput, startTimeInput, endTimeInput, workoutNoteInput].forEach((input) => {
  input.addEventListener("input", persistDraft);
  input.addEventListener("change", persistDraft);
});

addExerciseButton.addEventListener("click", () => addExerciseCard());
resetButton.addEventListener("click", () => resetForm());
startWorkoutButton.addEventListener("click", () => {
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  startTimeInput.focus();
});

restoreDraft();
renderHistory();
