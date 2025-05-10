import { showNavByAuth } from "./auth.js";

// Load Google Analytics script dynamically
(function() {
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', 'G-2Q8W6M3EFQ');
})();

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

    // ✅ Run hamburger logic only after nav is loaded
    const hamburger = document.getElementById("hamburger");
    const navbar = document.getElementById("navbar");

    if (hamburger && navbar) {
      hamburger.addEventListener("click", () => {
        navbar.classList.toggle("active");
      });
    }
  });

  await include("#include-footer", "components/footer.html");
});
