import { getData, addData, getUserIds } from "./storage.js";

window.onload = function () {
  populateUserDropdown();
  defaultDatePicker();

  const userSelect = document.getElementById("user-select");
  userSelect.addEventListener("change", handleUserSelection);

  document
    .getElementById("add-topic-form")
    .addEventListener("submit", handleTopicSubmission);
};

function defaultDatePicker() {
  let dateInput = document.getElementById('start-date');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

function populateUserDropdown() {
  const userSelect = document.getElementById("user-select");
  const users = getUserIds();

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "--Select a user--";
  userSelect.appendChild(defaultOption);

  users.forEach((userId) => {
    const option = document.createElement("option");
    option.value = userId;
    option.textContent = `User ${userId}`;
    userSelect.appendChild(option);
  });
}

function handleUserSelection(event) {
  const selectedUserId = event.target.value; 
  const agendaDiv = document.getElementById("agenda");

  agendaDiv.innerHTML = "";

  if (selectedUserId) {
    displayAgenda(selectedUserId);
  } else {
    agendaDiv.innerHTML = 'Please select a user.';
  }
}

function handleTopicSubmission(event) {
  event.preventDefault();

  const userId = document.getElementById("user-select").value;
  const topicName = document.getElementById("topic-name").value;
  const startDate = document.getElementById("start-date").value;

  if (!userId) {
    alert("Please select a user before adding a topic.");
    return;
  }

  const newTopic = { topic: topicName, date: startDate };
  const newTopics = calculateFutureDates(newTopic);

  addData(userId, newTopics);

  document.getElementById("topic-name").value = "";
  defaultDatePicker();

  displayAgenda(userId);
}

function calculateFutureDates(newTopic) {
  const startDate = new Date(newTopic.date);

  const nextWeekObj = { topic: newTopic.topic, date: new Date(new Date(startDate).setDate(startDate.getDate() + 7)) };
  const nextMonthObj = { topic: newTopic.topic, date: new Date(new Date(startDate).setMonth(startDate.getMonth() + 1)) };
  const next3MonthObj = { topic: newTopic.topic, date: new Date(new Date(startDate).setMonth(startDate.getMonth() + 3)) };
  const next6MonthObj = { topic: newTopic.topic, date: new Date(new Date(startDate).setMonth(startDate.getMonth() + 6)) };
  const nextYearObj = { topic: newTopic.topic, date: new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1)) };

  return [nextWeekObj, nextMonthObj, next3MonthObj, next6MonthObj, nextYearObj];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  const suffix = (day === 1 || day === 21 || day === 31) ? "st" : 
                 (day === 2 || day === 22) ? "nd" : 
                 (day === 3 || day === 23) ? "rd" : "th";

  return `${day}${suffix} ${month} ${year}`;
}

function displayAgenda(userId) {
  const agendaContainer = document.getElementById("agenda");
  agendaContainer.textContent = "";

  const agenda = getData(userId);

  if (!agenda || agenda.length === 0) {
    agendaContainer.textContent = 'No agenda available for this user.';
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureAgenda = agenda.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= today;
  });

  futureAgenda.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Display agenda as simple paragraphs
  futureAgenda.forEach(item => {
    const p = document.createElement("p");
    p.textContent = `${item.topic}: ${formatDate(item.date)}`;
    agendaContainer.appendChild(p);
  });
}

export { calculateFutureDates, formatDate, handleUserSelection };
