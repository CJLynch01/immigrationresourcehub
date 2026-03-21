import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

const API = import.meta.env.VITE_API_BASE_URL || "";

export default function Quiz() {
  useSEO({
    title: "U.S. Citizenship Practice Quiz",
    description:
      "Practice for your U.S. naturalization civics test with our 10 or 100 question citizenship quiz.",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [phase, setPhase] = useState("menu"); // menu | loading | quiz | results
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null); // index of chosen option
  const [correct, setCorrect] = useState(0);
  const [pastScores, setPastScores] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPastScores();
  }, []);

  async function fetchPastScores() {
    try {
      const res = await fetch(`${API}/api/quiz/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPastScores(data);
    } catch {
      // non-fatal
    }
  }

  async function startQuiz(count) {
    setPhase("loading");
    setLoadError("");
    try {
      const res = await fetch(`${API}/api/quiz/random?count=${count}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load quiz questions.");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("No questions returned.");
      setQuestions(data);
      setCurrent(0);
      setCorrect(0);
      setSelected(null);
      setPhase("quiz");
    } catch (err) {
      setLoadError(err.message);
      setPhase("menu");
    }
  }

  function handleAnswer(idx) {
    if (selected !== null) return; // already answered
    setSelected(idx);
    if (idx === questions[current].correctAnswer) {
      setCorrect((c) => c + 1);
    }
  }

  async function handleNext() {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      // Quiz finished — submit score
      const finalCorrect = selected === questions[current].correctAnswer
        ? correct
        : correct;
      await submitScore(correct, questions.length);
      setPhase("results");
      fetchPastScores();
    }
  }

  async function submitScore(score, total) {
    try {
      await fetch(`${API}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, totalQuestions: total, correctAnswers: score }),
      });
    } catch {
      // non-fatal
    }
  }

  const q = questions[current];
  const scores10 = pastScores.filter((r) => r.totalQuestions === 10);
  const scores100 = pastScores.filter((r) => r.totalQuestions === 100);

  return (
    <section>
      <header className="site-header">
        <h1>U.S. Citizenship Practice Quiz</h1>
        <p>Prepare for your naturalization civics test</p>
      </header>

      <main className="quiz-page">
        <div className="quiz-wrapper">

          {/* NOTE */}
          <div className="note">
            <strong>Note:</strong> This quiz covers 97 out of the 100 official
            civics questions for the U.S. naturalization test. The remaining 3
            depend on where you live and are not included:
            <ul>
              <li>What is the capital of your state?</li>
              <li>Who is the Governor of your state now?</li>
              <li>Name your U.S. Representative.</li>
            </ul>
            <p>Be sure to find out the correct answers before your interview.</p>
          </div>

          {/* MENU */}
          {phase === "menu" && (
            <>
              {loadError && <p className="form-message form-message--error">{loadError}</p>}
              <div className="quiz-options">
                <button className="button quiz-btn" onClick={() => startQuiz(10)}>
                  Take 10-Question Quiz
                </button>
                <button className="button quiz-btn" onClick={() => startQuiz(100)}>
                  Take Full 100-Question Quiz
                </button>
              </div>

              {/* Past scores */}
              {pastScores.length > 0 && (
                <div className="quiz-results">
                  <h3>Your Recent Scores</h3>
                  {scores10.length > 0 && (
                    <>
                      <h4>10-Question Quizzes</h4>
                      <ul className="score-list">
                        {scores10.map((s) => (
                          <li key={s._id}>
                            <strong>{s.score}/{s.totalQuestions}</strong>
                            <span>{new Date(s.date).toLocaleDateString()}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {scores100.length > 0 && (
                    <>
                      <h4>100-Question Quizzes</h4>
                      <ul className="score-list">
                        {scores100.map((s) => (
                          <li key={s._id}>
                            <strong>{s.score}/{s.totalQuestions}</strong>
                            <span>{new Date(s.date).toLocaleDateString()}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* LOADING */}
          {phase === "loading" && <p>Loading questions&hellip;</p>}

          {/* QUIZ */}
          {phase === "quiz" && q && (
            <div className="quiz-box">
              <p className="quiz-progress">
                <strong>Question {current + 1} of {questions.length}</strong>
              </p>
              <p className="quiz-question">{q.question}</p>
              <div className="quiz-options-list">
                {q.options.map((opt, idx) => {
                  let cls = "quiz-option";
                  if (selected !== null) {
                    if (idx === q.correctAnswer) cls += " correct";
                    else if (idx === selected) cls += " incorrect";
                  }
                  return (
                    <button
                      key={idx}
                      className={cls}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="quiz-explanation">
                  <p>{q.explanation}</p>
                </div>
              )}

              {selected !== null && (
                <button className="button quiz-btn" onClick={handleNext}>
                  {current + 1 < questions.length ? "Next Question" : "See Results"}
                </button>
              )}
            </div>
          )}

          {/* RESULTS */}
          {phase === "results" && (
            <div className="quiz-box">
              <h2>Quiz Complete!</h2>
              <p className="quiz-final-score">
                You scored <strong>{correct}</strong> out of{" "}
                <strong>{questions.length}</strong>
                {" "}({Math.round((correct / questions.length) * 100)}%)
              </p>
              <button
                className="button quiz-btn"
                onClick={() => setPhase("menu")}
              >
                Take Another Quiz
              </button>
            </div>
          )}

        </div>
      </main>
    </section>
  );
}
