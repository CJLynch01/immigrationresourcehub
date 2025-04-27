import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  loadMessages();
  loadClients();

  const form = document.getElementById("newMessageForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await sendMessage();
  });
});

async function loadClients() {
  const token = getToken();
  const recipientSelect = document.getElementById("recipientSelect");

  try {
    const res = await fetch("http://localhost:3000/api/users/clients", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const clients = await res.json();

    clients.forEach((client) => {
      const option = document.createElement("option");
      option.value = client._id;
      option.textContent = `${client.name} (${client.email})`;
      recipientSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Failed to load clients:", err);
  }
}

async function loadMessages() {
  // (keep your existing loadMessages function here)
}

async function sendMessage() {
    const token = getToken();
    const subject = document.getElementById("subject").value.trim();
    const messageContent = document.getElementById("content").value.trim();
    const recipientSelect = document.getElementById("recipientSelect");
  
    if (!subject || !messageContent) return;
  
    try {
      const resUser = await fetch("http://localhost:3000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = await resUser.json();
  
      let recipientId;
  
      if (user.role === "admin") {
        // Admin selects a client
        recipientId = recipientSelect?.value;
      } else if (user.role === "client") {
        // Client always sends to Admin
        recipientId = "662c5f8c5f33f0e5b81c7b99"; // <-- Your Admin MongoDB _id
      }
  
      if (!recipientId) {
        alert("Recipient not selected.");
        return;
      }
  
      const res = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          to: recipientId,
          subject,
          body: messageContent
        })
      });
  
      if (!res.ok) {
        throw new Error("Failed to send message.");
      }
  
      document.getElementById("subject").value = "";
      document.getElementById("content").value = "";
      if (recipientSelect) recipientSelect.selectedIndex = 0;
  
      await loadMessages();
      alert("Message sent!");
  
    } catch (err) {
      console.error("Send message failed:", err);
      alert("Failed to send message. Try again.");
    }
  }
  
