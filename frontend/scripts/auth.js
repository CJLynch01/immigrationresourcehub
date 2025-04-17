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
  
export function logout(redirectTo = "login.html") {
    localStorage.removeItem("token");
    window.location.href = redirectTo;
}
  
export function showNavByAuth() {
    const token = localStorage.getItem("token");
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");
  
    if (token) {
      if (loginLink) loginLink.style.display = "none";
      if (logoutLink) {
        logoutLink.style.display = "inline";
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          logout();
        });
      }
    } else {
      if (loginLink) loginLink.style.display = "inline";
      if (logoutLink) logoutLink.style.display = "none";
    }
}