document.getElementById("searchButton").addEventListener("click", () => {
  const searchQuery = document.getElementById("searchInput").value;
  if (searchQuery) {
    const page = 1; // reset to the first page for search results
    const pageSize = 10;
    fetchMessages(page, pageSize, searchQuery);
  }
});

const api_url = history_api_url;
var messages = [];

function fetchMessages(page, pageSize, searchQuery) {
  const request = new XMLHttpRequest();
  let url = `${api_url}/getMessagesByRefId?refId=${searchQuery}&page=${page}&pageSize=${pageSize}`;
  request.open("GET", url);
  request.send();
  request.onload = () => {
    if (request.status === 200) {
      
      result = JSON.parse(request.response);
      messages = result.messages;
      console.log('Total Message: ', result.metaData.totalMessages);
      console.log("Messages :", messages);
      if (messages.length === 0) {
        document.getElementById("chatDate").innerHTML = 'No Record Found';
      }
      messageFunction();
    } else {
      console.log(`error ${request.status} ${request.statusText}`)
    }
  }
}

//Function for Chat Messages Of BOT , AGENT and CUSTOMER
function messageFunction() {
  let chatDiv = `<div>`;

  for (const msg in messages) {

    const message = messages[msg];
    let date = message.timestamp.slice(0, 10).replace(/-/g, "/");
    let dateTime = new Date(message.timestamp); //Convert UTC without GMT dateTime to Locale with GMT
    let min = `${dateTime.getMinutes()}` <= 9 ? `0${dateTime.getMinutes()}` : `${dateTime.getMinutes()}`;
    let time = timeConvert(`${dateTime.getHours()}:${min}`);

    document.getElementById("chatDate").innerHTML = date;

    if (message.from.type == 'Bot') {

      chatDiv += `
          <div class="chat-message agent-message bot-message">
            <div class="profile-pic">
              <div class="profile-pic-area user-img">
                <img src="./images/robot-dark.svg" alt="bot"/>
              </div>
            </div>
            <div class="chat-message-content">
              <p><span class="chat-name">${message.from.firstName}</span>
              <span>${message.text}</span>
                <span class="message-stamp"><span class="chat-time">${time}</span></span></p>
            </div>
          </div>`;
    }
    if (message.from.type == 'Agent') {

      chatDiv += `
          <div class="chat-message agent-message">
            <div class="profile-pic">
              <div class="profile-pic-area user-img">
                <img src="./images/agent.png" alt="agent"/>
              </div>
            </div>
            <div class="chat-message-content">
              <p><span class="chat-name">${message.from.firstName}</span>
              <span>${message.text}</span>
                <span class="message-stamp"><span class="chat-time">${time}</span></span></p>
            </div>
          </div>`;
    }
    if (message.from.type == 'Customer') {

      chatDiv += `
          <div class="chat-message user-message ">
            <div class="profile-pic">
              <div class="profile-pic-area user-img">
                <img src="./images/agent.png" alt="customer"/>
              </div>
            </div>
            <div class="chat-message-content">
              <p><span class="chat-name">${message.from.firstName}</span>
              <span>${message.text}</span>
                <span class="message-stamp"><span class="chat-time">${time}</span></span></p>
            </div>
          </div>`;
    }
  }
  chatDiv += '</div>';
  document.getElementById("msg").innerHTML = chatDiv;
}

function timeConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice(1);  // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(''); // return adjusted time or original string
}


function logout() {

  if (confirm("Are you sure, want to logout!")) {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("tenant");
    sessionStorage.removeItem("token");

    window.location.href = '/login.html';
  } else {
    return false;
  }

}