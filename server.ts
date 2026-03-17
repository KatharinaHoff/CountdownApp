import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(express.static("."));

const openai = new OpenAI({
    baseURL: "https://apphubai.wolke.uni-greifswald.de/v1",
    apiKey: process.env.API_TOKEN,
});

const tokenReady = !!process.env.API_TOKEN && process.env.API_TOKEN !== "paste_your_token_here";

// Scenario-specific prompts for the LLM endpoints.
// Keys must match the scenario values in config.js.
const traitSystemPrompts: Record<string, string> = {
    "teaching-end-teacher":
        `You complete a single sentence. The sentence is: ` +
        `"After this, you will no longer have trouble with ___." ` +
        `Fill in the blank with a short, creative, darkly funny noun phrase (5-10 words) ` +
        `describing something that makes a teacher's life miserable: ` +
        `things like chronic late submissions, students who only email at midnight, ` +
        `endless grading, broken projectors, last-minute syllabus changes, ` +
        `or pointless faculty meetings. ` +
        `Examples of the style: "a student who asks if this will be on the exam", ` +
        `"an inbox full of grade disputes on a Sunday evening", ` +
        `"a semester that never ends". ` +
        `Reply with ONLY the noun phrase, lowercase, no punctuation, nothing else.`,

    "teaching-end-student":
        `You complete a single sentence. The sentence is: ` +
        `"After this, you will no longer have trouble with ___." ` +
        `Fill in the blank with a short, creative, darkly funny noun phrase (5-10 words) ` +
        `describing something that makes a student's life miserable: ` +
        `things like impossible exam schedules, professors who post slides the night before, ` +
        `group projects where only one person does the work, ` +
        `library printers that jam, or all-nighters fueled by bad coffee. ` +
        `Examples of the style: "a professor who changes the exam format two days before", ` +
        `"a group project where you are the entire group", ` +
        `"a five-hour exam on a friday morning". ` +
        `Reply with ONLY the noun phrase, lowercase, no punctuation, nothing else.`,

    "grant-deadline":
        `You complete a single sentence. The sentence is: ` +
        `"After this, you will no longer have trouble with ___." ` +
        `Fill in the blank with a short, creative, darkly funny noun phrase (5-10 words) ` +
        `describing something that makes grant writing miserable: ` +
        `things like funding portals that time out, co-authors who disappear before the deadline, ` +
        `budget justifications that never balance, reviewer comments at 11pm, ` +
        `or impact statements for work that has no impact yet. ` +
        `Examples of the style: "a submission portal that crashes at 11:59pm", ` +
        `"a co-author who is unreachable during the final 48 hours", ` +
        `"a budget justification that adds up to the wrong number". ` +
        `Reply with ONLY the noun phrase, lowercase, no punctuation, nothing else.`,

    "thesis-submission":
        `You complete a single sentence. The sentence is: ` +
        `"After this, you will no longer have trouble with ___." ` +
        `Fill in the blank with a short, creative, darkly funny noun phrase (5-10 words) ` +
        `describing something that makes writing and submitting a thesis miserable: ` +
        `things like supervisor feedback arriving at midnight, chapter structures that keep changing, ` +
        `formatting rules that serve no one, reference managers that corrupt at the worst moment, ` +
        `or the existential dread of a methodology section. ` +
        `Examples of the style: "a supervisor who rewrites the introduction the night before submission", ` +
        `"a citation style that exists only to cause suffering", ` +
        `"a chapter that has been rewritten eleven times and still isn't right". ` +
        `Reply with ONLY the noun phrase, lowercase, no punctuation, nothing else.`,

    "thesis-defense":
        `You complete a single sentence. The sentence is: ` +
        `"After this, you will no longer have trouble with ___." ` +
        `Fill in the blank with a short, creative, darkly funny noun phrase (5-10 words) ` +
        `describing something that makes a thesis defense terrifying: ` +
        `things like an external examiner with an unreadable expression, ` +
        `questions about the one thing you didn't prepare for, ` +
        `a projector failure at the worst possible moment, ` +
        `or summarizing five years of work in thirty seconds. ` +
        `Examples of the style: "an examiner who has read your thesis more carefully than you have", ` +
        `"a follow-up question that has no good answer", ` +
        `"five years of work being reduced to a single raised eyebrow". ` +
        `Reply with ONLY the noun phrase, lowercase, no punctuation, nothing else.`,

    "contract-end-boss":
        `You complete a single sentence. The sentence is: ` +
        `"After this, you will no longer have trouble with ___." ` +
        `Fill in the blank with a short, creative, darkly funny noun phrase (5-10 words) ` +
        `describing a specific trait or behavior of a hopelessly incompetent employee ` +
        `whose contract is finally ending: someone who never delivers, makes everything worse, ` +
        `disappears when needed, creates more work than they do, and somehow stayed employed anyway. ` +
        `Examples of the style: "a person who attends every meeting but contributes to none", ` +
        `"a specialist in creating problems they cannot solve", ` +
        `"someone who confidently delivers the wrong thing every single time". ` +
        `Reply with ONLY the noun phrase, lowercase, no punctuation, nothing else.`,

    "contract-end-employee":
        `You complete a single sentence. The sentence is: ` +
        `"After this, you will no longer have trouble with ___." ` +
        `Fill in the blank with a short, creative, darkly funny noun phrase (5-10 words) ` +
        `describing a specific trait or behavior of a toxic or incompetent boss ` +
        `that an employee is finally escaping: things like micromanagement, taking credit for others' work, ` +
        `sending passive-aggressive emails, moving goalposts, or criticizing without ever helping. ` +
        `Examples of the style: "a manager who rewrites your work and calls it an improvement", ` +
        `"a boss who schedules a meeting that could have been an email and then cancels it", ` +
        `"someone who gives feedback that contradicts last week's feedback". ` +
        `Reply with ONLY the noun phrase, lowercase, no punctuation, nothing else.`,
};

