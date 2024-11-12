document.addEventListener("DOMContentLoaded", () => {
  const createRoomButton = document.getElementById("confirmCreateRoom");
  const joinRoomButton = document.getElementById("confirmJoinRoom");
  const createIDInput = document.getElementById("createIDInput");
  const joinIDInput = document.getElementById("joinIDInput");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  // Connect to the Socket.io server
  const socket = io();

  // Handle "Create Room" button click
  createRoomButton.addEventListener("click", async () => {
    try {
      let response = await fetch("/api/create-room", { method: "POST" });
      let data = await response.json();
      if (data.roomId) {
        createIDInput.value = data.roomId;
        successMessage.textContent = `Room Code: ${data.roomId}`;
        errorMessage.textContent = "";
      }
    } catch (error) {
      errorMessage.textContent = "Error creating room. Please try again.";
      successMessage.textContent = "";
    }
  });

  joinRoomButton.addEventListener("click", async () => {
    let roomId = joinIDInput.value;
    if (!roomId) {
      errorMessage.textContent = "Please enter a room code to join.";
      return;
    }

    try {
      let response = await fetch("/api/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });

      let data = await response.json();
      if (response.ok) {
        // Emit join room event and redirect to game.html
        socket.emit("join room", { roomId });
        successMessage.textContent = `Joined room: ${roomId}`;
        errorMessage.textContent = ""; // Clear any previous error messages

        // Redirect to game.html, passing the room ID as a query parameter
        setTimeout(() => {
          window.location.href = `/game.html?${roomId}`;
        }, 100); // Delay for user to see success message
      } else {
        errorMessage.textContent = data.message || "Room not found.";
        successMessage.textContent = ""; // Clear success message if there's an error
      }
    } catch (error) {
      errorMessage.textContent = "Error joining room. Please try again.";
    }
  });
  // Display success message on room joined
  socket.on("room joined", ({ tankImage, players }) => {
    successMessage.textContent = `Joined room successfully! Your tank: ${tankImage}`;
  });

  // Handle errors
  socket.on("error", (msg) => {
    errorMessage.textContent = msg;
  });
});
