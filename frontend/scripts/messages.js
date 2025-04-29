import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  let user;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    user = await res.json();

    const recipientSelect = document.getElementById("recipientSelect");
    const recipientLabel = document.querySelector('label[for="recipientSelect"]');

    if (user.role === "admin") {
      await loadClients();
      await updateMessageStats();
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

    await loadMessages();

    const form = document.getElementById("newMessageForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await sendMessage(user);
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

    if (!messages.length) {
      messagesList.innerHTML = "<p>No messages yet.</p>";
      return;
    }

    messagesList.innerHTML = "";
    messages.forEach(createMessageItem);
  } catch (err) {
    console.error("Failed to load messages:", err);
    messagesList.innerHTML = "<p>Error loading messages.</p>";
  }
}

function createMessageItem(msg) {
  const messagesList = document.getElementById("messagesList");

  const fromName = msg.from?.name || "Client";
  const fromEmail = msg.from?.email || "No Email";

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message-item");
  if (!msg.isRead) msgDiv.classList.add("unread");

  msgDiv.innerHTML = `
    <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
    <p><strong>Subject:</strong> ${msg.subject}</p>
    <p><strong>Message:</strong> ${msg.body}</p>
    <p><small>${new Date(msg.createdAt).toLocaleString()}</small></p>
    <button class="delete-btn" data-id="${msg._id}">Delete</button>
    <hr>
  `;

  messagesList.prepend(msgDiv);

  const deleteBtn = msgDiv.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(msg._id);
    }
  });
}

async function sendMessage(user) {
  const token = getToken();
  const subject = document.getElementById("subject").value.trim();
  const messageContent = document.getElementById("content").value.trim();
  const recipientSelect = document.getElementById("recipientSelect");

  if (!subject || !messageContent) return;

  try {
    let recipientId;
    if (user.role === "admin") {
      recipientId = recipientSelect?.value;
    } else if (user.role === "client") {
      recipientId = "67fe80134b951dad646f1ce7";
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
      body: JSON.stringify({ to: recipientId, subject, body: messageContent })
    });

    if (!res.ok) throw new Error("Failed to send message.");

    // Create a visual message immediately
    const newMsg = {
      _id: Date.now().toString(),
      from: { name: user.name || "You", email: user.email || "" },
      subject,
      body: messageContent,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    createMessageItem(newMsg);

    document.getElementById("subject").value = "";
    document.getElementById("content").value = "";
    if (recipientSelect) recipientSelect.selectedIndex = 0;

    if (user.role === "admin") await updateMessageStats();

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
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to delete message.");

    await loadMessages();
    await updateMessageStats();
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

  if (!token || !totalSpan || !unreadSpan) return;

  try {
    const res = await fetch("http://localhost:3000/api/messages/inbox", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const messages = await res.json();

    totalSpan.textContent = messages.length;
    unreadSpan.textContent = messages.filter((msg) => !msg.isRead).length;
  } catch (err) {
    console.error("Failed to fetch message stats:", err);
  }
}
