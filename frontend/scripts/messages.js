import { getToken } from "./auth.js"; // Make sure auth.js exists too!

document.addEventListener("DOMContentLoaded", () => {
  loadMessages();

  const form = document.getElementById("newMessageForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await sendMessage();
  });
});

async function loadMessages() {
  const token = getToken();
  const messagesList = document.getElementById("messagesList");
  messagesList.innerHTML = "<p>Loading messages...</p>";

  try {
    const res = await fetch("http://localhost:3000/api/messages/inbox", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const messages = await res.json();

    if (messages.length === 0) {
      messagesList.innerHTML = "<p>No messages yet.</p>";
      return;
    }

    messagesList.innerHTML = "";

    messages.forEach((msg) => {
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message-item");
      msgDiv.innerHTML = `
        <p><strong>From:</strong> ${msg.from?.name || "Unknown"} (${msg.from?.email || "No Email"})</p>
        <p><strong>Subject:</strong> ${msg.subject}</p>
        <p><strong>Message:</strong> ${msg.body}</p>
        <p><small>${new Date(msg.createdAt).toLocaleString()}</small></p>
        <hr>
      `;
      messagesList.appendChild(msgDiv);
    });

  } catch (err) {
    console.error("Failed to load messages:", err);
    messagesList.innerHTML = "<p>Error loading messages.</p>";
  }
}

async function sendMessage() {
  const token = getToken();
  const messageContent = document.getElementById("content").value.trim();

  if (!messageContent) return;

  try {
    const res = await fetch("http://localhost:3000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        to: "662c5f8c5f33f0e5b81c7b99", // <-- Replace this with your admin MongoDB _id
        subject: "New Message",
        body: messageContent
      })
    });

    if (!res.ok) {
      throw new Error("Failed to send message.");
    }

    document.getElementById("content").value = "";
    await loadMessages(); // Reload messages after sending
    alert("Message sent!");

  } catch (err) {
    console.error("Send message failed:", err);
    alert("Failed to send message. Try again.");
  }
}
