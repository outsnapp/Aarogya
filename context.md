# Aarogya — Context & Detailed Product Spec

> One-file, hackathon-ready blueprint for a 24-hour build: features, screens, UI copy, animations, tech stack, SMS flow, and demo script.

---

## 1. Product summary (one line)

**Aarogya** — A revolutionary voice-first AI companion that predicts postpartum complications before they become serious. Features **AI pattern recognition**, **real-time family network activation**, and **direct ASHA worker integration**. Works via voice + SMS to reach rural users. Focus: **Predictive health monitoring**, **Voice-first interaction**, **Family network safety**.

---

## 2. Priority scope for 20-hour MVP (unique USPs only)

* **UNIQUE CORE FEATURES** (must-build - our competitive advantage):

  1. **AI-Powered Postpartum Recovery Timeline** — Personalized daily recovery milestones based on delivery type, age, and health history. Shows "You're on track" with specific next steps.
  2. **Smart Symptom Pattern Recognition** — Learns from user's daily inputs to predict potential issues before they become serious (e.g., "Your bleeding pattern suggests you should rest more today").
  3. **Voice-First Check-ins** — Speak symptoms in Hindi/English, get instant voice responses. Perfect for hands-free operation while caring for baby.
  4. **Emergency Family Network** — Auto-alerts family members when red flags detected, with location sharing and medical history summary.
  5. **ASHA Worker Integration** — Real-time connection to local health workers who can see your progress and intervene proactively.
* **Supporting features**: Basic dashboard, SMS fallback, simple baby tracking.

---

## 3. Colour palette & typography

* Palette (pastels):

  * **Background (soft cream)**: `#FFF8F3`
  * **Primary (soft teal)**: `#A8E6CF` (used for success/positive accents)
  * **Secondary (pastel pink)**: `#FFD1DC` (warm maternal accent)
  * **Warning (pastel amber)**: `#FFE9A8`
  * **Danger (muted coral)**: `#FFB4AB` (for red-flag highlights)
  * **Text primary**: `#2F2F2F`
  * **Muted text**: `#6B6B6B`
* Typography:

  * Headlines: `Inter` or `Poppins` (rounded, friendly)
  * Body: `Noto Sans` (good for Indian scripts)
* Icons: rounded line icons (Heroicons / lucide) with 2px stroke

---

## 4. Micro-interaction & animation guidelines

* Use subtle, friendly animations (Framer Motion recommended):

  * **Screen transition**: slide up + fade (200–300ms).
  * **Button tap**: scale to `0.96` for 80ms then back.
  * **Progress bar fill**: elastic easing (400ms) with tiny bounce.
  * **Red-flag alert**: pulse outer ring (slow) + gentle shake of alert card (if urgent) — don’t be scary.
  * **Avatar growth** (baby plant): animate leaf scale each milestone.
* Use 2xl rounded corners and soft shadows for cards.

---

## 5. Tech stack (optimized for unique voice-first features)

* Frontend: **Next.js + React + Tailwind CSS + shadcn components** (integrates well)
* Voice Recognition: **Web Speech API** (browser native) + **Google Cloud Speech-to-Text** (fallback)
* Voice Synthesis: **Web Speech API** (browser native) + **Google Cloud Text-to-Speech** (fallback)
* Animations: **Framer Motion** for smooth voice interactions and AI insights
* Backend: **FastAPI** (Python) with **WebSocket** support for real-time voice processing
* Database: **Supabase** (hosted, quick) with real-time subscriptions for family notifications
* SMS: **Twilio** (quick signup; Twilio sandbox/Trial ok for demo)
* AI / Pattern Recognition: **OpenAI GPT-4** for natural language processing + custom pattern analysis algorithms
* Real-time Communication: **WebRTC** for ASHA worker video calls
* Hosting: Vercel for frontend, Cursor runner for backend, ngrok for local webhooks during demo

---

## 6. Data model (enhanced for unique features)

* `user`:

  * id, name, phone, language, dob (mother), delivery\_type (normal/c-section), voice\_enabled, created\_at
* `emergency_contacts`:

  * id, user\_id, name, phone, relationship, is\_primary, notification\_enabled, created\_at
* `daily_checkin`:

  * id, user\_id, date, voice\_transcript, symptoms (json list), mood\_score (1-5), energy\_score (1-5), sleep\_hours, notes, risk\_level (green/yellow/red), ai\_insights (json), created\_at
