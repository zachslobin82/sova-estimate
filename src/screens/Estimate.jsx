import { useState, useEffect } from 'react'
import { PROCEDURE_MAP } from '../data/procedures'

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(n) {
  return '$' + n.toLocaleString('en-US')
}

// Ornament — same diamond element used on the welcome screen
function Ornament() {
  return (
    <div className="estimate-interstitial__ornament">
      <span className="estimate-interstitial__orn-line" />
      <span className="estimate-interstitial__orn-diamond">◆</span>
      <span className="estimate-interstitial__orn-line" />
    </div>
  )
}

const READINESS_LABELS = {
  high:   'seriously considering moving forward',
  medium: 'thoughtfully exploring their options',
  low:    'in the early stages of exploration',
}

const MOTIVATION_LABELS = {
  confidence:  'wanting to feel more confident in how they present themselves',
  longstanding:'addressing something that has been on their mind for a long time',
  alignment:   'feeling their body no longer reflects how they see themselves',
  new_phase:   'entering a meaningful new chapter of life',
  aesthetic:   'simply wanting to look and feel better',
}

const FINANCIAL_LABELS = {
  ready:               'financially ready and has been saving for this',
  need_to_understand:  'wanting to understand the investment before planning',
  explore_financing:   'open to exploring financing options',
  funds_ready:         'has funds ready and is focused on finding the right doctor',
}

const FALLBACK_TEXT =
  "We're genuinely honored that you've taken this time with us. " +
  "Based on everything you've shared — your goals, where you are in your journey, " +
  "and what matters most to you — we've prepared this investment overview with care and intention."

// ── Component ────────────────────────────────────────────────────────────────

export default function Estimate({ answers, onContinue, onBack, onView }) {
  const [contextText, setContextText] = useState(null)  // null = loading
  const [timerDone,   setTimerDone]   = useState(false)

  // Interstitial resolves when BOTH 2.5 s have passed AND the API has responded
  const interstitialDone = timerDone && contextText !== null

  const {
    proceduresSelected = [],
    readiness,
    motivations = [],
    financialReadiness,
    patientOwnWords,
    surgeonRecommendation,
  } = answers

  const allProcedures    = proceduresSelected.map(v => PROCEDURE_MAP[v]).filter(Boolean)
  const pricedProcedures = allProcedures.filter(p => p.priceMin !== null)
  const totalMin         = pricedProcedures.reduce((s, p) => s + p.priceMin, 0)
  const totalMax         = pricedProcedures.reduce((s, p) => s + p.priceMax, 0)

  // Interstitial timer — minimum 2.5 s
  useEffect(() => {
    const t = setTimeout(() => setTimerDone(true), 2500)
    return () => clearTimeout(t)
  }, [])

  // Mark estimate as shown and fire API call on mount
  useEffect(() => {
    onView?.()

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!apiKey) {
      setContextText(FALLBACK_TEXT)
      return
    }

    const systemPrompt = [
      "You are writing a brief message on behalf of a luxury plastic surgery practice to a patient who just completed a planning estimator. Write exactly 2 sentences — maximum 45 words. Speak directly to the patient as 'you'. Never use 'I'. Never open with 'Thank you' or 'We'. Do not use words like 'wonderful', 'excited', 'amazing', or 'journey'. Be warm but grounded — like a confident, caring professional, not a cheerleader. Reference something specific the patient shared. Use 'investment' not 'cost'. No promises about results.",
      "",
      "You have the following information about this patient:",
      `- Procedures they're considering: ${allProcedures.map(p => p.label).join(', ') || 'not specified'}`,
      `- Their readiness level: ${READINESS_LABELS[readiness] || readiness || 'not specified'}`,
      `- What's drawing them toward this: ${motivations.map(v => MOTIVATION_LABELS[v]).filter(Boolean).join('; ') || 'not specified'}`,
      `- How they're thinking about the investment: ${FINANCIAL_LABELS[financialReadiness] || financialReadiness || 'not specified'}`,
      patientOwnWords ? `- In their own words: "${patientOwnWords}"` : null,
      surgeonRecommendation ? `- Surgeon recommendation: ${surgeonRecommendation}` : null,
    ].filter(line => line !== null).join('\n')

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: 'Write the personalized context. Exactly 2 sentences. Maximum 45 words.',
        }],
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setContextText(data.content[0].text))
      .catch(err => {
        console.error('[Sova] Estimate API error:', err)
        setContextText(FALLBACK_TEXT)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Interstitial — shown until both timer fires and API resolves
  if (!interstitialDone) {
    return (
      <div className="screen estimate-interstitial">
        <Ornament />
        <p className="estimate-interstitial__text">
          Preparing your personalized estimate…
        </p>
        <div className="loading-dots" aria-label="Loading">
          <span /><span /><span />
        </div>
      </div>
    )
  }

  // Animation stagger base — starts after context settles
  const rowBase = 0.2

  return (
    <div className="screen estimate">

      <button className="btn-back" onClick={onBack}>← Back</button>

      {/* ── Headline ── */}
      <h2 className="estimate__headline">
        Based on what you've shared
      </h2>

      {/* ── AI context paragraph ── */}
      <div className="estimate__context">
        <p className="estimate__context-text">{contextText}</p>
      </div>

      {/* ── Disclaimer ── */}
      <div className="estimate__disclaimer-wrap">
        <div className="estimate__rule estimate__rule--disclaimer" />
        <p className="estimate__disclaimer">
          The investment below reflects surgical planning, medical expertise, anesthesia, accredited
          facility care, and the support provided before, during, and after your procedure. Because
          every plan is individualized, this is presented as a range — your doctor will outline
          specifics during your consultation.
        </p>
      </div>

      {/* ── Price ranges ── */}
      {pricedProcedures.length > 0 && (
        <div className="estimate__ranges">
          <div className="estimate__rule" />
          {pricedProcedures.map((proc, i) => (
            <div
              key={proc.value}
              className="estimate__range-row"
              style={{ animationDelay: `${rowBase + i * 0.09}s` }}
            >
              <div className="estimate__range-line">
                <span className="estimate__range-name">{proc.label}</span>
                <span className="estimate__range-sep">—</span>
                <span className="estimate__range-price">
                  {formatPrice(proc.priceMin)}–{formatPrice(proc.priceMax)}
                </span>
              </div>
              {i < pricedProcedures.length - 1 && (
                <div className="estimate__rule estimate__rule--inner" />
              )}
            </div>
          ))}
          <div className="estimate__rule" />

          {/* Total — only when more than one procedure */}
          {pricedProcedures.length > 1 && (
            <div
              className="estimate__total-row"
              style={{ animationDelay: `${rowBase + pricedProcedures.length * 0.09}s` }}
            >
              <span className="estimate__total-label">Estimated total investment</span>
              <span className="estimate__total-price">
                {formatPrice(totalMin)} – {formatPrice(totalMax)}
              </span>
              <div className="estimate__rule estimate__rule--inner estimate__rule--total" />
            </div>
          )}
        </div>
      )}

      {/* ── CTA ── */}
      <button
        className="btn-primary estimate__cta"
        style={{ animationDelay: `${rowBase + pricedProcedures.length * 0.09 + 0.22}s` }}
        onClick={onContinue}
      >
        I'm ready to take the next step →
      </button>

    </div>
  )
}
