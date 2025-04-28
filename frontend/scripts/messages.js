import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();

    const recipientSelect = document.getElementById("recipientSelect");
    const recipientLabel = document.querySelector('label[for="recipientSelect"]');

    if (user.role === "admin") {
      await loadClients();
    } else if (user.role === "client") {
      if (recipientSelect) {
        recipientSelect.style.display = "none";
        recipientSelect.required = false;
        recipientSelect.disabled = true;
      }
      if (recipientLabel) {
        recipientLabel.style.display = "none";
      }
    }

    await loadMessages(); // ✅ Load messages after verifying user

    const form = document.getElementById("newMessageForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await sendMessage();
    });
  } catch (err) {
    console.error("Failed to verify user:", err);
    window.location.href = "login.html";
  }
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
      const fromName = msg.from?.name || "Client";
      const fromEmail = msg.from?.email || "No Email";

      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message-item");
      msgDiv.innerHTML = `
        <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
        <p><strong>Subject:</strong> ${msg.subject}</p>
        <p><strong>Message:</strong> ${msg.body}</p>
        <p><small>${new Date(msg.createdAt).toLocaleString()}</small></p>
        <button class="delete-btn" data-id="${msg._id}">Delete</button>
        <hr>
      `;
      messagesList.appendChild(msgDiv);
    });

    // After messages are displayed, add delete button listeners
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const messageId = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this message?")) {
          await deleteMessage(messageId);
        }
      });
    });

  } catch (err) {
    console.error("Failed to load messages:", err);
    messagesList.innerHTML = "<p>Error loading messages.</p>";
  }
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
      recipientId = recipientSelect?.value;
    } else if (user.role === "client") {
      recipientId = "67fe80134b951dad646f1ce7"; // <-- Update this to match Admin's real _id
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

    await loadMessages(); // Reload inbox after sending
    alert("Message sent!");
  } catch (err) {
    console.error("Send message failed:", err);
    alert("Failed to send message. Try again.");
  }
}

async function deleteMessage(messageId) {
  const token = getToken();

  try {
    const res = await fetch(`http://localhost:3000/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to delete message.");
    }

    await loadMessages(); // Reload inbox after deletion
    alert("Message deleted!");
  } catch (err) {
    console.error("Delete message failed:", err);
    alert("Failed to delete message.");
  }
}

import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();

    const recipientSelect = document.getElementById("recipientSelect");
    const recipientLabel = document.querySelector('label[for="recipientSelect"]');

    if (user.role === "admin") {
      await loadClients();
      await updateMessageStats(); // ✅ Load total + unread message stats if admin
    } else if (user.role === "client") {
      if (recipientSelect) {
        recipientSelect.style.display = "none";
        recipientSelect.required = false;
        recipientSelect.disabled = true;
      }
      if (recipientLabel) {
        recipientLabel.style.display = "none";
      }
    }

    await loadMessages(); // ✅ Load messages after verifying user

    const form = document.getElementById("newMessageForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await sendMessage();
    });
  } catch (err) {
    console.error("Failed to verify user:", err);
    window.location.href = "login.html";
  }
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
      const fromName = msg.from?.name || "Client";
      const fromEmail = msg.from?.email || "No Email";

      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message-item");
      msgDiv.innerHTML = `
        <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
        <p><strong>Subject:</strong> ${msg.subject}</p>
        <p><strong>Message:</strong> ${msg.body}</p>
        <p><small>${new Date(msg.createdAt).toLocaleString()}</small></p>
        <button class="delete-btn" data-id="${msg._id}">Delete</button>
        <hr>
      `;
      messagesList.appendChild(msgDiv);
    });

    // Add delete button handlers
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const messageId = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this message?")) {
          await deleteMessage(messageId);
        }
      });
    });

  } catch (err) {
    console.error("Failed to load messages:", err);
    messagesList.innerHTML = "<p>Error loading messages.</p>";
  }
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
      recipientId = recipientSelect?.value;
    } else if (user.role === "client") {
      recipientId = "67fe80134b951dad646f1ce7"; // <-- Your Admin's real _id
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

    await loadMessages(); // Reload inbox after sending
    if (user.role === "admin") {
      await updateMessageStats(); // Update stats too if admin sent a message
    }

    alert("Message sent!");
  } catch (err) {
    console.error("Send message failed:", err);
    alert("Failed to send message. Try again.");
  }
}

async function deleteMessage(messageId) {
  const token = getToken();

  try {
    const res = await fetch(`http://localhost:3000/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to delete message.");
    }

    await loadMessages(); // Reload inbox after deletion
    await updateMessageStats(); // Update stats after deletion
    alert("Message deleted!");
  } catch (err) {
    console.error("Delete message failed:", err);
    alert("Failed to delete message.");
  }
}

export async function updateMessageStats() {
  const token = getToken();
  const totalSpan = document.getElementById("totalMessages");
  const unreadSpan = document.getElementById("unreadMessages");

  if (token && totalSpan && unreadSpan) {
    try {
      const resMessages = await fetch("http://localhost:3000/api/messages/inbox", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages = await resMessages.json();

      const totalCount = messages.length;
      const unreadCount = messages.filter((msg) => !msg.isRead).length;

      totalSpan.textContent = totalCount;
      unreadSpan.textContent = unreadCount;
    } catch (err) {
      console.error("Failed to fetch message stats:", err);
    }
  }
}
