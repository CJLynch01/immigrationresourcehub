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
    const token = localStorage.getItem("token");
    console.log("🔑 Token found:", token);
  
    if (!token) {
      console.log("❌ No token found. Redirecting...");
      window.location.href = redirectTo;
      return null;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("📦 Decoded token payload:", payload);
  
      if (payload.role !== role) {
        console.log(`❌ Role mismatch: needed ${role}, but got ${payload.role}`);
        window.location.href = redirectTo;
        return null;
      }
  
      console.log("✅ Access granted for:", payload.role);
      return payload;
    } catch (err) {
      console.log("❌ Error decoding token:", err);
      localStorage.removeItem("token");
      window.location.href = redirectTo;
      return null;
    }
}
  
export function showNavByAuth() {
  const token = localStorage.getItem('token');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');
  const clientLink = document.getElementById('clientLink');
  const adminDropdown = document.getElementById('adminDropdown');

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  if (token) {
    const payload = parseJwt(token);
    if (payload.role === "admin") {
      adminDropdown.style.display = "inline-block";
      clientLink.style.display = "none";
    } else if (payload.role === "client") {
      clientLink.style.display = "inline-block";
      adminDropdown.style.display = "none";
    }
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    logoutLink.style.display = "inline";
  } else {
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    clientLink.style.display = "none";
    adminDropdown.style.display = "none";
    logoutLink.style.display = "none";
  }
}