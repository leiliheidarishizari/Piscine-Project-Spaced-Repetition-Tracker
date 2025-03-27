import { getData, addData } from "./storage.js";

window.onload = function () {
  const userSelect = document.getElementById('user-select');
  const agendaDiv = document.getElementById('agenda');
  const topicForm = document.getElementById('topic-form');

  // Handle user selection
  userSelect.addEventListener('change', () => {
    const userId = userSelect.value;
    if (userId) {
      loadAgenda(userId);
    } else {
      agendaDiv.innerHTML = "<p>No agenda for this user.</p>";
    }
  });

  // Handle form submission
  topicForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const userId = userSelect.value;
    if (userId) {
      const topicName = document.getElementById('topic-name').value;
      const revisionDate = new Date(document.getElementById('revision-date').value);

      if (topicName && revisionDate) {
        const newTopic = calculateRevisionDates(topicName, revisionDate);
        addData(userId, newTopic);
        loadAgenda(userId); // Reload the agenda after adding a topic
        topicForm.reset();
      }
    }
  });

  // Load the agenda for the selected user
  function loadAgenda(userId) {
    const data = getData(userId);
    if (data && data.length > 0) {
      agendaDiv.innerHTML = "<h2>Agenda:</h2>";
      data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `<p>${item.topic} - ${item.date}</p>`;
        agendaDiv.appendChild(itemDiv);
      });
    } else {
      agendaDiv.innerHTML = "<p>No agenda for this user.</p>";
    }
  }

  // Calculate revision dates (1 week, 1 month, 3 months, 6 months, 1 year)
  function calculateRevisionDates(topicName, initialDate) {
    const dates = [];
    const increments = [7, 30, 90, 180, 365];
    increments.forEach(increment => {
      const newDate = new Date(initialDate);
      newDate.setDate(newDate.getDate() + increment);
      dates.push({
        topic: topicName,
        date: newDate.toDateString(),
      });
    });
    return dates;
  }
};
