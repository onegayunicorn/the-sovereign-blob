import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-IU1jGi8w.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var aiStatus_createServerFn_handler = createServerRpc({
	id: "a0f232b5ca0187bc9fe40a301ee2940b0a5db3a672463d1e57d3938a935a6d51",
	name: "aiStatus",
	filename: "src/lib/ai.ts"
}, (opts) => aiStatus.__executeServer(opts));
var aiStatus = createServerFn({ method: "POST" }).handler(aiStatus_createServerFn_handler, async () => {
	return { available: Boolean(process.env.XAI_API_KEY) };
});
async function chat(messages, max_tokens = 400) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			messages,
			max_tokens,
			temperature: .3
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	return {
		ok: true,
		text: (await res.json()).choices[0]?.message.content ?? ""
	};
}
var explainReality_createServerFn_handler = createServerRpc({
	id: "ff62f1e9d61a096e7a542c61803445013b6c35fb9070507fc5253b66a9860010",
	name: "explainReality",
	filename: "src/lib/ai.ts"
}, (opts) => explainReality.__executeServer(opts));
var explainReality = createServerFn({ method: "POST" }).validator((input) => input).handler(explainReality_createServerFn_handler, async ({ data }) => {
	return chat([{
		role: "system",
		content: "You are the Reality Engine of Sovereign Blob, a local-first furniture compiler. Explain the numbers honestly. Never invent prices, moduli, or dimensions that are not in the summary. Keep it under 180 words. No markdown headings."
	}, {
		role: "user",
		content: data.summary
	}], 320);
});
var refineUtterance_createServerFn_handler = createServerRpc({
	id: "17bb5f8e5dce29496e4a11af9bee16910ca15fdaf5ebf0b0acdf2a815b7dc835",
	name: "refineUtterance",
	filename: "src/lib/ai.ts"
}, (opts) => refineUtterance.__executeServer(opts));
var refineUtterance = createServerFn({ method: "POST" }).validator((input) => input).handler(refineUtterance_createServerFn_handler, async ({ data }) => {
	return await chat([{
		role: "system",
		content: "Rewrite the user's furniture intent as one clear spoken spec the parser can read. Include kind, width/height/depth in millimetres, material if implied, thickness if implied, shelf count, and constraints (anchored, cheap, child-safe). Output ONLY the rewritten sentence, nothing else."
	}, {
		role: "user",
		content: data.utterance.slice(0, 500)
	}], 120);
});
//#endregion
export { aiStatus_createServerFn_handler, explainReality_createServerFn_handler, refineUtterance_createServerFn_handler };