* `recovery_timeline`:

  * id, user\_id, phase, day\_number, milestone, predicted\_date, achieved\_date, personalized\_tip, created\_at
* `pattern_analysis`:

  * id, user\_id, pattern\_type (bleeding/mood/energy/sleep), trend\_data (json), prediction, confidence\_score, created\_at
* `asha_workers`:

  * id, name, phone, specialization, rating, status (online/offline), user\_id (assigned), created\_at
* `family_notifications`:

  * id, user\_id, contact\_id, notification\_type, message, sent\_at, status (sent/delivered/read)
* `alerts`:

  * id, user\_id, checkin\_id, level, message, family\_notified, asha\_contacted, created\_at

---

## 7. Core screens (designed to be built in 20 hours)

We limit to **8 screens** plus voice/SMS channels. Each screen focuses on our unique USPs with detailed microcopy, contents, and animation notes.

### Screen 0 — Launch / Splash

* **Purpose:** Brand impression and fast load.
* **Contents:** App logo (simple pastel flower + "Aarogya" wordmark), short tagline: *"Aarogya — Care for Maa & Baby"*.
* **Text:** `Welcome to Aarogya` (sub) `Care for Maa & Baby` (tagline)
* **Animation:** Logo scales from 0.8 → 1 with fade-in, small bounce (400ms). Background gradient shift slow.
* **Transition:** After 1.2s -> onboarding screen.

### Screen 1 — Voice-First Onboarding (Profile Setup)

* **Purpose:** Revolutionary voice-first onboarding that feels like talking to a caring friend.
* **Fields to collect (in this order, minimal):** Name, Phone, Mother DOB, Baby DOB, Delivery Type, Emergency Contacts (2-3 family members), Preferred Language, Voice/SMS consent.
* **Layout:** Large microphone button in center, voice waveform animation, text transcription below. Show progress: "Step 2 of 7" with pastel fill.
* **Exact microcopy flow (voice prompts):**

  1. `👋 Namaste! I am Aarogya — your AI postnatal companion. You can speak to me in Hindi or English. What should I call you?` (voice input)
  2. `Thank you, {Name}! I need your phone number for emergency alerts. Please say it slowly.` (voice input with number recognition)
  3. `When did your little one arrive? Please say the date.` (voice input with date parsing)
  4. `How did you deliver your baby? Please say "normal delivery" or "C-section".` (voice input)
  5. `Who should I contact in emergencies? Please say their name and relationship, like "My husband Rajesh" or "My mother Sita".` (voice input for 2-3 contacts)
  6. `Which language do you prefer for our conversations?` (options: `हिन्दी`, `English`)
  7. `Can I send you voice messages and SMS alerts?` (Yes / No)
* **Animations:** Microphone pulses when listening, waveform animation, gentle voice-to-text typing effect.
* **UX tips:** Show confidence score for voice recognition, allow text fallback if voice fails.

### Screen 2 — AI Recovery Timeline Preview

* **Purpose:** Show the unique AI-powered recovery timeline that adapts to each mother's journey.
* **Contents:** Interactive timeline showing personalized recovery milestones:

  1. `Week 1-2: Healing Phase` — `Your body is recovering. Focus on rest and gentle movement.` (icon: healing heart)
  2. `Week 3-4: Energy Building` — `You'll start feeling stronger. Light walks and bonding time.` (icon: growing plant)
  3. `Month 2-3: New Normal` — `Finding your rhythm with baby. Self-care becomes easier.` (icon: balanced scales)
* **Bottom CTA:** `Start your personalized journey` (primary). Secondary: `Skip tutorial`.
* **Animation:** Timeline cards slide in with progress indicators, personalized based on delivery type and current date.

### Screen 3 — AI Recovery Dashboard (Primary USP showcase)

* **Purpose:** Show personalized AI insights and recovery progress with smart predictions.
* **Top header:** Greeting: `Good morning, {Name} 🌼` with voice button and small avatar.
* **Main AI Insights Card:**

  * **Recovery Status**: `You're 65% through your healing phase` with progress bar
  * **Today's Focus**: `Rest more today - your bleeding pattern suggests you need extra care` (AI-generated insight)
  * **Predicted Milestone**: `In 3 days, you should feel strong enough for 10-minute walks`
  * **Voice Check-in**: Large microphone button `Speak to Aarogya` (primary action)
