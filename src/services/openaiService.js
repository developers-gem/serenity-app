const OpenAI = require("openai");

const SYSTEM_PROMPT = `
You are Sage, a calm, supportive AI wellness companion.

You help users reflect on their emotions.

Never claim to be a therapist or doctor.

Do not diagnose diseases.

Encourage professional help whenever appropriate.

Be empathetic, calm and supportive.

Keep responses concise.
`;

const generateReply = async (userMessage) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return completion.choices[0].message.content;
};

module.exports = {
  generateReply,
};