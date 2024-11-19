const createRoomButton = document.getElementById("confirmCreateRoom");
const joinRoomButton = document.getElementById("confirmJoinRoom");
const createIDInput = document.getElementById("createIDInput");
const joinIDInput = document.getElementById("joinIDInput");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

// Connect to the Socket.io server
const socket = io();

// Handle "Create Room" button click
createRoomButton.addEventListener("click", () => {
  let url = "api/create-room";

  // fetch url for a POST request
  fetch(url, { method: "POST" })
    .then((response) => {
      return response.json();
    })
    .then((body) => {
      if (body.roomId) {
        createIDInput.value = body.roomId;
        successMessage.textContent = `Room Code: ${body.roomId}`;
        errorMessage.textContent = "";
        console.log("Room created:", body.roomId);
      }
    })
    .catch((error) => {
      console.log(error);
      errorMessage.textContent = "Error creating room. Please try again.";
      successMessage.textContent = "";
    });
});

// Handle "Join Room" button click
joinRoomButton.addEventListener("click", () => {
  let url = "api/join-room";
  let roomId = joinIDInput.value;
  if (!roomId) {
    errorMessage.textContent = "Please enter a room code to join.";
    return;
  }

  // fetch url and make a POST request
  fetch(url, { method: "POST", body: JSON.stringify({ roomId }) })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((body) => {
      // Emit join room event
      socket.emit("join room", roomId);
      successMessage.textContent = `Joined room: ${roomId}`;
      errorMessage.textContent = "";
      // Redirect to waiting.html, passing the room ID as a query parameter
      setTimeout(() => {
        window.location.href = `/waiting/${roomId}`; //https://stackoverflow.com/questions/503093/how-do-i-redirect-to-another-webpage
      }, 1000);
    })
    .catch((error) => {
      console.log(error);
      errorMessage.textContent = "Error joining room. Please try again.";
      successMessage.textContent = "";
    });
});

// Handle errors
socket.on("error", (msg) => {
  errorMessage.textContent = msg;
});
