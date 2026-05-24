import { PROCEDURE_GROUPS } from '../data/procedures'

export default function ProcedureSelection({ values = [], onChange, onContinue, onBack }) {
  function toggle(val) {
    const next = values.includes(val)
      ? values.filter(v => v !== val)
      : [...values, val]
    onChange(next)
  }

  return (
    <div className="screen procedure-selection">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        Which areas are you interested in exploring?
      </h2>

      <p className="screen__subtext">
        It's completely okay to explore more than one.
      </p>

      <div className="chip-sections">
        {PROCEDURE_GROUPS.map((group, gi) => (
          <div
            key={group.category}
            className="chip-section"
            style={{ animationDelay: `${0.1 + gi * 0.12}s` }}
          >
            <p className="chip-category">{group.category}</p>
            <div className="chip-grid">
              {group.items.map((proc, pi) => (
                <button
                  key={proc.value}
                  className={`chip${values.includes(proc.value) ? ' chip--selected' : ''}`}
                  style={{ animationDelay: `${0.1 + gi * 0.12 + pi * 0.04}s` }}
                  onClick={() => toggle(proc.value)}
                >
                  {proc.label}
                </button>
              ))}
            </div>
          </div>
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
