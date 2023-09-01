const express = require("express");
const cors = require('cors');

const { Readable } = require("stream");

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
app.use(cors());

const port = 4000;

app.post("/assist" , async(req , res) => {

  const {text} = req.body;

  let roleOfOpenAI = "DON'T GIVE RESPONSE IN HTML. The response must be in JSON format with necessary attributes like 'title : {decent title}', 'description : {catchy short description of 4 to 5 words}', 'subtitle: {its a subdescription of about 6-7 words}', 'services: [{title: {title of the service offered} , description: {description of the service offered in 9-10 words}}] (I want three elements in this array with different information)'";

  try {

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k-0613",
      messages: [{"role": "system", "content": roleOfOpenAI}, {role: "user", content: text}],
    });

    const generatedResponse = completion.data.choices[0].message;
    const parsedResponse = JSON.parse(generatedResponse.content);

    console.log(parsedResponse);

    const template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders in the template with the extracted data
    let populatedTemplate = template
    .replace("[PROMPT_TITLE]", parsedResponse.title)
    .replace("[PROMPT_DESCRIPTION]", parsedResponse.description)
    .replace("[PROMPT_SUBTITLE]", parsedResponse.subtitle)
    .replace("[SERVICE_1_TITLE]", parsedResponse.services[0].title)
    .replace("[SERVICE_1_DESCRIPTION]", parsedResponse.services[0].description)
    .replace("[SERVICE_2_TITLE]", parsedResponse.services[1].title)
    .replace("[SERVICE_2_DESCRIPTION]", parsedResponse.services[1].description)
    .replace("[SERVICE_3_TITLE]", parsedResponse.services[2].title)
    .replace("[SERVICE_3_DESCRIPTION]", parsedResponse.services[2].description)

    // LOGO IMAGE GENERATION
    const imageResponse1 = await openai.createImage({
      prompt: `logo for my website named ${parsedResponse.title}`,
      n: 1,
      size: "256x256",
    });
    const imageUrl1 = imageResponse1.data.data[0].url;
    populatedTemplate = populatedTemplate.replace(`[LOGO]`, imageUrl1);

    // BANNER IMAGE GENERATION
    const imageResponse2 = await openai.createImage({
      prompt: `SVG Banner for my website titled: ${parsedResponse.title}, and descrption: ${parsedResponse.description}`,
      n: 1,
      size: "512x512",
    });
    const imageUrl2 = imageResponse2.data.data[0].url;
    populatedTemplate = populatedTemplate.replace(`[WELCOME_IMAGE]`, imageUrl2);

    // SERVICES IMAGE GENERATION
    for (let i = 0; i < parsedResponse.services.length; i++) {

      const serviceDescription = parsedResponse.services[i].description;
      const imageResponse = await openai.createImage({
        prompt: `Image of ${serviceDescription}`,
        n: 1,
        size: "512x512",
      });

      const imageUrl = imageResponse.data.data[0].url;

      populatedTemplate = populatedTemplate.replace(`[SERVICE_${i + 1}_IMAGE]`, imageUrl);
    }

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
