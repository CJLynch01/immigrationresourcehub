const express = require('express');
const router = express.Router();
const Question = require('../models/questions100');
const QuizResult = require('../models/quizResult');
const { verifyToken } = require('../middleware/auth'); // ✅ fixed

// GET /api/quiz/random
router.get('/random', async (req, res) => {
  let count = parseInt(req.query.count) || 10;

  try {
    if (count <= 0 || count > 100) count = 10;

    if (count === 100) {
      const questions = await Question.find().sort({ _id: 1 });
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
      userId: req.user._id,
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

module.exports = router;