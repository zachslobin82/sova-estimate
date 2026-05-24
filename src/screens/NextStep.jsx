import { useState, useEffect } from 'react'

// ── Testimonial category sets ─────────────────────────────────────────────────
const BREAST_PROCS = new Set(['breast_aug', 'breast_lift', 'breast_reduction', 'breast_revision'])
const BODY_PROCS   = new Set(['tummy_tuck', 'lipo', 'mommy', 'body_lift', 'bbl'])
const FACE_PROCS   = new Set(['facelift', 'neck_lift', 'eyelid', 'brow_lift', 'rhinoplasty'])

// Unsplash direct CDN links — no API key required
const TESTIMONIALS = {
  breast1: {
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=300&fit=crop',
    quote: "I couldn't be happier with my results. Dr. Slenkovich and the entire team made me feel comfortable and heard every step of the way.",
  },
  breast2: {
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    quote: "The results look completely natural. I finally feel like myself again — I only wish I had done this sooner.",
  },
  body: {
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    quote: "From the first visit, Dr. Slenkovich was attentive to my concerns and addressed all my questions. He made me feel comfortable and cared for throughout the entire process.",
  },
  face: {
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=300&fit=crop',
    quote: "The results look completely natural. I look like myself again — just refreshed. The care and attention I received at CPSC was unlike anything I expected.",
  },
  other: {
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
    quote: "The team at CPSC treated me like family from the beginning. I felt I was in great hands throughout the entire experience.",
  },
}

function getTestimonialCards(proceduresSelected = []) {
  const s = new Set(proceduresSelected)
  const cards = []
  if ([...s].some(v => BREAST_PROCS.has(v))) {
    cards.push(TESTIMONIALS.breast1)
    cards.push(TESTIMONIALS.breast2)
  }
  if ([...s].some(v => BODY_PROCS.has(v))) cards.push(TESTIMONIALS.body)
  if ([...s].some(v => FACE_PROCS.has(v))) cards.push(TESTIMONIALS.face)
  return cards.length ? cards : [TESTIMONIALS.other]
}

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestimonialCard({ imageUrl, quote }) {
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
        <div className="next-step__testimonials-grid">
          {testimonialCards.map((card, i) => (
            <TestimonialCard key={i} {...card} />
          ))}
        </div>
      </div>

    </div>
  )
}
