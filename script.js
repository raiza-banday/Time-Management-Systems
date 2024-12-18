// Select elements from the DOM
const addTaskBtn = document.getElementById("addTaskBtn");
const viewTaskBtn = document.getElementById("viewTaskBtn");
const addTaskForm = document.getElementById("addTaskForm");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const searchInput = document.getElementById("taskSearchBar"); // Search input field
const searchBtn = document.getElementById("searchBtn"); // Search button
const taskList = document.getElementById("taskList");

// Calendar elements
const monYearElement = document.getElementById("monAndYear");
const datesElement = document.getElementById("dates");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");



// Load tasks and calendar on page load
window.onload = () => {
  displayTask();
  updateCalendar();
  // Mark the "View" button as active on page load
  viewTaskBtn.classList.add("active");
  addTaskForm.style.display = "none"; // Hide the add task form by default
  taskList.style.display = "block"; // Display task list by default
};

// Show Add Task form
addTaskBtn.addEventListener("click", () => {
  addTaskForm.style.display = "block";
  taskList.style.display = "none";
  addTaskForm.reset();
  delete addTaskForm.dataset.editIndex; // Clear edit state
  // Remove active class from View button
  viewTaskBtn.classList.remove("active");
});

// Cancel Add Task form
cancelTaskBtn.addEventListener("click", () => {
  addTaskForm.style.display = "none";
  addTaskForm.reset();
});

// Save a task
addTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = document.getElementById("taskName").value.trim();
  const taskDate = document.getElementById("taskDate").value;
  const taskCategory = document.getElementById("taskCategory").value.trim();

  if (!taskName || !taskDate || !taskCategory) {
    alert("All fields are required!");
    return;
  }

  const tasks = getTasks();
  if (addTaskForm.dataset.editIndex !== undefined) {
    // Update existing task
    const index = addTaskForm.dataset.editIndex;
    tasks[index] = { taskName, taskDate, taskCategory, done: tasks[index].done };
    delete addTaskForm.dataset.editIndex; // Clear the edit state
  } else {
    // Add new task
    tasks.push({ taskName, taskDate, taskCategory, done: false });
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  addTaskForm.reset();
  addTaskForm.style.display = "none";
  displayTask();
  taskList.style.display = "block"; // Ensure task list is shown after task is added
  viewTaskBtn.classList.add("active"); // Keep View button active
  addTaskBtn.classList.remove("active"); // Remove Add button active state
});

// View Task List
viewTaskBtn.addEventListener("click", () => {
  taskList.style.display = "block";
  addTaskForm.style.display = "none";
  displayTask();
  // Ensure View button remains active when clicked
  viewTaskBtn.classList.add("active");
  addTaskBtn.classList.remove("active");
});

// Retrieve tasks
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

