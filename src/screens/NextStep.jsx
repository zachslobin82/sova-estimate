import { useState, useEffect } from 'react'

// ── Testimonial category sets ─────────────────────────────────────────────────
const BREAST_PROCS = new Set(['breast_aug', 'breast_lift', 'breast_reduction', 'breast_revision'])
const BODY_PROCS   = new Set(['tummy_tuck', 'lipo', 'mommy', 'body_lift', 'bbl'])
const FACE_PROCS   = new Set(['facelift', 'neck_lift', 'eyelid', 'brow_lift', 'rhinoplasty'])

// Unsplash direct CDN links — no API key required, &crop=face ensures centered portraits
const TESTIMONIALS = {
  breast1: {
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop&crop=face',
    quote: "I made my decision based on research and interviews with three surgeons. By doing this my choice was easy — I had the most confidence in Dr. Slenkovich and the whole team supporting me.",
    attribution: '— Verified CPSC Patient, Breast Lift',
  },
  breast2: {
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=400&fit=crop&crop=face',
    quote: "My results are fabulous, and they have emotionally transformed my life.",
    attribution: '— Rose R., Denver CO · Verified CPSC Patient',
  },
  body1: {
    imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=400&fit=crop&crop=face',
    quote: "Dr. Slenkovich is very patient, understanding, and genuinely cares about meeting your needs. He was attentive to my concerns and addressed all my questions about my tummy tuck. He made me feel comfortable and heard.",
    attribution: '— Verified CPSC Patient, Tummy Tuck',
  },
  body2: {
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&crop=face',
    quote: "Words cannot describe how amazed I am at my results. I am so thankful to Dr. Slenkovich and his staff for the top notch care I received.",
    attribution: '— Verified CPSC Patient, Body Procedures',
  },
  face: {
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=400&fit=crop&crop=face',
    quote: "I spent months looking, researching, and reading reviews and couldn't be happier I came to Dr. Slenkovich. Absolutely stellar results and exceptional care.",
    attribution: '— Verified CPSC Patient',
  },
  all: {
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=400&fit=crop&crop=face',
    quote: "Rarely have I seen such collaboration in any doctor's office. It's clear that Dr. Slenkovich has built a culture where patient well-being is a cornerstone. The entirety of the procedure and recovery has been nothing short of a transformative experience.",
    attribution: '— Verified CPSC Patient',
  },
}

function getTestimonialCards(proceduresSelected = []) {
  const s = new Set(proceduresSelected)
  const cards = []
  if ([...s].some(v => BREAST_PROCS.has(v))) {
    cards.push(TESTIMONIALS.breast1)
    cards.push(TESTIMONIALS.breast2)
  }
  if ([...s].some(v => BODY_PROCS.has(v))) {
    cards.push(TESTIMONIALS.body1)
    cards.push(TESTIMONIALS.body2)
  }
  if ([...s].some(v => FACE_PROCS.has(v))) {
    cards.push(TESTIMONIALS.face)
  }
  // Always append the universal "all patients" card
  cards.push(TESTIMONIALS.all)
  return cards
}

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestimonialCard({ imageUrl, quote, attribution }) {
  return (
    <div className="testimonial-card">
      <img
        src={imageUrl}
        alt=""
        className="testimonial-card__image"
        loading="lazy"
      />
      <div className="testimonial-card__body">
        <p className="testimonial-card__quote">"{quote}"</p>
        <p className="testimonial-card__attribution">{attribution}</p>
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
        <div className="next-step__testimonials-grid">
          {testimonialCards.map((card, i) => (
            <TestimonialCard key={i} {...card} />
          ))}
        </div>
      </div>

    </div>
  )
}
