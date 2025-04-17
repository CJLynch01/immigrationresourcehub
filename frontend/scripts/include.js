import { showNavByAuth } from "./auth.js";

async function include(selector, url, callback) {
  const element = document.querySelector(selector);
  if (element) {
    const response = await fetch(url);
    const html = await response.text();
    element.innerHTML = html;

    if (typeof callback === "function") {
      callback(); // Run logic *after* partial is injected
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  include("#include-nav", "components/nav.html", () => {
    showNavByAuth(); // ✅ Now runs after nav is loaded
  });

  include("#include-footer", "components/footer.html");
});