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

export function requireRole(role, redirectTo = "login.html") {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = redirectTo;
      return null;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== role) {
        window.location.href = redirectTo;
        return null;
      }
      return payload;
    } catch {
      localStorage.removeItem("token");
      window.location.href = redirectTo;
      return null;
    }
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
          localStorage.removeItem("token");
          window.location.href = "login.html"
        });
      }
    } else {
      if (loginLink) loginLink.style.display = "inline";
      if (logoutLink) logoutLink.style.display = "none";
    }
  }