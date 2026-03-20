import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const enableBtn = document.getElementById("enableMFAButton");
  const mfaSection = document.getElementById("mfaSection");
  const qrCode = document.getElementById("qrCode");
  const verifyButton = document.getElementById("verifyButton");

  enableBtn.addEventListener("click", async () => {
    const token = getToken();

    const res = await fetch("https://immigrationresourcehub.onrender.com/api/auth/mfa/setup", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (data.qrCode) {
      qrCode.src = data.qrCode;
      mfaSection.style.display = "block";
    } else {
      alert("Failed to generate MFA setup.");
    }
  });

  verifyButton.addEventListener("click", async () => {
    const code = document.getElementById("verifyToken").value.trim();
    if (!code) return alert("Please enter the 6-digit code.");

    const token = getToken();
    const res = await fetch("https://immigrationresourcehub.onrender.com/api/auth/mfa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ token: code })
    });

    const data = await res.json();
    if (res.ok) {
      alert("MFA successfully enabled!");
    } else {
      alert(data.error || "Verification failed.");
    }
  });
});
