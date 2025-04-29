document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const mfaField = document.getElementById("mfaField");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const tokenInput = document.getElementById("mfaToken");
    const token = tokenInput ? tokenInput.value.trim() : undefined;

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
      });

      const data = await res.json();

      if (res.status === 206 && data.mfaRequired) {
        mfaField.style.display = "block";
        alert("Enter your MFA code.");
        return;
      }

      if (!res.ok || !data.token) {
        alert(data.msg || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split(".")[1]));

      if (payload.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "client.html";
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error");
    }
  });
});
