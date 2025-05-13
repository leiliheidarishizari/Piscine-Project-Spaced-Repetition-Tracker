

import { getData, addData, getUserIds, clearData } from "./storage.js";

window.onload = function () {
  populateUserDropdown();
  defaultDatePicker()
  // Add event listener for user selection
  const userSelect = document.getElementById("user-select");
  userSelect.addEventListener("change", handleUserSelection);

  // Add event listener for topic submission
  document
    .getElementById("add-topic-form")
    .addEventListener("submit", handleTopicSubmission);
  
    document.getElementById("delete-agenda").addEventListener("click", function() {
      const userSelect = document.getElementById("user-select"); 
      const userId = userSelect.value; 
      if (!userId) {
          alert("Please select a user first!");
          return;
      }
      handleDeleteAgenda(userId);
  });
};

function defaultDatePicker() {
  let dateInput = document.getElementById('start-date');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

// Populates the user dropdown with IDs fetched from storage.js
function populateUserDropdown() {
  const userSelect = document.getElementById("user-select");
  const users = getUserIds();

  // Create a default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "--Select a user--";
  userSelect.appendChild(defaultOption);

  // Populate dropdown with user options
  users.forEach((userId) => {
    const option = document.createElement("option");
    option.value = userId;
    option.textContent = `User ${userId}`;
    userSelect.appendChild(option);
  });
}

// Handles user selection and displays the user's stored agenda
function handleUserSelection(event) {
  const selectedUserId = event.target.value; 
  const agendaDiv = document.getElementById("agenda");

  // Clear any previous content
  agendaDiv.innerHTML = "";

  // If a user is selected, show the static message
  if (selectedUserId) {
    displayAgenda(selectedUserId);
  }
  else {
    document.getElementById('agenda').innerHTML = 'Please select a user.';
  }
}

// Function to handle topic submission, calculate revision dates, and store them in localStorage
function handleTopicSubmission(event) {
  event.preventDefault();

  const userId = document.getElementById("user-select").value;
  const topicName = document.getElementById("topic-name").value;
  const startDate = document.getElementById("start-date").value;

  // Ensure a user is selected
  if (!userId) {
    alert("Please select a user before adding a topic.");
    return;
  }

  // Create new topic object
  const newTopic = { topic: topicName, date: startDate };
  const newTopics = calculateFutureDates(newTopic)

  // Save data to localStorage
  addData(userId, newTopics);

  // Clear input fields
  document.getElementById("topic-name").value = "";
  defaultDatePicker()

  // Refresh the agenda display
  displayAgenda(userId);
}

// calculate date one week, one month, three months, six months and one year from the selected date
function calculateFutureDates(newTopic) {
  const startDate = new Date(newTopic.date);

  // Create new Date objects for each calculation to avoid modifying the original date
  const nextWeekObj = { 
    topic: newTopic.topic, 
    date: new Date(new Date(startDate).setDate(startDate.getDate() + 7))  // Add 7 days

  };

  const nextMonthObj = { 
    topic: newTopic.topic, 
    date: new Date(new Date(startDate).setMonth(startDate.getMonth() + 1)) // Add 1 month
  };

  const next3MonthObj = { 
    topic: newTopic.topic, 
    date: new Date(new Date(startDate).setMonth(startDate.getMonth() + 3)) // Add 3 months
  };

  const next6MonthObj = { 
    topic: newTopic.topic, 
    date: new Date(new Date(startDate).setMonth(startDate.getMonth() + 6)) // Add 6 months
  };

  const nextYearObj = { 
    topic: newTopic.topic, 
    date: new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1)) // Add 1 year
  };

  // Return an array of all the dates
  return [nextWeekObj, nextMonthObj, next3MonthObj, next6MonthObj, nextYearObj];
}

// Function to format date 
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();
  
  // Add ordinal suffix to the day
  const suffix = (day === 1 || day === 21 || day === 31) ? "st" : 
                 (day === 2 || day === 22) ? "nd" : 
                 (day === 3 || day === 23) ? "rd" : "th";

  return `${day}${suffix} ${month} ${year}`;
}

// Function to display the agenda for a selected user in a table
function displayAgenda(userId){
  const agendaContainer = document.getElementById("agenda") 
  agendaContainer.textContent = "";

  // Get the user's data from storage
  const agenda = getData(userId)

   // If there is no agenda for the user, display a message
   if (!agenda || agenda.length === 0) {
     document.getElementById('agenda').textContent = 'No agenda available for this user.';
     return;
   }

   // Filter out topics with revision dates in the past
   const today = new Date();
   today.setHours(0, 0, 0, 0)
   const futureAgenda = agenda.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0); 
    return itemDate >= today;
  });

   // Sort the agenda by revision date in chronological order
   futureAgenda.sort((a, b) => new Date(a.date) - new Date(b.date));

     // Generate the table content
   let agendaHtml = `
       <table border="1">
         <thead>
           <tr>
             <th>Topic</th>
             <th>Revision Date</th>
             <th>Actions</th>
           </tr>
         </thead>
         <tbody>
     `;

     // Add each agenda item to the table body with formatted date
     futureAgenda.forEach((item, index) => {
       const topic = item.topic;
       const formattedDate = formatDate(item.date);
       agendaHtml += `
         <tr>
           <td>${topic}</td>
           <td>${formattedDate}</td>
           <td><button class="delete-btn" data-index="${index}">Delete</button></td>
         </tr>
       `;
     });
 
   agendaHtml += '</tbody></table>';
 
   // Insert the generated table into the agenda container
   agendaContainer.innerHTML = agendaHtml;

   

    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const index = button.getAttribute('data-index');
      deleteTopic(userId, index);
    });
  });
 }


  // Function to delete a agenda
 function handleDeleteAgenda(userId){
    clearData(userId)
    displayAgenda(userId)
    alert('Agenda deleted successfully!');
 }

  // Function to delete a topic
function deleteTopic(userId, index) {
  const agenda = getData(userId);
  
  if (agenda && agenda.length > 0) {
    agenda.splice(index, 1);
    clearData(userId); 
    addData(userId, agenda);
    displayAgenda(userId);
    alert('Topic deleted successfully!');
  }
}

export { calculateFutureDates, formatDate, deleteTopic, handleUserSelection };