// Display tasks
function displayTask() {
  const tasks = getTasks();
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks to display.</p>";
    return;
  }

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task ${task.done ? "done" : ""}`;
    taskDiv.innerHTML = `
      <p><strong>Task:</strong> ${task.taskName}</p>
      <p><strong>Date:</strong> ${task.taskDate}</p>
      <p><strong>Category:</strong> ${task.taskCategory}</p>
      <p><strong>Status:</strong> ${task.done ? "Completed" : "Pending"}</p>
      <button class="done-toggle" onclick="toggleTaskDone(${index})">
        ${task.done ? "Undo" : "Done"}
      </button>
      <button class="edit" onclick="editTask(${index})">Edit</button>
      <button class="delete" onclick="deleteTask(${index})">Delete</button>
    `;
    taskList.appendChild(taskDiv);
  });
}

// Edit a Task
function editTask(index) {
  const tasks = getTasks();
  const task = tasks[index];

  // Pre-fill the form with task details
  document.getElementById("taskName").value = task.taskName;
  document.getElementById("taskDate").value = task.taskDate;
  document.getElementById("taskCategory").value = task.taskCategory;

  // Show the form and hide the task list
  addTaskForm.style.display = "block";
  taskList.style.display = "none";

  // Temporarily store the index being edited
  addTaskForm.dataset.editIndex = index;
}

// Toggle task done/undone
function toggleTaskDone(index) {
  const tasks = getTasks();
  tasks[index].done = !tasks[index].done;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTask();
}

// Delete a task
function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTask();
}

// Calendar Logic
let currentDate = new Date();

const updateCalendar = () => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  monYearElement.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  let datesHTML = "";

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    datesHTML += `<div class="date inactive">${prevMonthDays - i}</div>`;
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = new Date(currentYear, currentMonth, i).toDateString() === new Date().toDateString();
    datesHTML += `<div class="date ${isToday ? "active" : ""}">${i}</div>`;
  }

  datesElement.innerHTML = datesHTML;
};

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

updateCalendar();

// Initialize an array to hold timers
let timers = []; // Each element in this array holds the timer data for each task

// Start/Stop Timer
function startStopTimer(index) {
  const taskDiv = document.getElementsByClassName('task')[index];
  const timerDisplay = document.getElementById(`timer-${index}`);
  const startStopButton = document.getElementById(`startStopBtn-${index}`);

  // Toggle the timer state between running and stopped
  if (timers[index] && timers[index].isRunning) {
    // Stop the timer
    clearInterval(timers[index].intervalId);
    timers[index].isRunning = false;
    startStopButton.textContent = "Start";
  } else {
    // Start the timer
    timers[index] = timers[index] || { seconds: 0, isRunning: false }; // Initialize timer data if it's not already set
    timers[index].isRunning = true;
    startStopButton.textContent = "Stop";

    timers[index].intervalId = setInterval(() => {
      timers[index].seconds++;
      timerDisplay.textContent = formatTime(timers[index].seconds);
      updateTaskTime(index);
    }, 1000); // Update every second
  }
}

// Reset Timer
function resetTimer(index) {
  clearInterval(timers[index]?.intervalId); // Clear any existing interval
  timers[index] = { seconds: 0, isRunning: false }; // Reset timer data
  document.getElementById(`timer-${index}`).textContent = "00:00"; // Reset timer display
  document.getElementById(`startStopBtn-${index}`).textContent = "Start Timer"; // Reset button text
  updateTaskTime(index);
}

// Format time in mm:ss format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Update the task's time spent in localStorage
function updateTaskTime(index) {
  const tasks = getTasks();
  tasks[index].timeSpent = timers[index]?.seconds || 0; // Store the time in seconds
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display tasks with time spent and timer controls
function displayTask() {
  const tasks = getTasks();
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks to display.</p>";
    return;
  }

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task ${task.done ? "done" : ""}`;
    taskDiv.innerHTML = `
      <p><strong>Task:</strong> ${task.taskName}</p>
      <p><strong>Date:</strong> ${task.taskDate}</p>
      <p><strong>Category:</strong> ${task.taskCategory}</p>
      <p><strong>Status:</strong> ${task.done ? "Completed" : "Pending"}</p>
      <p><strong>Time Spent:</strong> <span id="timer-${index}" class="timer">${formatTime(task.timeSpent || 0)}</span></p>
      <button class="done-toggle" onclick="toggleTaskDone(${index})">
        ${task.done ? "Undo" : "Done"}
      </button>
      <button class="edit" onclick="editTask(${index})">Edit</button>
      <button class="delete" onclick="deleteTask(${index})">Delete</button>
      <button class="timer-btn" onclick="startStopTimer(${index})" id="startStopBtn-${index}">
        ${task.timeSpent > 0 ? "Stop" : "Start"}
      </button>
      <button class="reset-btn" onclick="resetTimer(${index})" id="resetBtn-${index}">Reset</button>
    `;
    taskList.appendChild(taskDiv);

    // Ensure that each task starts with a reset state (not automatically starting)
    timers[index] = timers[index] || { seconds: task.timeSpent || 0, isRunning: false }; // Initialize with stored time if exists
  });
}

