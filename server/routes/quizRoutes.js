const express = require('express');
const router = express.Router();
const Question = require('../models/questions100');
const QuizResult = require('../models/quizResult');
const { verifyToken } = require('../middleware/auth'); // ✅ fixed

// GET /api/quiz/random
router.get('/random', verifyToken, async (req, res) => {
  let count = parseInt(req.query.count) || 10;

  try {
    if (count <= 0 || count > 100) count = 10;

    if (count === 100) {
        const questions = await Question.aggregate([{ $sample: { size: 100 } }]);
        return res.json(questions);
    }


    const questions = await Question.aggregate([{ $sample: { size: count } }]);
    res.json(questions);
  } catch (err) {
    console.error('Error fetching quiz questions:', err);
    res.status(500).json({ error: 'Server error fetching quiz questions' });
  }
});

// POST /api/quiz/submit (secure)
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { score, totalQuestions, correctAnswers } = req.body;

    if (score == null || totalQuestions == null || correctAnswers == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newResult = new QuizResult({
      userId: req.user.id,
      score,
      totalQuestions,
      correctAnswers
    });

    await newResult.save();
    res.status(201).json({ message: 'Quiz result saved successfully' });
  } catch (err) {
    console.error('Error saving quiz result:', err);
    res.status(500).json({ error: 'Server error saving quiz result' });
  }
});

router.get('/results', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Fetch all results for the user
    const allResults = await QuizResult.find({ userId }).sort({ date: -1 });

    // Group by totalQuestions (10 or 100)
    const grouped = { 10: [], 100: [] };

    for (const result of allResults) {
      if (result.totalQuestions === 10 || result.totalQuestions === 100) {
        grouped[result.totalQuestions].push(result);
      }
    }

    // Keep only top 2 of each
    const trimmedResults = [
      ...grouped[10].slice(0, 2),
      ...grouped[100].slice(0, 2),
    ];

    // Optional: delete the rest from DB
    const idsToKeep = trimmedResults.map(r => r._id.toString());
    await QuizResult.deleteMany({
      userId,
      _id: { $nin: idsToKeep }
    });

    res.json(trimmedResults);
  } catch (err) {
    console.error("Error fetching quiz results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

module.exports = router;