import { getToken } from "./auth.js";

// Auto-detect environment
const API_BASE =
  window.location.hostname === "immigrationpathwaysconsulting.com"
    ? "https://immigrationresourcehub.onrender.com"
    : "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const quizButtons = document.querySelectorAll(".quiz-start-btn");
  const quizContainer = document.getElementById("quizContainer");
  const token = getToken();

  if (!token) {
    alert("Please log in to access the quiz.");
    window.location.href = "/login.html";
    return;
  }

  quizButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const count = parseInt(btn.dataset.count);
      try {
        const res = await fetch(`${API_BASE}/api/quiz/random?count=${count}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Could not load quiz questions.");
        const questions = await res.json();

        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error("No quiz questions returned.");
        }

        runQuiz(questions);
      } catch (err) {
        quizContainer.innerHTML = `<p class="error">Error: ${err.message}</p>`;
      }
    });
  });

  function runQuiz(questions) {
    quizContainer.innerHTML = "";
    let current = 0, correct = 0;

    const progressEl = document.createElement("div");
    progressEl.style.marginBottom = "10px";

    const questionEl = document.createElement("div");
    const optionsEl = document.createElement("div");
    const explanationEl = document.createElement("div");
    explanationEl.style.marginTop = "10px";
    explanationEl.style.padding = "10px";
    explanationEl.style.borderLeft = "4px solid var(--accent-color)";
    explanationEl.style.backgroundColor = "#2c2c2e";
    explanationEl.style.fontStyle = "italic";
    explanationEl.style.color = "#ccc";

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.style.marginTop = "10px";
    nextBtn.disabled = true;

    quizContainer.append(progressEl, questionEl, optionsEl, explanationEl, nextBtn);

    function showQuestion(i) {
      const q = questions[i];
      progressEl.innerHTML = `<strong>Question ${i + 1} of ${questions.length}</strong>`;
      questionEl.innerHTML = `<p class="quiz-question">${q.question}</p>`;
      optionsEl.innerHTML = "";
      explanationEl.innerHTML = "";
      nextBtn.disabled = true;

      q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.style.display = "block";
        btn.style.margin = "5px 0";
        btn.style.padding = "8px";
        btn.style.borderRadius = "6px";
        btn.style.border = "1px solid #444";
        btn.style.backgroundColor = "#3a3a3d";
        btn.style.color = "#f0f0f0";
        btn.style.cursor = "pointer";
        btn.style.width = "100%";

        btn.onclick = () => {
          Array.from(optionsEl.children).forEach((button, index) => {
            button.disabled = true;
            if (index === q.correctAnswer) {
              button.style.backgroundColor = "#14532d";
              button.style.borderColor = "#22c55e";
              button.style.color = "#f8f8f8";
            } else if (button === btn) {
              button.style.backgroundColor = "#7f1d1d";
              button.style.borderColor = "#ef4444";
              button.style.color = "#f8f8f8";
            }
          });

          if (idx === q.correctAnswer) correct++;

          explanationEl.innerHTML = `<p>${q.explanation}</p>`;
          nextBtn.disabled = false;
        };

        optionsEl.appendChild(btn);
      });
    }

    nextBtn.onclick = () => {
      if (current < questions.length) {
        showQuestion(current++);
      } else {
        quizContainer.innerHTML = `<h3>You scored ${correct} out of ${questions.length}</h3>`;
        submitScore(correct, questions.length);
      }
    };

    showQuestion(current++);
  }

  async function submitScore(score, total) {
    const token = getToken();
    if (!token) {
      alert("You must be logged in to save your score.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          score,
          totalQuestions: total,
          correctAnswers: score,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Your score has been saved!");
      } else {
        console.error("Save error response:", data);
        alert("Failed to save score: " + data.error);
      }
    } catch (err) {
      alert("Error submitting quiz result: " + err.message);
    }
  }

  async function fetchAndDisplayPastScores() {
    const token = getToken();
    const pastScores = document.getElementById("pastScores");

    if (!pastScores || !token) {
      pastScores.innerHTML = "<p>You must be logged in to view past scores.</p>";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/quiz/results`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid response");

      const scores10 = data.filter(r => r.totalQuestions === 10).slice(0, 2);
      const scores100 = data.filter(r => r.totalQuestions === 100).slice(0, 2);

      const renderScoreList = (scores, label) => `
        <h4 style="margin-top: 1rem;">${label}</h4>
        <ul style="list-style: none; padding-left: 0;">
          ${scores.map(s => `
            <li style="margin-bottom: .5rem;">
              <strong>${s.score}/${s.totalQuestions}</strong>
              <br>
              <small>${new Date(s.date).toLocaleString()}</small>
            </li>
          `).join('')}
        </ul>
      `;

      pastScores.innerHTML = `
        <h3>Your Recent Scores</h3>
        ${renderScoreList(scores10, "10-Question Quizzes")}
        ${renderScoreList(scores100, "100-Question Quizzes")}
      `;
    } catch (err) {
      console.error("Error fetching past scores:", err);
      pastScores.innerHTML = "<p>Error loading past scores.</p>";
    }
  }

  fetchAndDisplayPastScores();
});