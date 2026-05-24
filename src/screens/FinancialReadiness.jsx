const OPTIONS = [
  {
    label: "I've been saving for this and I'm financially ready.",
    value: 'ready',
  },
  {
    label: "I need to understand the investment before I start planning.",
    value: 'need_to_understand',
  },
  {
    label: "I'd like to explore financing options.",
    value: 'explore_financing',
  },
  {
    label: "I have funds ready — I'm focused on finding the right doctor.",
    value: 'funds_ready',
  },
]

const FINANCING_OPTIONS = [
  { label: "Yes — I'd like to know more about financing options.", value: true },
  { label: "No — I'm planning to pay out of pocket.", value: false },
]

// Option 3 ('explore_financing') already implies financing interest —
// auto-set true and skip the follow-up question.
const SKIP_FINANCING_VALUES = new Set(['explore_financing'])

export default function FinancialReadiness({
  value,
  onChange,
  financingValue,
  onFinancingChange,
  onContinue,
  onBack,
}) {
  const skipFollowUp = SKIP_FINANCING_VALUES.has(value)
  const showFollowUp = !!value && !skipFollowUp
  const bothAnswered = !!value && typeof financingValue === 'boolean'

  function handlePrimaryChange(val) {
    onChange(val)
    if (SKIP_FINANCING_VALUES.has(val)) {
      // Auto-capture financing interest — no follow-up needed
      onFinancingChange(true)
    } else if (SKIP_FINANCING_VALUES.has(value)) {
      // Switching away from a skip-value — clear the auto-set answer
      onFinancingChange(null)
    }
  }

  return (
    <div className="screen financial-readiness">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        How are you thinking about the investment?
      </h2>

      <div className="options">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            style={{ animationDelay: `${0.12 + i * 0.1}s` }}
            className={`option-card${value === opt.value ? ' option-card--selected' : ''}`}
            onClick={() => handlePrimaryChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reassurance — only shown before any selection is made */}
      {!value && (
        <p className="screen__reassurance">All answers are welcome here.</p>
      )}

      {/* Financing follow-up — only for options 1, 2, and 4 */}
      {showFollowUp && (
        <div className="financing-question">
          <p className="financing-question__label">Financing</p>
          <h3 className="financing-question__headline">
            Many of our patients choose a financing option for their procedure. Is this something you'd like to explore?
          </h3>
          <div className="options financing-question__options">
            {FINANCING_OPTIONS.map((opt, i) => (
              <button
                key={String(opt.value)}
                style={{ animationDelay: `${i * 0.08}s` }}
                className={`option-card${financingValue === opt.value ? ' option-card--selected' : ''}`}
                onClick={() => onFinancingChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="btn-continue-wrap">
        <button
          className={`btn-continue${bothAnswered ? ' btn-continue--visible' : ''}`}
          onClick={onContinue}
          disabled={!bothAnswered}
          aria-hidden={!bothAnswered}
        >
          Continue →
        </button>
      </div>

    </div>
  )
}
