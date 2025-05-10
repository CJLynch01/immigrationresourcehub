import { showNavByAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  showNavByAuth();

  const hamburger = document.getElementById("hamburger");
  const navbar = document.getElementById("navbar");

  if (hamburger && navbar) {
    hamburger.addEventListener("click", () => {
      navbar.classList.toggle("active");
    });
  }
});