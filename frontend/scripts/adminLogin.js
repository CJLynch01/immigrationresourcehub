const loginForm = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");

        // Redirect to admin dashboard
        window.location.href = "admin.html";
      } else {
        alert(data.msg || data.error || "Login failed.");
      }
    } catch (err) {
      alert("Login error. Please try again.");
      console.error(err);
    }
  });
}

if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}