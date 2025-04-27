document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

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

      if (!res.ok || !data.token) {
        alert(data.msg || "Login failed");
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Decode role from token
      const payload = JSON.parse(atob(data.token.split(".")[1]));

      // Redirect based on role
      if (payload.role === "admin") {
        window.location.replace("admin.html");  // <--- ✨ Full reload
      } else {
        window.location.replace("client.html"); // <--- ✨ Full reload
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});
