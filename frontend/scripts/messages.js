import { getToken } from "./auth.js";

let currentUser = null;

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
    currentUser = await res.json();

    const recipientSelect = document.getElementById("recipientSelect");
    const recipientWrapper = document.getElementById("recipientWrapper");

    if (currentUser.role === "admin") {
      if (recipientWrapper) recipientWrapper.style.display = "block";
      await loadClients();
      await updateMessageStats();
    } else {
      if (recipientWrapper) recipientWrapper.style.display = "none";
      if (recipientSelect) {
        recipientSelect.required = false;
        recipientSelect.disabled = true;
      }
    }

    await loadInbox();
    await loadSent();

    const form = document.getElementById("newMessageForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await sendMessage();
    });

    setupTabs();
  } catch (err) {
    console.error("Failed to verify user:", err);
    window.location.href = "login.html";
  }
});

function setupTabs() {
  const inboxTab = document.getElementById("inboxTab");
  const sentTab = document.getElementById("sentTab");
  const inboxSection = document.getElementById("messagesListSection");
  const sentSection = document.getElementById("sentMessagesSection");

  inboxTab?.addEventListener("click", () => {
    inboxSection.style.display = "block";
    sentSection.style.display = "none";
    inboxTab.classList.add("active");
    sentTab.classList.remove("active");
  });

  sentTab?.addEventListener("click", () => {
    inboxSection.style.display = "none";
    sentSection.style.display = "block";
    sentTab.classList.add("active");
    inboxTab.classList.remove("active");
  });
}

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

async function loadInbox() {
  const token = getToken();
  const list = document.getElementById("messagesList");
  list.innerHTML = "<p>Loading inbox...</p>";

  try {
    const res = await fetch("http://localhost:3000/api/messages/inbox", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const messages = await res.json();

    list.innerHTML = "";
    if (messages.length === 0) {
      list.innerHTML = "<p>No inbox messages.</p>";
    }

    messages.forEach((msg) => {
      const div = createMessageElement(msg, true);
      list.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load inbox:", err);
    list.innerHTML = "<p>Error loading messages.</p>";
  }
}

async function loadSent() {
  const token = getToken();
  const list = document.getElementById("sentMessagesList");
  if (!list) return;

  list.innerHTML = "<p>Loading sent...</p>";

  try {
    const res = await fetch("http://localhost:3000/api/messages/sent", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const messages = await res.json();

    list.innerHTML = "";
    if (messages.length === 0) {
      list.innerHTML = "<p>No sent messages.</p>";
    }

    messages.forEach((msg) => {
      const div = createMessageElement(msg, false);
      list.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load sent:", err);
    list.innerHTML = "<p>Error loading sent messages.</p>";
  }
}

function createMessageElement(msg, isInbox = true) {
  const div = document.createElement("div");
  div.className = "message-item";
  if (!msg.isRead && isInbox) div.classList.add("unread");

  const fromName = msg.from?.name || "Unknown";
  const toName = msg.to?.name || "Unknown";
  const who = isInbox ? `From: ${fromName}` : `To: ${toName}`;
  const toId = typeof msg.to === "object" ? msg.to._id : msg.to;

  let content = `
    <p><strong>${who}</strong></p>
    <p><strong>Subject:</strong> ${msg.subject}</p>
    <p><strong>Message:</strong> ${msg.body}</p>
    <p><small>${new Date(msg.createdAt).toLocaleString()}</small></p>
  `;

  if (!isInbox && msg.isRead) {
    content += `<div class="read-tag" style="position:absolute; top:10px; right:10px; color:green;">✓ Read by recipient</div>`;
  }

  if (isInbox && !msg.isRead && toId === currentUser.id) {
    content += `<button class="mark-read" data-id="${msg._id}" style="background: green; color: white;">Mark as Read</button>`;
  }

  content += `<button class="delete-btn" data-id="${msg._id}">Delete</button><hr>`;
  div.innerHTML = content;
  div.style.position = "relative";

  div.querySelector(".delete-btn").addEventListener("click", async () => {
    if (confirm("Delete this message?")) {
      await deleteMessage(msg._id);
    }
  });

  const markReadBtn = div.querySelector(".mark-read");
  if (markReadBtn) {
    markReadBtn.addEventListener("click", async () => {
      await markMessageAsRead(msg._id);
    });
  }

  return div;
}

async function sendMessage() {
  const token = getToken();
  const subject = document.getElementById("subject").value.trim();
  const content = document.getElementById("content").value.trim();
  const select = document.getElementById("recipientSelect");

  if (!subject || !content) return;

  const payload = {
    subject,
    body: content
  };

  if (currentUser.role === "admin") {
    payload.to = select.value;
  }

  try {
    const res = await fetch("http://localhost:3000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Send failed");

    document.getElementById("subject").value = "";
    document.getElementById("content").value = "";
    if (select) select.selectedIndex = 0;

    await loadInbox();
    await loadSent();
    await updateMessageStats();
  } catch (err) {
    console.error("Send error:", err);
    alert("Message failed to send.");
  }
}

async function deleteMessage(id) {
  const token = getToken();
  try {
    await fetch(`http://localhost:3000/api/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    await loadInbox();
    await loadSent();
    await updateMessageStats();
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

async function markMessageAsRead(id) {
  const token = getToken();
  try {
    await fetch(`http://localhost:3000/api/messages/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });
    await loadInbox();
    await updateMessageStats();
  } catch (err) {
    console.error("Mark as read failed:", err);
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
    unreadSpan.textContent = messages.filter((m) => !m.isRead).length;
  } catch (err) {
    console.error("Stats error:", err);
  }
}