// Toggle task done/undone
function toggleTaskDone(index) {
  const tasks = getTasks();
  tasks[index].done = !tasks[index].done;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTask();
}

// Delete a task
function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTask();
}

// Retrieve tasks
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

// View Task List
viewTaskBtn.addEventListener("click", () => {
  taskList.style.display = "block";
  addTaskForm.style.display = "none";
  displayTask();
  // Ensure View button remains active when clicked
  viewTaskBtn.classList.add("active");
  addTaskBtn.classList.remove("active");
});

// Add Task
addTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = document.getElementById("taskName").value.trim();
  const taskDate = document.getElementById("taskDate").value;
  const taskCategory = document.getElementById("taskCategory").value.trim();

  if (!taskName || !taskDate || !taskCategory) {
    alert("All fields are required!");
    return;
  }

  const tasks = getTasks();
  tasks.push({ taskName, taskDate, taskCategory, done: false, timeSpent: 0 }); // Set initial timeSpent as 0
  localStorage.setItem("tasks", JSON.stringify(tasks));

  addTaskForm.reset();
  addTaskForm.style.display = "none";
  displayTask();
  taskList.style.display = "block"; // Ensure task list is shown after task is added
  viewTaskBtn.classList.add("active"); // Keep View button active
  addTaskBtn.classList.remove("active"); // Remove Add button active state
});


// Get today's date in YYYY-MM-DD format to use for daily summary
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Show the daily summary for the selected date
function showDailySummary(dateString) {
    const date = new Date(dateString); // Convert to Date object
    const formattedDate = getFormattedDate(date);
    const tasks = getTasks();

    // Filter tasks by the selected date
    const dailyTasks = tasks.filter(task => task.taskDate === formattedDate && task.done);

    // Calculate total time spent on tasks for the day
    const totalTime = dailyTasks.reduce((total, task) => total + task.timeSpent, 0);

    // Update the UI with the daily summary data
    document.getElementById('selectedDate').textContent = formattedDate;
    document.getElementById('completedTasksCount').textContent = `Total Completed Tasks: ${dailyTasks.length}`;
    document.getElementById('totalTimeSpent').textContent = `Total Time Spent: ${formatTime(totalTime)}`;

    // Display the tasks in the daily summary
    const dailyTaskList = document.getElementById('dailyTaskList');
    dailyTaskList.innerHTML = ''; // Clear previous summary
    if (dailyTasks.length > 0) {
        dailyTasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.innerHTML = `
                <p><strong>Task:</strong> ${task.taskName}</p>
                <p><strong>Category:</strong> ${task.taskCategory}</p>
                <p><strong>Time Spent:</strong> ${formatTime(task.timeSpent)}</p>
            `;
            dailyTaskList.appendChild(taskDiv);
        });
    } else {
        dailyTaskList.innerHTML = '<p>No tasks completed on this day.</p>';
    }

    document.getElementById('dailySummaryContainer').style.display = 'block';
}

// Close the daily summary view
document.getElementById('closeSummaryBtn').addEventListener('click', () => {
    document.getElementById('dailySummaryContainer').style.display = 'none';
});

// Show the daily summary when the "Daily Summary" button is clicked
document.getElementById('dailySummaryBtn').addEventListener('click', () => {
    document.getElementById('dailySummaryContainer').style.display = 'block';
});

// Show summary when the "Show Summary" button is clicked after selecting a date
document.getElementById('showSummaryBtn').addEventListener('click', () => {
    const selectedDate = document.getElementById('datePicker').value;
    
    if (selectedDate) {
        const date = new Date(selectedDate);
        showDailySummary(date);
    } else {
        alert("Please select a date.");
    }
});

// Helper function to format time in mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Sample function to get tasks from localStorage (or your data source)
function getTasks() {
    // This is just an example. Replace with your actual task fetching logic.
    return JSON.parse(localStorage.getItem('tasks')) || [];
}



// Mark a task as done (you can call this when a user finishes a task)
function markTaskAsDone(index) {
  const tasks = getTasks();
  tasks[index].done = true;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTask();
}