* **Smart Alerts Section:**

  * **Pattern Alert**: `Your mood has been low for 2 days. Would you like to talk?` (yellow)
  * **Progress Celebration**: `Great! Your energy levels are improving` (green)
  * **Family Network**: `Your husband Rajesh was notified of your progress` (blue)
* **Quick Actions**: `Voice Check-in`, `View Timeline`, `Contact ASHA Worker`, `Emergency`
* **Animations:** AI insights fade in with typing effect, voice button pulses gently, progress bars animate with elastic easing.

### Screen 4 — Voice-First Check-in (Revolutionary UX)

* **Purpose:** Natural conversation with AI that understands context and patterns.
* **Structure:** Large microphone button with voice waveform, text transcription below.
* **Voice conversation flow:**

  * **AI**: `Namaste {Name}! How are you feeling today? You can tell me anything.`
  * **User speaks**: Natural language about symptoms, mood, concerns
  * **AI processes**: Real-time transcription + pattern analysis
  * **AI responds**: `I understand you're feeling tired and have some bleeding. Let me ask a few more questions...`
* **Smart follow-up questions (voice):**

  * `How heavy is the bleeding compared to yesterday?`
  * `Are you feeling more emotional than usual?`
  * `How is your baby doing?`
  * `Do you have support at home today?`
* **AI Analysis & Response:**

  * **Pattern Recognition**: `I notice your energy has been low for 3 days. This is normal, but let's watch it.`
  * **Personalized Advice**: `Based on your C-section recovery, you should avoid lifting heavy things for 2 more weeks.`
  * **Family Alert**: `Should I let your husband know you need extra rest today?`
* **Risk Assessment with Voice Response:**

  * **Green**: `You're doing well! Your recovery is on track. I'll check in tomorrow.`
  * **Yellow**: `I'm a bit concerned. Let me send some tips to your phone and check in again tonight.`
  * **Red**: `This needs attention. I'm calling your emergency contact and connecting you with an ASHA worker.`
* **Animations:** Voice waveform pulses, text appears with typing effect, AI responses have gentle voice synthesis.

### Screen 5 — Smart Alert & Family Network Activation

* **Purpose:** When AI detects concerning patterns, activate family network and provide personalized guidance.
* **Top:** `AI Alert: {pattern detected} — {personalized concern}`
* **Sections:**

  * **Pattern Analysis**: `Your bleeding has increased 40% over 3 days. This pattern suggests you need medical attention.`
  * **Immediate Actions**: `1) Rest immediately, 2) Keep wound area clean, 3) Monitor for fever`
  * **Family Network Activated**: `I've notified your husband Rajesh and mother Sita. They're on their way.`
  * **ASHA Worker Connected**: `Local health worker Priya is calling you in 5 minutes.`
  * **Location Sharing**: `Your family can see your location for safety.`
* **Emergency Actions:**

  * `Call Emergency Contact` (big red button)
  * `Share Medical Summary` (SMS to doctor with history)
  * `Connect to ASHA Worker` (video call option)
  * `Cancel Alert` (if false alarm)
* **Microcopy tone:** Calm but urgent, supportive. E.g., `I'm here with you. Your family is being notified and help is on the way.`
* **Animations:** Alert card pulses gently, family notification badges appear, countdown timer for ASHA worker call.

### Screen 6 — AI Recovery Timeline (Personalized Journey)

* **Purpose:** Show personalized recovery milestones and predictions based on user's unique journey.
* **Timeline Structure:**

  * **Current Phase**: `Healing Phase - Day 12 of 14` with progress bar
  * **Today's Focus**: `Rest and gentle movement. Your bleeding should be lighter today.`
  * **Upcoming Milestones**: 
    - `Day 15: Energy should improve significantly`
    - `Day 21: You can start light household work`
    - `Day 30: Full recovery expected`
* **AI Predictions Section:**

  * `Based on your C-section recovery, you're healing 15% faster than average`
  * `Your mood patterns suggest you'll feel much better in 3 days`
  * `Your baby's feeding schedule is helping your recovery`
* **Personalized Tips:**

  * `Your sleep quality affects your healing. Try to nap when baby sleeps.`
  * `Your family support is excellent - this is helping your recovery.`
  * `You're drinking enough water - keep it up!`
* **Voice Integration**: `Ask me about your recovery` (voice button)
* **Animations:** Timeline scrolls smoothly, milestones light up as achieved, progress bars animate with elastic easing.

### Screen 7 — ASHA Worker Dashboard (Real-time Connection)

