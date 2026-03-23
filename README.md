# SafePath MVP Learning Roadmap

SafePath is a mobile app for solo travelers.  
This README is a **step-by-step learning plan** so you can build the MVP yourself, not copy full code.

## 1) Product Goal (MVP)

Build an Expo React Native app (Android + iOS) with a Node.js backend that:

- Authenticates users (register/login)
- Stores emergency contacts
- Lets user plan a route (start -> destination) using TrackAsia
- Monitors live trip and detects anomalies
- Sends in-app alert first, then escalates to emergency contacts if no response
- Collects end-of-trip feedback to improve detection quality

## 2) Final Tech Stack

- **Frontend:** Expo + React Native (JavaScript)
- **Backend:** Node.js (Express)
- **Database/Auth/Push:** Firebase (Auth, Firestore, Cloud Messaging)
- **Serverless secure API layer:** Firebase Cloud Functions
- **Map + route + geocoding/autocomplete:** TrackAsia API
- **AI agent logic:** OpenRouter (called only from backend/functions, never client)
- **SMS escalation:** Twilio (verify Vietnam coverage and sender setup early)

## 3) MVP Scope (Keep It Realistic)

### Must Have
- Email/password auth
- Add/edit multiple emergency contacts
- Route setup with autocomplete + map + ETA for selected transport mode
- Live GPS monitoring + 3 anomaly rules:
  - Off route > 50m
  - Stationary within 20m for 5 minutes
  - Runtime exceeds expected duration by 10+ minutes
- Alert prompt: "Are you safe?" with:
  - "No, send help"
  - "I'm okay, just a bit astray" + delay 3-10 min
- Escalation after no response for 3 minutes:
  - SMS to non-member contacts
  - Push notification to contacts who are app members
- End journey + feedback form
- Settings: language (EN/VI), theme basics (blue/yellow, red for danger)

### Nice To Have (Do Later)
- Personalized anomaly thresholds from behavior history
- Full traffic-aware AI interpretation
- Complex swipe gestures across all screens
- Advanced role/admin dashboards

## 4) Learning Path (Build Order)

Follow these phases in order. Do not jump to AI first.

---

## Phase 0 - Setup and Foundations

### Goal
Create a stable dev environment and project skeleton.

### Tasks
1. Initialize Expo app and run on your phone with Expo Go.
2. Create backend Express app.
3. Create Firebase project and connect:
   - Firebase Auth
   - Firestore
   - Cloud Messaging
4. Add Cloud Functions project for secure API calls.
5. Prepare `.env` files for local backend and functions.

### Learn
- Why secrets must stay server-side
- Basic client/server split in mobile apps

### Checkpoint
- App opens on phone
- Backend runs locally
- Firebase connection works

---

## Phase 1 - Auth + Onboarding

### Goal
Implement Screen 1-3 (login/register, permissions, emergency contacts).

### Tasks
1. Build register/login screens.
2. Build permission request screen:
   - Location permission (mandatory)
   - Notification permission (mandatory)
3. Build emergency contacts CRUD:
   - Full name
   - Nickname (optional)
   - Phone number
   - Is app member checkbox
4. Show onboarding contacts step only for first-time users.

### Learn
- Conditional navigation flows
- Form validation and Firestore schema design

### Checkpoint
- New user can sign up and add contacts
- Returning user skips contacts onboarding

---

## Phase 2 - Route Planning Screen

### Goal
Implement Screen 4 (start, destination, map preview, ETA).

### Tasks
1. Build two input boxes: origin and destination.
2. Integrate TrackAsia autocomplete.
3. Stop suggestions after user selects an address.
4. Request route and display:
   - Distance
   - ETA
   - Transport mode selected (one mode shown at a time)
5. Render route on map.
6. Add "Begin Journey" button.

### Learn
- Debounce/autocomplete patterns
- Route polyline rendering and geo data handling

### Checkpoint
- User sees route + ETA + distance + map before starting trip

---

## Phase 3 - Live Monitoring + Rule Engine

### Goal
Implement Screen 5 (active monitoring) with deterministic rules first.

### Tasks
1. Start location tracking in journey session.
2. Save periodic location points (for debugging and audit).
3. Implement anomaly detectors:
   - Deviation detector (>50m from route polyline)
   - Stationary detector (within 20m for 5 min)
   - Overtime detector (current runtime > ETA + 10 min)
4. Trigger local high-priority alert UI when any detector fires.

### Learn
- Background-safe monitoring design
- Time-window and distance-threshold algorithms

### Checkpoint
- Simulate movement and confirm all 3 anomaly rules can trigger

---

## Phase 4 - Alert Workflow + Escalation

### Goal
Convert anomaly detection into real safety workflow.

### Tasks
1. Alert modal: "Are you safe?"
   - "No, send help"
   - "I'm okay, just a bit astray"
