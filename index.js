const express = require("express");
const coffees = require("./coffees.json");
const oas = require("./oas.json");
const manifest = require("./manifest.json");
const axios = require('axios');

const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require("openai");


dotenv.config({
  path: "./.env",
});

const api_key = process.env.API_KEY;

const configuration = new Configuration({
    apiKey: api_key,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(express.json());

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

app.get("/image" , async (req , res) => {
  
  let template = "smet";
  
  try {
    
    const response = await openai.createImage({
      prompt: "Barber Shop",
      n: 1,
      size: "1024x1024",
    });
    
    res.status(200).send(response.data.data[0].url);
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
})

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

app.post("/assist" , async(req , res) => {

  const {text} = req.body;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k-0613",
    messages: [{"role": "system", "content": "You are a website builder"}, {role: "user", content: text}],
  });

  res.send(completion.data.choices[0].message);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