* **Purpose:** Direct connection to local health workers with real-time monitoring.
* **ASHA Worker Profile:**

  * **Name**: `Priya Sharma - ASHA Worker`
  * **Status**: `Online - Available for calls`
  * **Specialization**: `Postpartum care, C-section recovery`
  * **Rating**: `4.9/5 (127 mothers helped)`
* **Real-time Monitoring:**

  * **Your Progress**: `Priya can see your recovery timeline and recent check-ins`
  * **Alerts Shared**: `She receives notifications when you need help`
  * **Medical History**: `She has access to your delivery details and current concerns`
* **Communication Options:**

  * `Voice Call` (primary button)
  * `Video Call` (for visual assessment)
  * `Send Voice Message` (quick updates)
  * `Share Location` (for home visits)
* **Emergency Features:**

  * `Emergency Call` (immediate connection)
  * `Share Medical Summary` (SMS with key details)
  * `Request Home Visit` (schedule appointment)
* **Settings Section:**

  * Voice/SMS preferences
  * Language selection (Hindi/English)
  * Family notification settings
  * Privacy controls
* **Animations:** ASHA worker status indicator pulses when online, call buttons have gentle hover effects.

### Screen 8 — Family Network & Emergency Contacts

* **Purpose:** Manage emergency contacts and family notification system.
* **Family Network Section:**

  * **Primary Contact**: `Rajesh (Husband) - +91 98765 43210` with status `Active`
  * **Secondary Contact**: `Sita (Mother) - +91 98765 43211` with status `Active`
  * **Emergency Contact**: `Dr. Sharma (Family Doctor) - +91 98765 43212`
* **Notification Settings:**

  * `Daily Progress Updates` (toggle on/off)
  * `Emergency Alerts Only` (toggle on/off)
  * `Voice Message Notifications` (toggle on/off)
  * `Location Sharing` (toggle on/off)
* **Recent Notifications Sent:**

  * `Today 2:30 PM: Notified Rajesh about your low energy`
  * `Yesterday 10:15 AM: Sent progress update to Sita`
  * `2 days ago: Emergency alert sent to all contacts`
* **Quick Actions:**

  * `Test Emergency Alert` (send test to all contacts)
  * `Add New Contact` (family member or friend)
  * `Edit Contact Details`
  * `View Notification History`
* **Privacy Controls:**

  * `Share Medical History` (what family can see)
  * `Location Sharing Duration` (how long to share location)
  * `Emergency Contact Access` (who can be contacted)
* **Animations:** Contact status indicators pulse when active, notification history scrolls smoothly, toggle switches have smooth transitions.

---

## 8. Exact copy for critical flows (ready-to-paste)

* **Splash:** `Welcome to Aarogya` / `Care for Maa & Baby`
* **Onboarding Q1:** `👋 Namaste! I am Aarogya — your postnatal buddy. What should I call you?`
* **Onboarding phone:** `Can I have your phone number so I can message important alerts?` — `We will not share your number.`
* **Check-in start:** `How are you feeling today?` -> mood options: `Very good / Okay / Tired / Low / Very low`
* **Symptom chips:** `Bleeding`, `Fever`, `Breast pain`, `Pain while urinating`, `Cramping`, `Other`.
* **Green result:** `All good — rest, hydrate, and keep doing small walks. 💧`.
* **Yellow result:** `Caution — we recommend monitoring for 24 hours. Remedies: 1) Drink warm fluids, 2) Rest, 3) Keep wound clean. If gets worse, seek care.`
* **Red urgent:** `⚠️ Urgent — Please contact a doctor or go to the nearest health center now. Call button below.`
* **SMS opt-in microcopy:** `Toll-free alerts: Aarogya will send urgent messages to this number. Reply STOP to opt out.`

---

## 9. SMS Channel: architecture & message templates

* **Architecture:**

  1. Twilio number receives inbound SMS → Twilio calls your webhook `/sms/inbound`.
  2. Backend parses text (simple keywords) -> maps to structured symptom list -> runs same check-in logic -> stores a check-in and creates alert if necessary -> sends SMS reply to user via Twilio API.
