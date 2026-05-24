const OPTIONS = [
  {
    label: "I'm clear that this is something I want — I'm seriously considering moving forward.",
    value: 'high',
  },
  {
    label: "I'm close to a decision and want to explore this more thoughtfully.",
    value: 'medium',
  },
  {
    label: "I'm still early and trying to understand whether surgery is right for me.",
    value: 'low',
  },
]

export default function Readiness({ value, onChange, onContinue, onBack }) {
  return (
    <div className="screen readiness">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        Which of these feels closest to where you are right now?
      </h2>

      <div className="options">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            style={{ animationDelay: `${0.12 + i * 0.1}s` }}
            className={`option-card${value === opt.value ? ' option-card--selected' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="btn-continue-wrap">
        <button
          className={`btn-continue${value ? ' btn-continue--visible' : ''}`}
          onClick={onContinue}
          disabled={!value}
          aria-hidden={!value}
        >
          Continue →
        </button>
      </div>

    </div>
  )
}
