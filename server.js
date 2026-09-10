/**
 * AI Lead Qualification Agent
 * ----------------------------
 * An AI agent that receives incoming leads (from a form, chatbot,
 * or CRM webhook), uses Claude to read and understand the lead's
 * message, and returns a structured decision: qualification score,
 * intent summary, and a recommended next action.
 *
 * That decision is then used to drive a workflow automation step
 * (e.g. tag as hot lead, forward to a CRM, or draft a reply) —
 * the same pattern used to plug an AI agent into GoHighLevel,
 * Systeme.io, Zapier, or Make.com scenarios.
 *
 * Flow:
 *   Lead submission -> Claude analyzes intent -> Structured decision
 *      -> Automation action (tag / forward / auto-reply)
 */

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const FORWARD_URL = process.env.FORWARD_URL || null; // e.g. CRM/Zapier/Make.com hook for hot leads

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Ask Claude to read a lead's message and return a structured
 * qualification decision as JSON.
 */
async function qualifyLead(lead) {
  const prompt = `You are a lead qualification agent for a service business.
Analyze the following lead and respond ONLY with a JSON object, no other text.

Lead name: ${lead.fullName}
Lead message: "${lead.message}"

Return JSON in exactly this shape:
{
  "score": <integer 1-10, how likely this lead is ready to buy>,
  "intent": "<one short phrase summarizing what they want>",
  "recommendedAction": "<one of: "hot_lead_alert", "nurture_sequence", "send_pricing", "needs_more_info">",
  "suggestedReply": "<a short, friendly 1-2 sentence reply to send the lead>"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Route the lead based on the agent's decision — this is the
 * "workflow automation" half of the agent.
 */
async function routeLead(lead, decision) {
  if (decision.recommendedAction === "hot_lead_alert" && FORWARD_URL) {
    await fetch(FORWARD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead, decision }),
    }).catch((err) => console.error("Failed to forward hot lead:", err.message));
  }
  // Additional branches (nurture_sequence, send_pricing, etc.) would
  // plug into your CRM/email platform's API or automation webhook here.
}

app.post("/agent/qualify-lead", async (req, res) => {
  const lead = {
    fullName: req.body.full_name || req.body.name || "Unknown",
    email: req.body.email || null,
    message: req.body.message || "",
  };

  if (!lead.email || !lead.message) {
    return res.status(400).json({ error: "Missing required fields: email and message" });
  }

  try {
    const decision = await qualifyLead(lead);
    await routeLead(lead, decision);

    console.log("Lead qualified:", { lead: lead.fullName, decision });

    return res.status(200).json({ status: "success", lead, decision });
  } catch (err) {
    console.error("Agent error:", err.message);
    return res.status(500).json({ error: "Agent failed to process lead" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`AI Lead Qualification Agent running on port ${PORT}`);
});

module.exports = app;
