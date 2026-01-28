import { NextResponse } from "next/server";

type ReqBody = {
  messages?: Array<{ role?: string; content?: string }>;
  model?: string;
};

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json().catch(() => ({}));
  const { messages = [], model } = body;

    const apiUrl = process.env.MISTRAL_API_URL;
    const apiKey = process.env.MISTRAL_API_KEY;

    // If no external API configured, return a safe mock response for development
    if (!apiUrl || !apiKey) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "Hola";
      const text = `Respuesta mock del modelo a: ${lastUser}`;
      return NextResponse.json({ text, mocked: true });
    }

    // Decide which model to use: prefer explicit body model, else env var, else fallback.
    const modelToUse = model ?? process.env.MISTRAL_MODEL ?? null;

    // Forward request to configured Mistral endpoint.
    // We forward `model` and `messages` in the body so the external API can interpret them.
    // Adjust the payload structure below to match your Mistral provider if necessary.
    const payload: { messages: Array<{ role?: string; content?: string }>; model?: string; agent_id?: string } = { messages };
    // If using the agents completions endpoint, include agent_id.
    // Otherwise, include the model parameter.
    if (apiUrl?.includes("/agents/completions")) {
      if (process.env.MISTRAL_MODEL) {
        payload.agent_id = process.env.MISTRAL_MODEL;
      }
    } else if (modelToUse) {
      payload.model = modelToUse;
    }

    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    // Try to extract a readable text from common response shapes. If unsure, include raw data.
    let text: string | null = null;
    if (typeof data === "string") text = data;
    else if (data.output && typeof data.output === "string") text = data.output;
    else if (Array.isArray(data.output) && data.output.length > 0) text = String(data.output[0]);
    else if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content)
      text = String(data.choices[0].message.content);
    else if (data.text) text = String(data.text);

    return NextResponse.json({ text: text ?? null, raw: data });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
