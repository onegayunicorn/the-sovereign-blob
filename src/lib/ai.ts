import { createServerFn } from "@tanstack/react-start";

export const aiStatus = createServerFn({ method: "POST" }).handler(async () => {
  return { available: Boolean(process.env.XAI_API_KEY) };
});

async function chat(messages: { role: "system" | "user"; content: string }[], max_tokens = 400) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      messages,
      max_tokens,
      temperature: 0.3,
    }),
  });
  if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
  const body = (await res.json()) as { choices: { message: { content: string } }[] };
  return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
}

export const explainReality = createServerFn({ method: "POST" })
  .validator((input: { summary: string }) => input)
  .handler(async ({ data }) => {
    return chat(
      [
        {
          role: "system",
          content:
            "You are the Reality Engine of Sovereign Blob, a local-first furniture compiler. Explain the numbers honestly. Never invent prices, moduli, or dimensions that are not in the summary. Keep it under 180 words. No markdown headings.",
        },
        { role: "user", content: data.summary },
      ],
      320,
    );
  });

export const refineUtterance = createServerFn({ method: "POST" })
  .validator((input: { utterance: string }) => input)
  .handler(async ({ data }) => {
    const result = await chat(
      [
        {
          role: "system",
          content:
            "Rewrite the user's furniture intent as one clear spoken spec the parser can read. Include kind, width/height/depth in millimetres, material if implied, thickness if implied, shelf count, and constraints (anchored, cheap, child-safe). Output ONLY the rewritten sentence, nothing else.",
        },
        { role: "user", content: data.utterance.slice(0, 500) },
      ],
      120,
    );
    return result;
  });
