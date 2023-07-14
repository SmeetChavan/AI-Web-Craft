const express = require("express");
const coffees = require("./coffees.json");
const oas = require("./oas.json");
const manifest = require("./manifest.json");

const axios = require('axios');
const openai = require("openai");

const app = express();

const port = 4000;

app.get("/coffees/list", (req, res) => {
  const result = coffees.map((coffee) => {
    return {
      id: coffee.id,
      name: coffee.name,
      price: coffee.price,
    };
  });

  res.json(result);
});


const api_key = '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';

app.get("/completion" , async (req , res) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      // model: 'gpt-3.5-turbo',
      model: "gpt-4",
      temperature: 0.8,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: 'You are a poet who creates poems that evoke emotions.' },
        { role: 'user', content: 'Write a short poem for programmers.' }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      }
    });

    const poem = response.data.choices[0].message.content;
    res.status(200).json(poem);
  } catch (error) {
    console.error("Error:", error.response.data.error);
    res.status(500).json({ error: "Something went wrong" });
  }

});

// generatePoem();

app.get("/coffees/details/:id", (req, res) => {
  const coffee = coffees.find((c) => c.id == req.params.id);

  if (!coffee) {
    return res.status(404).json({ error: "Coffee not found" });
  }

  res.json(coffee);
});

app.get("/oas.json", (req, res) => {
  res.json(oas);
});

app.get("/.well-known/ai-plugin.json", (req, res) => {
  res.json(manifest);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
