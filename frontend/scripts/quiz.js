import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const startQuizBtn = document.getElementById("startQuizBtn");
  const quizContainer = document.getElementById("quizContainer");

  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", async () => {
      const count = confirm("Would you like to take the full 100-question quiz?") ? 100 : 10;
      const res = await fetch(`/api/quiz/random?count=${count}`);
      const questions = await res.json();
      renderQuiz(questions);
    });
  }

  function renderQuiz(questions) {
    quizContainer.innerHTML = "";
    quizContainer.style.display = "block";

    let current = 0;
    let correct = 0;

    const questionEl = document.createElement("div");
    const optionsEl = document.createElement("div");
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.style.marginTop = "10px";

    quizContainer.appendChild(questionEl);
    quizContainer.appendChild(optionsEl);
    quizContainer.appendChild(nextBtn);

    function showQuestion(index) {
      const q = questions[index];
      questionEl.innerHTML = `<strong>Question ${index + 1}:</strong> ${q.question}`;
      optionsEl.innerHTML = "";

      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.style.margin = "5px";
        btn.onclick = () => {
          if (i === q.correctAnswer) correct++;
          nextBtn.click();
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

  async function submitScore(score, totalQuestions) {
    const token = getToken();
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        score,
        totalQuestions,
        correctAnswers: score,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Your score was saved.");
    } else {
      alert("Failed to save score: " + data.error);
    }
  }
});