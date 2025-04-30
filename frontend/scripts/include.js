import { showNavByAuth } from "./auth.js";

async function include(selector, url, callback) {
  const element = document.querySelector(selector);
  if (element) {
    const response = await fetch(url);
    const html = await response.text();
    element.innerHTML = html;

    if (typeof callback === "function") {
      callback();
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await include("#include-nav", "components/nav.html", () => {
    showNavByAuth();
  });

  await include("#include-footer", "components/footer.html");
});