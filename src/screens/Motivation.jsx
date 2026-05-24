const OPTIONS = [
  {
    label: "I want to feel more confident in how I present myself.",
    value: 'confidence',
  },
  {
    label: "Something has bothered me for a long time and I'm ready to address it.",
    value: 'longstanding',
  },
  {
    label: "My body no longer feels aligned with how I see myself.",
    value: 'alignment',
  },
  {
    label: "I'm entering a new phase of life and want my body to reflect that.",
    value: 'new_phase',
  },
  {
    label: "I just want to look better — no deeper reason needed.",
    value: 'aesthetic',
  },
]

export default function Motivation({ values = [], onChange, onContinue, onBack }) {
  function toggle(val) {
    const next = values.includes(val)
      ? values.filter(v => v !== val)
      : [...values, val]
    onChange(next)
  }

  return (
    <div className="screen motivation">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        What's drawing you toward this?
      </h2>

      <p className="screen__subtext">Select all that feel true.</p>

      <div className="options">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            style={{ animationDelay: `${0.12 + i * 0.1}s` }}
            className={`option-card${values.includes(opt.value) ? ' option-card--selected' : ''}`}
            onClick={() => toggle(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="btn-continue-wrap">
        <button
          className={`btn-continue${values.length > 0 ? ' btn-continue--visible' : ''}`}
          onClick={onContinue}
          disabled={values.length === 0}
          aria-hidden={values.length === 0}
        >
          Continue →
        </button>
      </div>

    </div>
  )
}
