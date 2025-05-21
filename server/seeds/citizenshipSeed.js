const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Define question schema
const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
  explanation: String,
});

const Question = mongoose.model('Question', questionSchema);

const MONGO_URI = process.env.MONGO_URI;

async function seedDatabase() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is undefined. Check your .env file.");

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB.');

    const dataPath = path.join(__dirname, '../data/final_citizenship_quiz_100.json');
    const questions = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    await Question.deleteMany({});
    console.log('Existing questions removed.');

    await Question.insertMany(questions);
    console.log('Quiz questions inserted successfully.');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

seedDatabase();
