import dotenv from "dotenv";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

dotenv.config();
const app = express();
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Error: GOOGLE_API_KEY is not defined in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-002" });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/test', (req, res) => {
  res.json("server running");
});

app.post('/decompose', async (req, res) => {
  const { task } = req.body;

  if (!task) {
    return res.status(400).json({ error: "task is required" });
  }

  try {

    const decompositionPrompt = `
      Analyze and decompose the following task into clear, actionable sub-tasks.
      Return only a JSON array containing objects with "id" and "description" fields.
      Task: ${task}
    `;

    const result = await model.generateContent(decompositionPrompt);
    const responseText = result.response.text();

    const jsonString = responseText.replace(/```json|```/g, '');
    const subtasks = JSON.parse(jsonString);

    res.json({subtasks});
  } catch (error) {
    console.error("Decomposition error:", error);
    res.status(500).json({ 
      error: "Failed to decompose task",
      details: error.message
    });
  }
});


// // async function main() {
// //    try {
// //       const result = await model.generateContent(prompt);
// //       console.log(result.response.text());
// //    } catch (error) {
// //       console.error("Error:", error);
// //    }
// // }

// // main();


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
