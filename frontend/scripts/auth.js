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
  const token = getToken();
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  const registerLink = document.getElementById("registerLink");
  const adminLink = document.getElementById("adminLink");
  const clientLink = document.getElementById("clientLink");
  const adminPostsLink = document.getElementById("adminPostsLink");

  if (token) {
    const payload = parseJwt(token);

    loginLink.style.display = "none";
    registerLink.style.display = "none";
    logoutLink.style.display = "inline";

    if (payload.role === "admin") {
      adminLink.style.display = "inline";
      adminPostsLink.style.display = "inline";
      clientLink.style.display = "none";
    } else if (payload.role === "client") {
      clientLink.style.display = "inline";
      adminLink.style.display = "none";
      adminPostsLink.style.display = "none";
    }
  } else {
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    logoutLink.style.display = "none";
    adminLink.style.display = "none";
    clientLink.style.display = "none";
    adminPostsLink.style.display = "none";
  }
}