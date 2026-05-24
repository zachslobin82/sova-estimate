import { useState, useEffect } from 'react'

// ── Testimonial category sets ─────────────────────────────────────────────────
const BREAST_PROCS = new Set(['breast_aug', 'breast_lift', 'breast_reduction', 'breast_revision'])
const BODY_PROCS   = new Set(['tummy_tuck', 'lipo', 'mommy', 'body_lift', 'bbl'])
const FACE_PROCS   = new Set(['facelift', 'neck_lift', 'eyelid', 'brow_lift', 'rhinoplasty'])

const TESTIMONIAL_DATA = {
  breast: {
    placeholder: 'Before & After — Breast Augmentation',
    quote: "I couldn't be happier with my results. Dr. Slenkovich and the entire team made me feel comfortable and heard every step of the way.",
  },
  body: {
    placeholder: 'Before & After — Tummy Tuck',
    quote: "From the first visit, Dr. Slenkovich was attentive to my concerns and addressed all my questions. He made me feel comfortable and cared for throughout the entire process.",
  },
  face: {
    placeholder: 'Before & After — Facelift',
    quote: "The results look completely natural. I look like myself again — just refreshed. The care and attention I received at CPSC was unlike anything I expected.",
  },
  other: {
    placeholder: 'Before & After — Results',
    quote: "The team at CPSC treated me like family from the beginning. I felt I was in great hands throughout the entire experience.",
  },
}

function getTestimonialCards(proceduresSelected = []) {
  const s = new Set(proceduresSelected)
  const cards = []
  if ([...s].some(v => BREAST_PROCS.has(v))) cards.push(TESTIMONIAL_DATA.breast)
  if ([...s].some(v => BODY_PROCS.has(v)))   cards.push(TESTIMONIAL_DATA.body)
  if ([...s].some(v => FACE_PROCS.has(v)))   cards.push(TESTIMONIAL_DATA.face)
  return cards.length ? cards : [TESTIMONIAL_DATA.other]
}

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestimonialCard({ placeholder, quote }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-card__placeholder">
        <div className="testimonial-card__placeholder-inner">
          <span className="testimonial-card__placeholder-label">{placeholder}</span>
          <span className="testimonial-card__placeholder-note">Photo coming soon</span>
        </div>
      </div>
      <div className="testimonial-card__body">
        <p className="testimonial-card__quote">"{quote}"</p>
        <p className="testimonial-card__attribution">Verified CPSC Patient</p>
      </div>
    </div>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function NextStep({ answers }) {
  const { priorityScore, proceduresSelected = [] } = answers

  // Question expander state — Score 1/2 only
  const [questionOpen, setQuestionOpen] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [questionSent, setQuestionSent] = useState(false)

  // Load Calendly popup assets for Score 3
  useEffect(() => {
    if (priorityScore !== 3) return

    if (!document.querySelector('link[href*="calendly"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://assets.calendly.com/assets/external/widget.css'
      document.head.appendChild(link)
    }

    if (!document.querySelector('script[src*="calendly"]')) {
      const script = document.createElement('script')
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.head.appendChild(script)
    }
  }, [priorityScore])

  function handleSendQuestion() {
    if (!questionText.trim()) return
    setQuestionSent(true)
    setQuestionOpen(false)
  }

  const testimonialCards = getTestimonialCards(proceduresSelected)

  return (
    <div className="screen next-step">
      {/* No back button — terminal screen */}

      <div className="next-step__content">

        {priorityScore === 3 ? (

          // ── Score 3: Calendly booking ──────────────────────────────────
          <>
            <p className="next-step__tagline">
              Your next step is a conversation with our team.
            </p>

            <button
              type="button"
              className="estimate__booking-btn"
              onClick={() => window.Calendly?.initPopupWidget({ url: 'https://calendly.com/slobin' })}
            >
              Schedule a conversation →
            </button>
          </>

        ) : (

          // ── Score 1/2: coordinator + question expander ─────────────────
          <>
            <p className="next-step__tagline">
              Your care team will be in touch within 1 business day.
            </p>

            <div className="estimate__question">
              {!questionSent ? (
                <>
                  <button
                    type="button"
                    className="estimate__question-toggle"
                    onClick={() => setQuestionOpen(v => !v)}
                  >
                    Have a question before then? Leave it here.
                  </button>
                  {questionOpen && (
                    <div className="estimate__question-field">
                      <textarea
                        className="estimate__question-textarea"
                        value={questionText}
                        onChange={e => setQuestionText(e.target.value)}
                        placeholder="Type your question…"
                        rows={3}
                      />
                      <button
                        type="button"
                        className="estimate__question-send"
                        onClick={handleSendQuestion}
                        disabled={!questionText.trim()}
                      >
                        Send
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="estimate__question-confirm">
                  Got it — we'll make sure they see it.
                </p>
              )}
            </div>
          </>

        )}

      </div>

      {/* ── Testimonials — shown to all patients ── */}
      <div className="next-step__testimonials">
        <div className="next-step__testimonials-rule" />
        <p className="next-step__testimonials-label">From patients like you</p>
        <div className={`next-step__testimonials-grid next-step__testimonials-grid--${testimonialCards.length}`}>
          {testimonialCards.map((card, i) => (
            <TestimonialCard key={i} {...card} />
          ))}
        </div>
      </div>

    </div>
  )
}
