async function include(selector, url) {
    const element = document.querySelector(selector);
    if (element) {
      const response = await fetch(url);
      const html = await response.text();
      element.innerHTML = html;
    }
  }
  
document.addEventListener("DOMContentLoaded", () => {
    include("#include-nav", "components/nav.html");
    include("#include-footer", "components/footer.html");
});