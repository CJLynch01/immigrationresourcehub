import { getToken } from "./auth.js";

// Auto-detect environment
const API_BASE =
  window.location.hostname === "immigrationpathwaysconsulting.com"
    ? "https://immigrationresourcehub.onrender.com"
    : "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const quizButtons = document.querySelectorAll(".quiz-start-btn");
  const quizContainer = document.getElementById("quizContainer");

  quizButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const count = parseInt(btn.dataset.count);
      try {
        const res = await fetch(`${API_BASE}/api/quiz/random?count=${count}`);
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
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.style.marginTop = "10px";
    nextBtn.disabled = true;

    quizContainer.append(progressEl, questionEl, optionsEl, nextBtn);

    function showQuestion(i) {
      const q = questions[i];
      progressEl.innerHTML = `<strong>Question ${i + 1} of ${questions.length}</strong>`;
      questionEl.innerHTML = `<p class="quiz-question">${q.question}</p>`;
      optionsEl.innerHTML = "";
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
              button.style.backgroundColor = "#14532d"; // green
              button.style.borderColor = "#22c55e";
              button.style.color = "#f8f8f8";
            } else if (button === btn) {
              button.style.backgroundColor = "#7f1d1d"; // red
              button.style.borderColor = "#ef4444";
              button.style.color = "#f8f8f8";
            }
          });

          if (idx === q.correctAnswer) correct++;
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
        alert("Failed to save score: " + data.error);
      }
    } catch (err) {
      alert("Error submitting quiz result: " + err.message);
    }
  }
});