2. If "astray", allow delay (3-10 min).
3. Add vibration strategy:
   - Vibrate pattern for 5 seconds
   - Repeat every 20 seconds
   - Stop after 3 minutes or user response
4. If no response for 3 minutes:
   - Send SMS via Twilio to non-member contacts
   - Send push notifications to member contacts
5. Include message payload:
   - User name
   - Current location link

### Learn
- Escalation policies
- Reliability and retries for safety features

### Checkpoint
- End-to-end test: forced anomaly -> alert -> no response -> SMS/push sent

---

## Phase 5 - AI Agent Layer (OpenRouter)

### Goal
Use AI to reduce false positives, not replace hard rules.

### Tasks
1. Keep rule engine as primary trigger.
2. Send context to backend AI evaluator:
   - Current speed
   - Route deviation metrics
   - ETA delta
   - Recent location trend
3. AI returns recommendation:
   - `safe_delay`
   - `warn_user`
   - `escalate_now`
4. Log AI decision + final action for later analysis.

### Learn
- Human-in-the-loop AI design
- Safety fallback when AI is unavailable

### Checkpoint
- App still works when AI API fails (must fallback to deterministic rules)

---

## Phase 6 - End Journey + Feedback Loop

### Goal
Implement final screen and data collection.

### Tasks
1. Add "End Journey" action.
2. Collect feedback:
   - Satisfaction rating
   - Was alert too interruptive? (yes/no)
   - Reason options (shorter route, highway no-stop, traffic jam, etc.)
3. Save feedback with trip session id.

### Learn
- Product iteration via structured user feedback

### Checkpoint
- Completed trip writes feedback records for analytics

---

## Phase 7 - Settings + UX Polish

### Goal
Implement small features for usable MVP.

### Tasks
1. Settings page:
   - Language toggle EN/VI
   - Add/edit emergency contacts
2. Theme:
   - Blue/yellow default
   - Red danger visuals for alert states
3. Add basic swipe gesture where it improves UX (do not overdo).

### Checkpoint
- MVP is coherent, testable, and demo-ready

## 5) Suggested Folder Structure

Keep a clear separation:

- `mobile/` -> Expo app
- `backend/` -> Node.js Express API
- `functions/` -> Firebase Cloud Functions (secure API proxy + triggers)
- `docs/` -> architecture notes, API contracts, testing scripts

## 6) Data Model (MVP)

Create these core entities:

- `users`
- `emergency_contacts`
- `journeys`
- `journey_events` (location points, anomaly flags, alerts)
- `feedback`

Start simple and version your schema with small migrations.

## 7) API Key and Security Rules

- Never put TrackAsia/OpenRouter/Twilio secrets in Expo client code.
- Client calls your backend/functions only.
- Backend/functions call external APIs.
- Use Firebase Auth token verification for protected endpoints.
- Use rate limits on alert endpoints to avoid abuse.

## 8) Testing Plan (Learn by Doing)

### Device testing strategy
- Use **at least 2 physical phones** for realistic member-to-member alert tests.
- Same phone cannot realistically represent two active users receiving push at once.
- For solo testing:
  - Keep one real user account on your phone
  - Use second phone for emergency-contact member account

### Critical test scenarios
1. Route deviation trigger
2. Stationary 5-minute trigger
3. Overtime trigger
4. User confirms safe and delays alert
5. User taps send help
6. No response for 3 minutes -> escalation works
7. Poor network handling and retry behavior

## 9) Twilio + Vietnam Constraint

Before coding deep integration, verify:

- Vietnam SMS destination support in your Twilio setup
- Sender type compliance for target region
- Message delivery latency and cost

If Twilio becomes a blocker, keep SMS provider abstracted so you can swap later.

## 10) Weekly Learning Sprint Plan (6 Weeks)

- **Week 1:** Setup + Auth + Firestore models
- **Week 2:** Permissions + Contacts onboarding
- **Week 3:** TrackAsia route planning screen
- **Week 4:** Monitoring engine + anomaly detection
- **Week 5:** Alert UX + Twilio/push escalation
- **Week 6:** OpenRouter AI layer + feedback + polish

## 11) Definition of Done (MVP)

MVP is done when:

- A new user can register, add contacts, plan a route, and start trip
- Live monitoring runs and triggers anomaly alerts correctly
- Escalation sends alerts if user does not respond
- Trip can be ended and feedback is saved
- API keys are protected server-side

## 12) Build Rules for Learning

To maximize learning:

1. Build one phase at a time and demo it before moving on.
2. Write small tests/check scripts per anomaly rule.
3. Keep an engineering log: what failed, why, and fix.
4. Do not add advanced AI behavior until deterministic baseline is reliable.

---

If you want, next I can create:

- `docs/PHASE_01_CHECKLIST.md` with concrete tasks for Auth/Onboarding
- `docs/FIRESTORE_SCHEMA.md` with starter collections and fields
- `docs/API_CONTRACTS.md` so frontend/backend integration is clean from day 1
