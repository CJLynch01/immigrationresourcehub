// Redirect to main site if the user has already seen the landing page
if (localStorage.getItem("seenLanding")) {
  window.location.href = "index.html";
}

// Set the flag when the button is clicked
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-journey-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      localStorage.setItem("seenLanding", "true");
    });
  }
});