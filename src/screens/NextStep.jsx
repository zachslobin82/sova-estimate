import { useState, useEffect } from 'react'

export default function NextStep({ answers }) {
  const { priorityScore } = answers

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
    </div>
  )
}
