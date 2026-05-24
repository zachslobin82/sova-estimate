export default function Welcome({ onBegin }) {
  return (
    <div className="screen welcome">

      <p className="welcome__practice">Colorado Plastic Surgery Center</p>

      <div className="welcome__ornament">
        <span className="welcome__ornament-line" />
        <span className="welcome__ornament-diamond">◆</span>
        <span className="welcome__ornament-line" />
      </div>

      <h1 className="welcome__headline">
        Planning a cosmetic procedure is a deeply personal decision.
      </h1>

      <p className="welcome__body">
        We approach everything with care, intention, and respect for what goes
        into making the right choice. This takes about four minutes — we'll
        prepare a personalized investment estimate just for you.
      </p>

      <p className="welcome__disclaimer">
        Any final recommendations can only be made after meeting with your
        doctor and discussing your specific goals, anatomy, and timeline.
      </p>

      <button className="btn-primary" onClick={onBegin}>
        Begin my exploration →
      </button>

    </div>
  )
}