const initialImageSystemPrompts: Record<string, string> = {
    "teaching-end-teacher":
        `You write a single vivid text-to-image prompt. ` +
        `The subject is a teacher who is exhausted and desperate, ` +
        `buried under ungraded exams, impossible deadlines, and endless admin, ` +
        `counting down days until the semester ends. ` +
        `Describe the scene, lighting, mood, and visual style in 15-25 words. ` +
        `Reply with ONLY the image prompt, nothing else.`,

    "teaching-end-student":
        `You write a single vivid text-to-image prompt. ` +
        `The subject is a student who is completely overwhelmed, ` +
        `cramming for exams in a cluttered study space, running on no sleep, ` +
        `surrounded by notes and empty coffee cups, counting down to the end. ` +
        `Describe the scene, lighting, mood, and visual style in 15-25 words. ` +
        `Reply with ONLY the image prompt, nothing else.`,

    "grant-deadline":
        `You write a single vivid text-to-image prompt. ` +
        `The subject is a researcher at 3am, desperate and exhausted, ` +
        `surrounded by draft printouts and empty coffee cups, ` +
        `furiously writing a grant proposal before the funding deadline. ` +
        `Describe the scene, lighting, mood, and visual style in 15-25 words. ` +
        `Reply with ONLY the image prompt, nothing else.`,

    "thesis-submission":
        `You write a single vivid text-to-image prompt. ` +
        `The subject is a PhD student in the final days before thesis submission — ` +
        `exhausted, surrounded by printed drafts with red corrections, empty coffee cups, ` +
        `and a laptop showing a document that never seems finished. ` +
        `Describe the scene, lighting, mood, and visual style in 15-25 words. ` +
        `Reply with ONLY the image prompt, nothing else.`,

    "thesis-defense":
        `You write a single vivid text-to-image prompt. ` +
        `The subject is a PhD student the night before their thesis defense — ` +
        `alone in a room, rehearsing their presentation, surrounded by notes, ` +
        `visibly terrified but determined, the weight of five years on their face. ` +
        `Describe the scene, lighting, mood, and visual style in 15-25 words. ` +
        `Reply with ONLY the image prompt, nothing else.`,

    "contract-end-boss":
        `You write a single vivid text-to-image prompt. ` +
        `The subject is an exhausted manager who has spent months covering for an incompetent employee — ` +
        `staying late, fixing invisible damage, holding the team together, counting the days. ` +
        `Describe the scene, lighting, mood, and visual style in 15-25 words. ` +
        `Reply with ONLY the image prompt, nothing else.`,

    "contract-end-employee":
        `You write a single vivid text-to-image prompt. ` +
        `The subject is a worker who has been enduring a toxic or incompetent boss for too long — ` +
        `micromanaged, exhausted, quietly counting down the days until they can leave. ` +
        `Describe the scene, lighting, mood, and visual style in 15-25 words. ` +
        `Reply with ONLY the image prompt, nothing else.`,
};

const fallbackScenario = "teaching-end-teacher";

app.get("/api/status", (_req, res) => {
    res.json({ tokenReady });
});

app.get("/api/trait", async (req, res) => {
    if (!tokenReady) {
        res.status(403).json({ error: "No API token configured." });
        return;
    }

    const scenario = (req.query.scenario as string) || fallbackScenario;
    const systemPrompt = traitSystemPrompts[scenario] ?? traitSystemPrompts[fallbackScenario];

    try {
        const response = await openai.chat.completions.create({
            model: "gemma3:27b",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Give me a new one." },
            ],
        });

        const trait = response.choices[0].message.content?.trim().toLowerCase().replace(/[."']/g, "");
        res.json({ trait });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Trait generation failed" });
    }
});

app.get("/api/initial-prompt", async (req, res) => {
    if (!tokenReady) {
        res.status(403).json({ error: "No API token configured." });
        return;
    }

    const scenario = (req.query.scenario as string) || fallbackScenario;
    const systemPrompt = initialImageSystemPrompts[scenario] ?? initialImageSystemPrompts[fallbackScenario];

    try {
        const response = await openai.chat.completions.create({
            model: "gemma3:27b",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate the prompt." },
            ],
        });

        const prompt = response.choices[0].message.content?.trim() ?? "";
        res.json({ prompt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Prompt generation failed" });
    }
});

app.post("/api/generate", async (req, res) => {
    if (!tokenReady) {
        res.status(403).json({ error: "No API token configured. See README.md." });
        return;
    }
    const { prompt } = req.body as { prompt: string };

    if (!prompt) {
        res.status(400).json({ error: "prompt is required" });
        return;
    }

    try {
        const response = await openai.images.generate({
            model: "black-forest-labs/FLUX.1-schnell",
            prompt,
            size: "512x512",
            response_format: "b64_json",
        });

        res.json({ image: response.data?.[0]?.b64_json });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Image generation failed" });
    }
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
