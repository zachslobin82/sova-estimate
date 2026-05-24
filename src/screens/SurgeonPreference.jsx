const OPTIONS = [
  {
    label: "I want the most experienced surgeon available — credentials and track record matter most to me.",
    value: 'experience',
  },
  {
    label: "I'm focused on finding the right practice and the right fit — I'm open to meeting whoever is best for my goals.",
    value: 'fit',
  },
  {
    label: "I'm not sure yet — I'd like to learn more before deciding.",
    value: 'unsure',
  },
]

export default function SurgeonPreference({ value, onChange, onContinue, onBack }) {
  return (
    <div className="screen surgeon-preference">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        When it comes to choosing a surgeon, what matters most to you?
      </h2>

      <p className="screen__subtext">
        There's no wrong answer — this helps us match you with the right fit.
      </p>

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
