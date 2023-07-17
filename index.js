const express = require("express");
const coffees = require("./coffees.json");
const oas = require("./oas.json");
const manifest = require("./manifest.json");
const axios = require('axios');

const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require("openai");

const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');

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

  let request = text + " DON'T GIVE RESPONSE IN HTML. The response must be in JSON format with necessary attributes like 'title : {decent title}' and 'description : {catchy short description}'";

  try {

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k-0613",
      messages: [{"role": "system", "content": "You are a website builder who gives response in json"}, {role: "user", content: request}],
    });
    
    const generatedResponse = completion.data.choices[0].message;
    const parsedResponse = JSON.parse(generatedResponse.content);

    const response = {
      title: parsedResponse.title,
      description: parsedResponse.description,
    };

    // console.log(response);
    console.log(parsedResponse);

    // const titleRegex = /<title>(.*?)<\/title>/;
    // const titleMatch = parsedResponse.html.match(titleRegex);
    // const title = titleMatch && titleMatch[1];

    // console.log(title);

    // Read the template file
    const template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders in the template with the extracted data
    const populatedTemplate = template
    .replace("[PROMPT_TITLE]", parsedResponse.title)
    .replace("[PROMPT_DESCRIPTION]", parsedResponse.description)
    .replace("[PROMPT_SUBTITLE]", parsedResponse.subtitle)
    .replace("[PROMPT_BUTTON_TEXT]", parsedResponse.buttonText)
    // .replace("[SERVICE_1_TITLE]", parsedResponse.services[0].name)
    // .replace("[SERVICE_2_TITLE]", parsedResponse.services[1].name)
    // .replace("[SERVICE_3_TITLE]", parsedResponse.services[2].name)
    // .replace("[SERVICE_1_IMAGE]", parsedResponse.serviceImages[0])
    // .replace("[SERVICE_2_IMAGE]", parsedResponse.serviceImages[1])
    // .replace("[SERVICE_3_IMAGE]", parsedResponse.serviceImages[2])
    // .replace("[SERVICE_1_DESCRIPTION]", parsedResponse.serviceDescriptions[0])
    // .replace("[SERVICE_2_DESCRIPTION]", parsedResponse.serviceDescriptions[1])
    // .replace("[SERVICE_3_DESCRIPTION]", parsedResponse.serviceDescriptions[2])
    // .replace("[CTA_BUTTON_TEXT]", parsedResponse.ctaButtonText)
    // .replace("[PANEL_1_TITLE]", parsedResponse.panels[0].title)
    // .replace("[PANEL_1_DESCRIPTION]", parsedResponse.panels[0].description)
    // .replace("[PANEL_2_TITLE]", parsedResponse.panels[1].title)
    // .replace("[PANEL_2_DESCRIPTION]", parsedResponse.panels[1].description)
    // .replace("[DOMAIN_1]", parsedResponse.domains[0])
    // .replace("[DOMAIN_2]", parsedResponse.domains[1]);

    res.set('Content-Type', 'text/html');
    res.send(populatedTemplate);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