* **Webhook endpoint (example):** `POST /sms/inbound` payload: `{ From: '+91XXXXXXXXXX', Body: 'bleeding heavy, fever' }`.
* **Parsing strategy (quick hackathon):** Lowercase body, split by commas/spaces, match keywords: `bleeding`, `heavy`, `fever`, `pain`, `urine`, `breast`.
* **SMS templates:**

  * **Welcome after opt-in:** `Aarogya: Namaste {Name}. Welcome to Aarogya. Send your daily symptoms like: "bleeding" or "fever" or "sad". For help reply HELP.`
  * **Green reply:** `Aarogya: All looks OK today. Tip: Drink warm fluids and rest. Reply CHECK to do a quick mood check.`
  * **Yellow reply:** `Aarogya: Caution — we noticed {symptom}. Try home care: {remedy1}. Re-check in 24 hrs or reply HELP for more.`
  * **Red reply:** `Aarogya: ⚠️ Urgent — we found signs of {symptom}. Please contact a doctor or nearest clinic now. If you want, reply CALL to connect to a health worker.`
* **Edge cases:** If Twilio sandbox not available, demonstrate via simulated webhook requests and pre-recorded SMS chat in the demo.

---

## 10. AI / Pattern Recognition Engine (unique USP)

* **Smart Pattern Recognition (our competitive advantage):**

  * **Bleeding Pattern Analysis**: Track daily bleeding intensity, detect 40%+ increases over 3 days
  * **Mood Trend Detection**: Identify persistent low mood patterns, predict recovery timeline
  * **Energy Level Tracking**: Monitor energy patterns, predict when user will feel stronger
  * **Sleep Quality Correlation**: Link sleep patterns to recovery progress
  * **Family Support Impact**: Measure how family involvement affects recovery speed
* **Personalized Recovery Predictions:**

  * `Based on your C-section recovery, you're healing 15% faster than average`
  * `Your mood patterns suggest you'll feel much better in 3 days`
  * `Your family support is excellent - this is helping your recovery`
* **Voice-First AI Responses:**

  * Natural language processing for symptom description
  * Context-aware follow-up questions
  * Personalized advice based on delivery type and history
  * Emotional tone matching (calm, supportive, urgent when needed)
* **Emergency Pattern Detection:**

  * If `bleeding + fever + low energy` => `red` + family alert
  * If `mood_score <= 2` for 3 consecutive days => `yellow` + mental health resources
  * If `energy drop > 50%` in 2 days => `yellow` + rest recommendations
  * If `sleep < 4 hours` for 3 nights => `yellow` + sleep support

---

## 11. Build plan & 20-hour timeline (focused on unique USPs)

* **Hour 0–1:** Project setup: repo, Next.js template, Tailwind, FastAPI scaffold, voice recognition setup.
* **Hour 1–3:** Build Voice-First Onboarding (Screen 1) with speech-to-text integration and emergency contact collection.
* **Hour 3–5:** Build AI Recovery Dashboard (Screen 3) with personalized insights and pattern recognition logic.
* **Hour 5–8:** Build Voice-First Check-in (Screen 4) with natural language processing and AI responses.
* **Hour 8–10:** Build Smart Alert & Family Network (Screen 5) with emergency contact notification system.
* **Hour 10–12:** Build AI Recovery Timeline (Screen 6) with personalized milestone tracking and predictions.
* **Hour 12–14:** Build ASHA Worker Dashboard (Screen 7) with real-time connection and monitoring features.
* **Hour 14–16:** Build Family Network (Screen 8) with notification management and privacy controls.
* **Hour 16–18:** Integrate voice synthesis, SMS fallback, and test all voice interactions.
* **Hour 18–20:** Polish UI, add animations, create demo data, and prepare presentation.

---

## 12. Demo script (what to show judges in 3–5 minutes)

1. **Voice-First Onboarding** (45s) — Show revolutionary voice onboarding: "Namaste! I am Aarogya..." with speech-to-text and emergency contact collection.
2. **AI Recovery Dashboard** (45s) — Show personalized insights: "You're 65% through healing phase" with pattern recognition and family notifications.
3. **Voice Check-in** (60s) — Demonstrate natural conversation: "How are you feeling?" → user speaks → AI responds with personalized advice and family alerts.
4. **Smart Alert Activation** (45s) — Show AI detecting pattern: "Your bleeding increased 40%" → family network activated → ASHA worker connected.
5. **ASHA Worker Connection** (30s) — Show real-time connection to local health worker with video call and medical history sharing.
6. **Wrap-up** (15s) — Highlight unique USPs: Voice-first, AI pattern recognition, family network, ASHA integration.

---

## 13. Accessibility & rural language considerations

