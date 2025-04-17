import { showNavByAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  showNavByAuth();

  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        alert(data.msg || "Registration failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split('.')[1]));

      if (payload.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "client.html";
      }

    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});