document.addEventListener("DOMContentLoaded", () => {
    const toolbar = document.querySelector(".markdown-toolbar");
    const textarea = document.getElementById("content");
  
    if (!toolbar || !textarea) return;
  
    toolbar.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      const action = e.target.dataset.md;
      const { selectionStart, selectionEnd, value } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      let insert = "";
  
      switch (action) {
        case "bold":
          insert = `**${selected || "bold text"}**`;
          break;
        case "italic":
          insert = `*${selected || "italic text"}*`;
          break;
        case "h1":
          insert = `# ${selected || "Heading 1"}`;
          break;
        case "h2":
          insert = `## ${selected || "Heading 2"}`;
          break;
        case "ul":
          insert = `- ${selected || "List item"}`;
          break;
        case "ol":
          insert = `1. ${selected || "List item"}`;
          break;
        case "link":
          const url = prompt("Enter URL:", "https://");
          insert = `[${selected || "link text"}](${url})`;
          break;
      }
  
      textarea.setRangeText(insert, selectionStart, selectionEnd, "end");
      textarea.focus();
    });
  });