* Use large tappable targets (>=44px). Clear labels in both Hindi and English. Use audio prompts for onboarding and check-in (TTS) as future enhancement. Use simple vocabulary; avoid medical jargon.

---

## 14. Privacy & safety notes (important for judges)

* Store minimum PII (phone + name). Encrypt phone at rest if using production DB. Provide explicit consent for SMS. Add `Reply STOP` handling for opt-out.
* Display clear `Disclaimer`: `Aarogya is not a substitute for medical care. In emergencies call local health services.`

---

## 15. Bonus features to mention (pitch)

* ASHA worker dashboard and batch monitoring.
* Voice IVR integration for fully offline/phone-only users.
* ML-based symptom classifier and localized content generation.
* Local language TTS/ASR for voice check-ins.

---

## 16. Appendix: Sample Twilio webhook pseudo-code (FastAPI)

```python
from fastapi import FastAPI, Request
from twilio.twiml.messaging_response import MessagingResponse

app = FastAPI()

@app.post("/sms/inbound")
async def sms_inbound(request: Request):
    form = await request.form()
    body = form.get('Body', '').lower()
    sender = form.get('From')

    # naive parser
    symptoms = []
    if 'bleed' in body or 'bleeding' in body:
        symptoms.append('bleeding')
    if 'fever' in body:
        symptoms.append('fever')
    if 'sad' in body or 'depress' in body:
        symptoms.append('low_mood')

    # run rules
    level = 'green'
    if 'bleeding' in symptoms and 'fever' in symptoms:
        level = 'red'
    elif 'bleeding' in symptoms:
        level = 'red'
    elif 'low_mood' in symptoms:
        level = 'yellow'

    resp = MessagingResponse()
    if level == 'green':
        resp.message('Aarogya: All looks OK today. Tip: Drink warm fluids and rest.')
    elif level == 'yellow':
        resp.message('Aarogya: Caution — we noticed signs of low mood. Try breathing exercises. Reply HELP for resources.')
    else:
        resp.message('Aarogya: ⚠️ Urgent — We found signs of heavy bleeding. Please contact your local clinic now.')

    return str(resp)
```

---

## 17. What to include in your hackathon slide (single page)

* **Problem**: Postpartum care gaps in rural India - 60% of mothers lack proper recovery guidance
* **Solution**: Aarogya - AI-powered voice-first companion with family network integration
* **Unique USPs**: 
  - Voice-first interaction (Hindi/English)
  - AI pattern recognition for early intervention
  - Real-time family network activation
  - Direct ASHA worker connection
* **Live demo**: Voice onboarding → AI insights → Pattern detection → Family alerts
* **20hr build plan**: Voice recognition → AI dashboard → Pattern engine → Family network
* **Impact**: 10M+ rural mothers, 40% faster recovery, 60% fewer complications

---

## 18. Closing notes (friendly tone for judges & users)

* Keep language warm, empathetic, and non-alarming. Use pictures/illustrations of mothers & babies rather than medical imagery. Make the app feel like a supportive companion that nudges, protects, and educates.

---
##19. Rules
Every time you run need the AI to do a big change, just do “Read @”[your document name]” thoroughly and follow it to address “[your issue here]”


(This literally saved me so many hours)


1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md. Always ask questions if anything is unclear, and NEVER ASSUME.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Make sure security is tight and always production ready, no matter the cirumstance.
8. Also before coding, always have this perspective of "what would Mark Zuckerburg do in this situation"
9. After execution, please check through all the code you just wrote and make sure it follows security best practices. make sure there are no sensitive information in the front and and there are no vulnerabilities that can be exploited, and no crucial files like .env, and also before pushing to github check as well. And also please explain the functionality and code you just built out in detail. Walk me through what you changed and how it works. Act like you’re a senior engineer teaching a 16 year old how to code.
8. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.
9. And also, always check for syntax errors after code completion.
10. If you need me to clarify anything, or have questions, please feel free to ask, always ensure 100% crystal clarity before execution. Further, ensure that everything I tell you to do you know how to do it, if not please state. Please do not attempt to do something you do not have information about and assume. Ask me to do research if needed.
11. Upon finishing execution, update dev.md to include any information of functions/code that we need to remove before production.
12. Check if there is any legacy code, overlapping code, overlapping functions that could cause the error
13. Small, but crucial and important changes in steps.md so in case your memory was wiped, you can always reference it
14.write the code as human like when others see the code it should look lie it is written by human not by ai but the output, logics and everything it should be high level just make it look like it is written by ai.
