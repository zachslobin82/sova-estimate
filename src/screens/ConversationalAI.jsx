import { useState, useEffect, useRef } from 'react'
import { PROCEDURE_MAP } from '../data/procedures'

// ── Mic icon ────────────────────────────────────────────────────────────────
function MicIcon() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9"  y1="22" x2="15" y2="22" />
    </svg>
  )
}

// ── Context label maps (match Estimate.jsx) ──────────────────────────────────
const READINESS_LABELS = {
  high:   'seriously considering moving forward',
  medium: 'thoughtfully exploring their options',
  low:    'in the early stages of exploration',
}
const MOTIVATION_LABELS = {
  confidence:   'wanting to feel more confident in how they present themselves',
  longstanding: 'addressing something that has been on their mind for a long time',
  alignment:    'feeling their body no longer reflects how they see themselves',
  new_phase:    'entering a meaningful new chapter of life',
  aesthetic:    'simply wanting to look and feel better',
}
const FINANCIAL_LABELS = {
  ready:              'financially ready and has been saving for this',
  need_to_understand: 'wanting to understand the investment before planning',
  explore_financing:  'open to exploring financing options',
  funds_ready:        'has funds ready and is focused on finding the right doctor',
}

// ── Dynamic procedure subheadline ────────────────────────────────────────────
function buildSubheadline(labels) {
  if (!labels.length) return null
  const suffix = ' You can also ask any questions — we\'re here to help.'
  if (labels.length === 1)
    return `Tell us more about what you hope to achieve with your ${labels[0]}.${suffix}`
  if (labels.length === 2)
    return `Tell us more about what you hope to achieve with your ${labels[0]} and ${labels[1]}.${suffix}`
  const allButLast = labels.slice(0, -1)
  const last       = labels[labels.length - 1]
  return `Tell us more about what you hope to achieve with your ${allButLast.join(', ')}, and ${last}.${suffix}`
}

// ── Static procedure affirmation ─────────────────────────────────────────────
const FACE_PROCS = new Set(['facelift', 'neck_lift', 'eyelid', 'brow_lift', 'rhinoplasty'])

const SINGLE_AFFIRMATIONS = {
  breast_aug:       "Breast augmentation is one of the most consistently life-changing procedures we offer — and one of the most common choices we see.",
  breast_lift:      "A breast lift is one of the most transformative procedures for patients looking to restore shape and confidence.",
  breast_reduction: "Breast reduction is one of the most impactful procedures we perform — patients consistently describe it as life-changing.",
  tummy_tuck:       "A tummy tuck is one of the most requested procedures we see — especially for patients who want results that diet and exercise simply can't achieve.",
  lipo:             "Liposuction remains one of the most effective ways to address targeted areas that resist even the most dedicated efforts.",
  mommy:            "The Mommy Makeover is one of our most popular procedures — and one of the most meaningful transformations we get to be part of.",
  facelift:         "A facelift, done well, doesn't make you look different — it makes you look like yourself again.",
  rhinoplasty:      "Rhinoplasty is one of the most nuanced procedures in plastic surgery — and when it's right, the results are remarkable.",
  bbl:              "The BBL is one of the most requested procedures we see — with results that are both dramatic and natural-looking when done by the right hands.",
  eyelid:           "Eyelid surgery is one of the highest-impact, lowest-downtime procedures we offer — patients are consistently amazed by how refreshed they look.",
  neck_lift:        "A neck lift is one of those procedures where the results speak for themselves — patients often say it takes years off in the most natural way.",
  body_lift:        "A body lift is a significant procedure — and for the right patient, it's one of the most transformative things we do.",
  brow_lift:        "A brow lift is subtle when done right — but the difference it makes in how rested and open someone looks is remarkable.",
  gynecomastia:     "Gynecomastia correction is one of those procedures that quietly changes everything for patients — confidence, comfort, how they carry themselves.",
  breast_revision:  "Implant exchange is a straightforward procedure with meaningful results — and our team handles revisions with the same care as any primary procedure.",
}

