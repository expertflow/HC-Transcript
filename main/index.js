const api_url = history_api_url;
var messages = [];
// pagination varibles

var options = [10, 15, 20, 25, 50, 100]; // page size option
var totalPages;
var currentPage = 1;
var pageSize = options[0];
var searchQuery;
const searchInput = document.getElementById("searchInput");
const submitButton = document.getElementById("searchButton");

searchInput.addEventListener("input", () => {
  submitButton.classList.toggle("disabled", !searchInput.value);
});
document.getElementById("searchButton").addEventListener("click", () => {
  const searchquery = document.getElementById("searchInput").value;
  if (searchquery) {
    searchQuery = searchquery;
    currentPage = 1; // reset to the first page for search results
    pageSize = 10;

    // reset ui before fetching
    document.getElementById("msg").innerHTML = "";
    document.querySelector(".paginationArea").innerHTML = "";
    fetchMessages(currentPage, pageSize, searchQuery);
  }
});

function fetchMessages(page, pageSize, searchQuery) {
  console.log("----------------->", page, pageSize, searchQuery);
  showSpinner();
  const request = new XMLHttpRequest();
  let url = `${api_url}/getMessagesByRefId?refId=${searchQuery}&page=${page}&pageSize=${pageSize}`;
  request.open("GET", url);
  request.send();
  request.onload = () => {
    if (request.status === 200) {
      result = JSON.parse(request.response);
      messages = result.messages;
      if (messages) {
        console.log("messages are ", messages);
        console.log("Total Message: ", result.metaData.totalMessages);
        options = getPaginationOptions(+result.metaData.totalMessages);
        hideSpinner();
        totalPages = calculateTotalPages(
          result.metaData.totalMessages,
          pageSize
        );
        if (result.metaData.totalMessages > 10) {
          showPagination();
        }
        messageFunction();
      } else {
        document.getElementById("chatDate").innerHTML = "No Record Found";
        hideSpinner();
      }
    } else {
      console.log(`error ${request.status} ${request.statusText}`);
      hideSpinner();
    }
  };
}

//Function for Chat Messages Of BOT , AGENT and CUSTOMER
function messageFunction() {
  let chatDiv = `<div>`;

  for (const msg in messages) {
    const message = messages[msg];
    let date = message.timestamp.slice(0, 10).replace(/-/g, "/");
    let dateTime = new Date(message.timestamp); //Convert UTC without GMT dateTime to Locale with GMT
    let min =
      `${dateTime.getMinutes()}` <= 9
        ? `0${dateTime.getMinutes()}`
        : `${dateTime.getMinutes()}`;
    let time = timeConvert(`${dateTime.getHours()}:${min}`);

    document.getElementById("chatDate").innerHTML = date;

    if (message.from.type == "Bot") {
      chatDiv += `
          <div class="chat-message agent-message bot-message">
            <div class="profile-pic">
              <div class="profile-pic-area user-img">
                <img src="./images/robot-dark.svg" alt="bot"/>
              </div>
            </div>
            <div class="chat-message-content">
            ${
              message.attachments.length > 0
                ? previewAttachment(message.attachments)
                : ""
            }
              <p><span class="chat-name">${message.from.firstName}</span>
              <span>${decodeURIComponent(message.text)}</span>
                <span class="message-stamp"><span class="chat-time">${time}</span></span></p>
            </div>
          </div>`;
    }
    if (message.from.type == "Agent") {
      chatDiv += `
          <div class="chat-message agent-message">
          
            <div class="profile-pic">
              <div class="profile-pic-area user-img">
                <img src="./images/agent.png" alt="agent"/>
              </div>
            </div>
            <div class="chat-message-content">
            ${
              message.attachments.length > 0
                ? previewAttachment(message.attachments)
                : ""
            }
              <p><span class="chat-name">${message.from.firstName}</span>
              <span>${decodeURIComponent(message.text)}</span>
                <span class="message-stamp"><span class="chat-time">${time}</span></span></p>
            </div>
          </div>`;
    }
    if (message.from.type == "Customer") {
      chatDiv += `
          <div class="chat-message user-message ">
            <div class="profile-pic">
              <div class="profile-pic-area user-img">
                <img src="./images/agent.png" alt="customer"/>
              </div>
            </div>
            <div class="chat-message-content">
            ${
              message.attachments.length > 0
                ? previewAttachment(message.attachments)
                : ""
            }
              <p><span class="chat-name">${message.from.firstName}</span>
              <span>${decodeURIComponent(message.text)}</span>
                <span class="message-stamp"><span class="chat-time">${time}</span></span></p>
            </div>
          </div>`;
    }
  }
  chatDiv += "</div>";
  document.getElementById("msg").innerHTML = chatDiv;
}

function timeConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? " AM" : " PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(""); // return adjusted time or original string
}

function logout() {
  if (confirm("Are you sure, want to logout!")) {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("tenant");
    sessionStorage.removeItem("token");

    window.location.href = "/login.html";
  } else {
    return false;
  }
}
// function will calculate total pages
function calculateTotalPages(totalEntries, pageSize) {
  let totalpages = Math.ceil(totalEntries / pageSize);
  return totalpages;
}

//  this will show pagination ui

function showPagination() {
  let html = `
     <div class="pagination">
        <span class="page-span">
          <span>Show </span>
          <select  id="pageInfo" onchange="changeSize()">

     ${getOptions()}
          </select>
        </span>
   
        <div class="pagination_action_buttons">
          <div>
        
          ${getButtons()}
          </div>
          </div>
        </div>`;

  let paginationArea = document.querySelector(".paginationArea");

  paginationArea.innerHTML = html;
}

function getOptions() {
  let html = ``;
  for (item of options) {
    if (item == pageSize) {
      html += `<option selected value="${item}" id=option-${item} >${item}</option>`;
    } else {
      html += `<option value="${item}" id=option-${item} >${item}</option>`;
    }
  }

  return html;
}
var previousButton = 1;
function getButtons() {
  let html = ``;
  for (let i = 0; i < totalPages; i++) {
    if (i + 1 == currentPage) {
      html += `    <button class="active" id= button-${
        i + 1
      } onclick="changePage(${i + 1})">${i + 1}</button>`;
    } else {
      html += `    <button id= button-${i + 1} onclick="changePage(${i + 1})">${
        i + 1
      }</button>`;
    }
  }
  return html;
}

function changePage(page) {
  currentPage = +page;

  fetchMessages(currentPage, pageSize, searchQuery);
}

function changeSize() {
  currentPage = 1;
  let currentItem = document.getElementById("pageInfo");
  pageSize = +currentItem.value;

  fetchMessages(currentPage, pageSize, searchQuery);
}
// show and hide spinner
function showSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "block";
}
function hideSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "none";
}

function previewAttachment(files) {
  // console.log();

  let result = "";
  files.forEach((file) => {
    result += previewHtml(file);
  });
  return result;
}

function previewHtml(file) {
  let type = file.type.split("/")[0];
  let chatDiv = "";

  if (type.toUpperCase() == "IMAGE") {
    chatDiv += `
          <div class="image-preview">
            <div class="image-preview-content">
              <p><a target="_blank" href="${file._thumbnailUrl}"><img src="${file._thumbnailUrl}" class="preview-image"></a>
              <span>${file.name}</span>
            </div>
          </div>`;
  } else {
    chatDiv += `<div class="file-preview-area">
      <a href="${file._thumbnailUrl}" class="file-preview" target="_blank">
          <img class="file-icon" src="https://efcx-frontend.expertflow.com/customer-widget/widget-assets/chat-transcript/images/file-type.svg" alt="File Icon">
          <div class="file-extension">${type.toUpperCase()}</div>
      </a>
      <span class="file-name">${file.name}</span>
    </div>`;
  }
  return chatDiv;
}
function getPaginationOptions(totalMessages) {
  const baseOptions = [5, 10, 20, 50];
  const options = [];

  for (let i = 0; i < baseOptions.length; i++) {
    if (totalMessages >= baseOptions[i]) {
      options.push(baseOptions[i]);
    }
  }

  // Add multiples of 50 up to totalMessages
  let multiple = 50;
  while (multiple < totalMessages) {
    options.push(multiple);
    multiple += 50;
  }

  // Ensure the totalMessages value is included
  if (!options.includes(totalMessages)) {
    options.push(totalMessages);
  }

  return options;
}
