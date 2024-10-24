
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint to save a translation
app.post("/api/translations", async (req, res) => {
  const { original_message, translated_message, language, model } = req.body;

  // Validate input
  if (!original_message || !translated_message || !language || !model) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("translations")
      .insert([{ original_message, translated_message, language, model }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch previous translations
app.get("/api/translations", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
// const express = require("express");
// const cors = require("cors");
// const { createClient } = require("@supabase/supabase-js");
// require("dotenv").config();
// const axios = require("axios");

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Supabase client setup
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// // Endpoint to save a translation
// app.post("/api/translations", async (req, res) => {
//   const { original_message, translated_message, language, model } = req.body;

//   // Validate input
//   if (!original_message || !translated_message || !language || !model) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("translations")
//       .insert([{ original_message, translated_message, language, model }]);

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
//     res.status(201).json(data);
//   } catch (error) {
//     console.error("Error saving translation:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Endpoint to fetch previous translations
// app.get("/api/translations", async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("translations")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(5);

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error fetching translations:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Endpoint to compare translations
// app.post("/api/compareTranslate", async (req, res) => {
//   const { message, sourceLanguage, destinationLanguage, models } = req.body;

//   if (!message || !sourceLanguage || !destinationLanguage || !models || models.length === 0) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const translations = await Promise.all(
//       models.map(async (model) => {
//         // Mock translation logic - replace this with actual API calls
//         const translatedText = await mockTranslate(model, message, sourceLanguage, destinationLanguage);
//         return {
//           model,
//           original: message,
//           translated: translatedText,
//           score: Math.random(), // Replace with actual scoring logic if available
//         };
//       })
//     );

//     res.json({ validatedTranslations: translations });
//   } catch (error) {
//     console.error("Error in translation comparison:", error);
//     res.status(500).json({ error: "Translation comparison failed." });
//   }
// });

// // Mock translation function (replace this with actual translation API calls)
// const mockTranslate = async (model, text, sourceLang, destLang) => {
//   // Simulate different translations based on model name
//   return `${text} [Translated by ${model}]`;
// };

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
