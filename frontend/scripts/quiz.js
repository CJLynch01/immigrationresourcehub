import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const quizBtn = document.getElementById("startQuizBtn");
  const quizContainer = document.getElementById("quizContainer");

  quizBtn.addEventListener("click", async () => {
    try {
      const count = confirm("Take full 100-question quiz?") ? 100 : 10;
      const res = await fetch(`/api/quiz/random?count=${count}`);
      if (!res.ok) throw new Error("Failed to fetch quiz questions.");
      const questions = await res.json();
      runQuiz(questions);
    } catch (err) {
      quizContainer.innerHTML = `<p class="error">Could not load quiz: ${err.message}</p>`;
    }
  });

  function runQuiz(questions) {
    quizContainer.innerHTML = "";
    let current = 0, correct = 0;

    const questionEl = document.createElement("div");
    const optionsEl = document.createElement("div");
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.style.marginTop = "10px";
    nextBtn.disabled = true;

    quizContainer.append(questionEl, optionsEl, nextBtn);

    function showQuestion(i) {
      const q = questions[i];
      questionEl.innerHTML = `<strong>Q${i + 1}:</strong> ${q.question}`;
      optionsEl.innerHTML = "";
      nextBtn.disabled = true;

      q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => {
          if (idx === q.correctAnswer) correct++;
          nextBtn.disabled = false;
        };
        btn.style.display = "block";
        btn.style.margin = "5px 0";
        optionsEl.appendChild(btn);
      });
    }

    nextBtn.onclick = () => {
      if (current < questions.length) {
        showQuestion(current++);
      } else {
        quizContainer.innerHTML = `<h3>You scored ${correct} out of ${questions.length}</h3>`;
        saveScore(correct, questions.length);
      }
    };

    showQuestion(current++);
  }

  async function saveScore(score, total) {
    const token = getToken();
    if (!token) {
      alert("You must be logged in to save your score.");
      return;
    }

    try {
      const res = await fetch("/api/quiz/submit", {
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
        alert("Score saved successfully!");
      } else {
        alert("Error saving score: " + data.error);
      }
    } catch (err) {
      alert("Error submitting quiz result: " + err.message);
    }
  }
});