require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;


connectDB();
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Immigration Resource Hub API is running");
});

app.listen(PORT, () => {
    console.log (`Server is running on port ${PORT}`);
})