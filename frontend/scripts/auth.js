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
    const payload = getPayload();
    if (!payload || payload.role !== role) {
      window.location.href = redirectTo;
    }
    return payload;
  }
  
  export function logout(redirectTo = "login.html") {
    localStorage.removeItem("token");
    window.location.href = redirectTo;
  }