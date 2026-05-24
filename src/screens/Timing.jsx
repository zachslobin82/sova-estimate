const OPTIONS = [
  {
    label: "In the next 1–3 months",
    value: '1_3_months',
  },
  {
    label: "Later this year",
    value: 'later_year',
  },
  {
    label: "I'm flexible — the right fit matters more than timing",
    value: 'flexible',
  },
  {
    label: "I'm not sure yet",
    value: 'not_sure',
  },
]

export default function Timing({ value, onChange, onContinue, onBack }) {
  return (
    <div className="screen timing">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        When are you thinking about moving forward?
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