function buildAffirmation(selected) {
  if (!selected || !selected.length) return null
  const s = new Set(selected)

  // Single procedure
  if (selected.length === 1) return SINGLE_AFFIRMATIONS[selected[0]] || null

  // Multi-procedure — priority order matches spec
  if (s.has('breast_aug') && s.has('tummy_tuck'))
    return "Breast augmentation and a tummy tuck together is one of the most popular combinations we see — many patients prefer handling both in a single recovery rather than going through it twice."
  if (s.has('breast_aug') && s.has('breast_lift'))
    return "Combining augmentation with a lift gives patients the best of both — volume and shape — in a single procedure and recovery."
  if (s.has('tummy_tuck') && s.has('lipo'))
    return "A tummy tuck paired with liposuction is a powerful combination — addressing both the muscle wall and the surrounding contour for a more complete result."
  if (s.has('mommy'))
    return "The Mommy Makeover is designed exactly for this — addressing multiple areas in a single surgery so recovery happens once, not multiple times."
  if (selected.filter(v => FACE_PROCS.has(v)).length >= 2)
    return "Combining facial procedures is something we approach thoughtfully — when done together strategically, the results are more harmonious and recovery is consolidated."
  if (selected.length >= 3)
    return "Considering multiple procedures together is something our team plans carefully — the goal is always to maximize results while keeping recovery as streamlined as possible."

  return "The combination you're exploring is one our team works with regularly — and the results, planned well, can be genuinely remarkable."
}

// ── Fallback response (no API key / error) ───────────────────────────────────
const FALLBACK_RESPONSE =
  "What you've shared gives us a much clearer picture of what matters to you. " +
  "We'd love to put together a personalized estimate based on everything you've told us."

