export function getToken() {
  return localStorage.getItem("token");
}

export function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function getPayload() {
  const token = getToken();
  return token ? decodeToken(token) : null;
}

export function requireRole(role, redirectTo = "login.html") {
  const token = getToken();

  if (!token) {
    window.location.href = redirectTo;
    return null;
  }

  try {
    const payload = decodeToken(token);

    if (!payload) {
      window.location.href = redirectTo;
      return null;
    }

    if (payload.role !== role) {
      window.location.href = redirectTo;
      return null;
    }

    return payload;
  } catch (err) {
    console.error("Error decoding token:", err);
    localStorage.removeItem("token");
    window.location.href = redirectTo;
    return null;
  }
}


export function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

export function showNavByAuth() {
  const token = getToken();
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');
  const clientDropdown = document.getElementById('clientDropdown');
  const adminDropdown = document.getElementById('adminDropdown');
  const messagesDropdown = document.getElementById('messagesDropdown');


  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  if (token) {
    const payload = decodeToken(token);
    if (payload?.role === "admin") {
      if (adminDropdown) adminDropdown.style.display = "inline-block";
      if (clientDropdown) clientDropdown.style.display = "none";
    } else if (payload?.role === "client") {
      if (clientDropdown) clientDropdown.style.display = "inline-block";
      if (adminDropdown) adminDropdown.style.display = "none";
    }

    if (messagesDropdown) messagesDropdown.style.display = "inline-block";

    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "inline";
  } else {
    if (loginLink) loginLink.style.display = "inline";
    if (registerLink) registerLink.style.display = "inline";
    if (clientDropdown) clientDropdown.style.display = "none";
    if (adminDropdown) adminDropdown.style.display = "none";
    if (messagesDropdown) messagesDropdown.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
  }
}

async function updateUnreadMessages() {
  const token = getToken();
  const unreadSpan = document.getElementById("unreadCount");

  if (token && unreadSpan) {
    try {
      const res = await fetch("http://localhost:3000/api/messages/unread-count", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      unreadSpan.textContent = data.unreadCount;
    } catch (err) {
      console.error("Failed to fetch unread messages:", err);
    }
  }
}

updateUnreadMessages();
