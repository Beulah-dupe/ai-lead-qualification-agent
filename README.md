# AI Lead Qualification Agent

An AI agent — powered by Claude — that reads incoming leads, understands their intent, scores how sales-ready they are, and automatically triggers the right next step in your workflow (CRM tagging, hot-lead alerts, auto-replies, or a nurture sequence).

This is a working example of the kind of AI agent + workflow automation systems used to plug Claude into a business's existing stack (GoHighLevel, Systeme.io, Zapier, Make.com, or a custom CRM).

```
Lead comes in (form / chatbot / CRM webhook)
        ↓
Claude reads the message and reasons about intent
        ↓
Structured decision: score, intent, recommended action, suggested reply
        ↓
Automation triggers: hot-lead alert / CRM update / auto-reply / nurture flow
```

## What makes this an "agent" and not just a script

Instead of a rigid keyword-matching rule ("if message contains 'pricing', tag as hot"), Claude reads the lead's actual message, reasons about their intent and urgency, and returns a structured decision the automation layer can act on immediately — no manual review needed.

## Tech Stack

- Node.js + Express
- Claude API (`@anthropic-ai/sdk`)

## Endpoint

### `POST /agent/qualify-lead`

Request body:

```json
{
  "full_name": "Tunde Bakare",
  "email": "tunde@example.com",
  "message": "Hi, I run a small clinic and I'm looking to automate our appointment reminders and follow-ups. We get about 200 patients a month. What would this cost and how soon could we start?"
}
```

Example agent response:

```json
{
  "status": "success",
  "lead": { "fullName": "Tunde Bakare", "email": "tunde@example.com", "message": "..." },
  "decision": {
    "score": 9,
    "intent": "Wants to automate patient reminders and follow-ups",
    "recommendedAction": "hot_lead_alert",
    "suggestedReply": "Thanks for reaching out, Tunde! Automating reminders for 200 patients a month is exactly what we do — happy to hop on a quick call this week to scope it out."
  }
}
```

If `FORWARD_URL` is set, hot leads are automatically forwarded to that endpoint — a CRM, a Slack alert via Zapier, or a Make.com scenario.

## Getting Started

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm start
```

Server runs on `http://localhost:3000`.

## Running the test

```bash
npm test
```

Sends a sample lead through the agent and prints Claude's qualification decision.

## Extending this project

- Add more `recommendedAction` branches (e.g. `send_pricing` triggers a pricing email via your email platform's API)
- Swap the CRM forwarding step for a direct GoHighLevel / Systeme.io / HubSpot API call
- Add a second agent step that drafts a fully personalized follow-up email instead of a one-line reply
- Wrap this endpoint as a custom webhook action inside Make.com or Zapier so it can be dropped into any existing automation

## About

Built as a demonstration of applying Claude as a reasoning layer inside real business workflow automation — the intersection of AI agents and no-code/low-code automation tooling.