// ── Component ────────────────────────────────────────────────────────────────
export default function ConversationalAI({
  answers,
  onConversationChange,
  onInitialText,
  onContinue,
  onBack,
}) {
  const {
    proceduresSelected = [],
    readiness,
    motivations        = [],
    financialReadiness,
    financingInterest,
    timingPreference,
    surgeonRecommendation,
  } = answers

  const allProcedures = proceduresSelected.map(v => PROCEDURE_MAP[v]).filter(Boolean)
  const subheadline   = buildSubheadline(allProcedures.map(p => p.label))

  // Input state
  const [inputText,    setInputText]    = useState(answers.patientOwnWords || '')
  const [followUpText, setFollowUpText] = useState('')

  // Chat state
  const [isStarted, setIsStarted] = useState(false)
  const [messages,  setMessages]  = useState([])
  const [isTyping,  setIsTyping]  = useState(false)
  const [showCTA,   setShowCTA]   = useState(false)

  // Voice state
  const [isRecording,     setIsRecording]     = useState(false)
  const [interimText,     setInterimText]     = useState('')
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const recognitionRef = useRef(null)
  const chatEndRef     = useRef(null)

  useEffect(() => {
    setSpeechAvailable(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
    return () => recognitionRef.current?.abort()
  }, [])

  // Auto-scroll to bottom of chat after each update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isTyping, showCTA])

  // ── System prompt ──────────────────────────────────────────────────────────
  function buildSystemPrompt() {
    return [
      "CRITICAL CONSTRAINT: Your entire response must be 60 words or fewer. Count your words. If you exceed 60 words, cut ruthlessly. Every word must earn its place.",
      "",
      "You are a warm, knowledgeable Patient Care Coordinator for a luxury plastic surgery practice. A prospective patient has just completed a brief planning experience and shared something personal with you. You have full context on what they've selected and shared.",
      "",
      "You have the following information about this patient:",
      `- Procedures they're considering: ${allProcedures.map(p => p.label).join(', ') || 'not specified'}`,
      `- Their readiness level: ${READINESS_LABELS[readiness] || readiness || 'not specified'}`,
      `- What's drawing them toward this: ${motivations.map(v => MOTIVATION_LABELS[v]).filter(Boolean).join('; ') || 'not specified'}`,
      `- How they're thinking about the investment: ${FINANCIAL_LABELS[financialReadiness] || financialReadiness || 'not specified'}`,
      `- Financing interest: ${typeof financingInterest === 'boolean' ? (financingInterest ? 'Yes — wants to explore financing' : 'No — paying out of pocket') : 'not specified'}`,
      `- Their timing preference: ${timingPreference || 'not specified'}`,
      `- Surgeon recommendation: ${surgeonRecommendation || 'not yet determined'}`,
      "",
      "YOUR FIRST RESPONSE MUST follow this exact structure:",
      "1. Affirm their procedure selection(s) specifically and confidently — reference the actual procedures by name. If they selected multiple procedures, acknowledge the combination and briefly note why it makes sense (e.g. single recovery period, complementary results). Do this even if they mentioned their procedures in their opening message — it should feel like confident validation, not repetition.",
      "2. Reflect something specific from what they personally shared — show you actually read their words, not a generic acknowledgment.",
      "3. Provide one brief piece of relevant education — something that builds trust and shows expertise. Match it to what they shared: if they mentioned recovery concerns, speak to timeline with confidence; if they mentioned wanting natural results, speak to what that means in practice; if they mentioned timing, speak to what planning looks like. Be confident and knowledgeable but warm — not clinical.",
      "4. Ask exactly one intelligent follow-up question based on what they shared.",
      "",
      "SUBSEQUENT RESPONSES:",
      "- Continue addressing what they share directly and specifically",
      "- Answer questions with confident, knowledgeable warmth — blend of authority and care",
      "- Gently surface and address any fears or hesitations",
      "- Ask one follow-up question per response maximum",
      "- After 2-3 exchanges, or when you sense readiness, transition naturally — include the exact phrase 'personalized estimate' in your transition message",
      "- Transition message must end with a declarative statement, never a question",
      "",
      "RULES:",
      "- Never use 'I' — speak as 'we' on behalf of the practice",
      "- Never be pushy or use urgency tactics",
      "- Never mention specific prices — that comes in the estimate",
      "- Keep each response to 2-3 sentences MAXIMUM. No exceptions. If you cannot say it in 3 sentences, cut it. Brevity builds trust. Long responses lose patients.",
      "- Never use the words: journey, exciting, amazing, wonderful, Wonderful",
      "- Never open any response with 'We'",
      "- Once you have sent a transition message containing 'personalized estimate', all subsequent responses must be one sentence only, ending with a forward-pointing statement, never a question",
      "- CRITICAL: After no more than 3 patient responses, you MUST transition to the estimate. End with a closing message that naturally moves them forward and includes the phrase 'personalized estimate'",
      "- You already have the patient's timing preference, financial readiness, and financing interest from their earlier answers. Never ask about these again — they are already captured. Only ask about things not yet known: specific concerns, recovery questions, what they want to look or feel like, previous consultations, lifestyle considerations.",
      "- Every response that is NOT a transition message MUST end with exactly one question. The question should either deepen understanding of their specific situation OR offer a natural path forward. A simple, effective closing question format: 'Is there anything else you'd like to know about [procedure], or are you ready to see your personalized estimate?' — but make it specific to what was just discussed, not generic.",
      "- Never mention financing options in the chat conversation. Financing was already addressed in the planning flow and will be handled by the care team. Do not reference it, offer it, or include it in transition messages.",
      "- If the patient's message indicates they are ready to proceed — phrases like 'I'm ready', 'let's go', 'no questions', 'ready for my estimate', 'skip', 'continue', or any clear signal they want to move forward — do NOT ask another question. Respond with a single warm closing sentence that includes the phrase 'personalized estimate' and move them forward. Example: 'Everything we need is in place — your personalized estimate is ready.' Do not engage further.",
      "",
      "The goal: by the time they move forward, they feel heard, validated in their choices, educated enough to feel confident, and ready to take the next step.",
    ].join('\n')
  }

  // ── Claude API call ────────────────────────────────────────────────────────
  async function callAI(history) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) return FALLBACK_RESPONSE

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':                                 apiKey,
        'anthropic-version':                         '2023-06-01',
        'content-type':                              'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 180,
        system:     buildSystemPrompt(),
        messages:   history,
      }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.content[0].text
  }

  // ── Handle AI response (shared) ────────────────────────────────────────────
  async function processResponse(history) {
    try {
      // Min 1.5 s typing indicator; API call runs in parallel
      const [responseText] = await Promise.all([
        callAI(history),
        new Promise(r => setTimeout(r, 1500)),
      ])

      const aiMsg      = { role: 'assistant', content: responseText }
      const newHistory = [...history, aiMsg]

      setMessages(newHistory)
      setIsTyping(false)
      onConversationChange(newHistory)

      const lower = responseText.toLowerCase()

      // Also check the patient's most recent message for "ready" signals
      const lastUserMsg = history[history.length - 1]
      const userLower   = lastUserMsg?.role === 'user' ? lastUserMsg.content.toLowerCase() : ''

      const shouldTransition =
        // AI response signals
        lower.includes('personalized estimate') ||
        lower.includes('your estimate')         ||
        lower.includes('put together your estimate') ||
        lower.includes('prepare your estimate') ||
        lower.includes('see your estimate')     ||
        lower.includes('ready to see')          ||
        lower.includes('next step')             ||
        // Patient "ready" signals — trigger CTA regardless of AI reply
        userLower.includes("i'm ready")         ||
        userLower.includes('ready for my estimate') ||
        userLower.includes('no questions')      ||
        userLower.includes("let's go")          ||
        userLower.includes('skip')              ||
        userLower.includes('move forward')      ||
        userLower.includes('continue')          ||
        // Hard cap
        newHistory.filter(m => m.role === 'user').length >= 3

      if (shouldTransition) setShowCTA(true)
    } catch (err) {
      console.error('[Sova] ConversationalAI error:', err)
      const aiMsg      = { role: 'assistant', content: FALLBACK_RESPONSE }
      const newHistory = [...history, aiMsg]
      setMessages(newHistory)
      setIsTyping(false)
      onConversationChange(newHistory)
      setShowCTA(true)
    }
  }

  // ── Submit initial message ─────────────────────────────────────────────────
  function handleBegin() {
    const text = inputText.trim()
    if (!text) return

    recognitionRef.current?.stop()
    onInitialText(text)  // persist as patientOwnWords

    const history = [{ role: 'user', content: text }]
    setMessages(history)
    setIsStarted(true)
    setIsTyping(true)
    processResponse(history)
  }

  // ── Submit follow-up message ───────────────────────────────────────────────
  function handleFollowUp() {
    const text = followUpText.trim()
    if (!text) return

    recognitionRef.current?.stop()
    const newHistory = [...messages, { role: 'user', content: text }]
    setMessages(newHistory)
    setFollowUpText('')
    setIsTyping(true)
    processResponse(newHistory)
  }

  // ── Voice recording — routes to active input ───────────────────────────────
  function toggleRecording() {
    if (isRecording) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return

    const setter = isStarted ? setFollowUpText : setInputText

    const rec = new SpeechRec()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = 'en-US'

    rec.onresult = e => {
      let finalChunk = '', interimChunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalChunk   += e.results[i][0].transcript
        else                       interimChunk += e.results[i][0].transcript
      }
      if (finalChunk) {
        setter(prev => prev + (prev.trim() ? ' ' : '') + finalChunk.trim())
        setInterimText('')
      } else {
        setInterimText(interimChunk)
      }
    }

    rec.onerror = () => { setIsRecording(false); setInterimText('') }
    rec.onend   = () => { setIsRecording(false); setInterimText('') }

    rec.start()
    recognitionRef.current = rec
    setIsRecording(true)
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const aiCount    = messages.filter(m => m.role === 'assistant').length
  const userCount  = messages.filter(m => m.role === 'user').length
  const canReply   = isStarted && !isTyping && userCount < 5
  const firstAIIdx = messages.findIndex(m => m.role === 'assistant')

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="screen convo-ai">

      <button className="btn-back" onClick={onBack}>← Back</button>

      {/* ── Procedure affirmation — shown above headline in both phases ── */}
      {buildAffirmation(proceduresSelected) && (
        <p className="convo-ai__affirmation">
          {buildAffirmation(proceduresSelected)}
        </p>
      )}

      {!isStarted ? (

        // ── Phase 1: initial input ────────────────────────────────────────
        <div className="convo-ai__phase1">

          <h2 className="screen__headline">
            What's still on your mind?
          </h2>

          <p className="convo-ai__fixed-sub">
            Share any questions, concerns, or anything else you'd like your care team to know.
          </p>

          {subheadline && (
            <p className="convo-ai__sub">{subheadline}</p>
          )}

          <div className="convo-ai__initial-field">
            <textarea
              className="own-words__textarea"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type here, or use your voice below."
              rows={5}
              aria-label="Share anything on your mind"
            />
            {isRecording && interimText && (
              <p className="own-words__interim" aria-live="polite">{interimText}</p>
            )}
          </div>

          <div className="own-words__controls">
            {speechAvailable && (
              <button
                type="button"
                className={`own-words__mic${isRecording ? ' own-words__mic--recording' : ''}`}
                onClick={toggleRecording}
                aria-label={isRecording ? 'Stop recording' : 'Dictate with microphone'}
              >
                <MicIcon />
                <span>{isRecording ? 'Listening…' : 'Tap to speak'}</span>
              </button>
            )}
          </div>

          <p className="convo-ai__ai-disclaimer">
            This conversation is powered by AI. A member of our care team will follow up personally.
          </p>

          <div className="btn-continue-wrap">
            <button
              type="button"
              className={`btn-continue${inputText.trim() ? ' btn-continue--visible' : ''}`}
              onClick={handleBegin}
            >
              Continue →
            </button>
          </div>

        </div>

      ) : (

        // ── Phase 2: live chat ────────────────────────────────────────────
        <>
          <h2 className="screen__headline">
            What's still on your mind?
          </h2>

          <div className="convo-ai__chat">

            {messages.map((msg, i) => (
              <div key={i} className={`convo-ai__bubble-wrap convo-ai__bubble-wrap--${msg.role}`}>
                {msg.role === 'assistant' && i === firstAIIdx && (
                  <span className="convo-ai__practice-label">Colorado Plastic Surgery Center</span>
                )}
                <div className={`convo-ai__bubble convo-ai__bubble--${msg.role}`}>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="convo-ai__bubble-wrap convo-ai__bubble-wrap--assistant">
                {aiCount === 0 && (
                  <span className="convo-ai__practice-label">Colorado Plastic Surgery Center</span>
                )}
                <div className="convo-ai__bubble convo-ai__bubble--assistant convo-ai__bubble--typing">
                  <div className="loading-dots" aria-label="Typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {canReply && (
            <div className="convo-ai__reply">
              {isRecording && interimText && (
                <p className="own-words__interim" aria-live="polite">{interimText}</p>
              )}
              <div className="convo-ai__reply-row">
                <input
                  type="text"
                  className="convo-ai__reply-input"
                  value={followUpText}
                  onChange={e => setFollowUpText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleFollowUp()
                    }
                  }}
                  placeholder="Reply…"
                  aria-label="Your reply"
                  autoFocus
                />
                {speechAvailable && (
                  <button
                    type="button"
                    className={`own-words__mic${isRecording ? ' own-words__mic--recording' : ''}`}
                    onClick={toggleRecording}
                    aria-label={isRecording ? 'Stop recording' : 'Dictate reply'}
                  >
                    <MicIcon />
                  </button>
                )}
                <button
                  type="button"
                  className="convo-ai__send"
                  onClick={handleFollowUp}
                  disabled={!followUpText.trim()}
                  aria-label="Send reply"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {showCTA && (
            <div className="convo-ai__cta-wrap">
              <button
                type="button"
                className="convo-ai__cta"
                onClick={onContinue}
              >
                See my personalized estimate →
              </button>
              <p className="convo-ai__cta-sub">Just 3 quick questions before your estimate is ready.</p>
            </div>
          )}
        </>
      )}

    </div>
  )
}
