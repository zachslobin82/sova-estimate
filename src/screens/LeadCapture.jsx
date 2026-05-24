import { useState } from 'react'

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', consent: false }

export default function LeadCapture({ initialValues = {}, onContinue, onBack }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialValues })

  const canSubmit =
    form.firstName.trim() !== '' &&
    form.lastName.trim()  !== '' &&
    form.email.trim()     !== '' &&
    form.phone.trim()     !== ''

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onContinue(form)
  }

  return (
    <div className="screen lead-capture">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        Let's personalize your estimate.
      </h2>

      <p className="screen__subtext">
        This allows our team to prepare something specific to you.
      </p>

      <form className="lead-form" onSubmit={handleSubmit} noValidate>

        {/* Row 1: First + Last (side by side) */}
        <div
          className="lead-form__field"
          style={{ animationDelay: '0.18s' }}
        >
          <label className="lead-form__label" htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            className="lead-form__input"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={e => set('firstName', e.target.value)}
          />
        </div>

        <div
          className="lead-form__field"
          style={{ animationDelay: '0.24s' }}
        >
          <label className="lead-form__label" htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            className="lead-form__input"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={e => set('lastName', e.target.value)}
          />
        </div>

        {/* Row 2: Email (full width) */}
        <div
          className="lead-form__field lead-form__field--full"
          style={{ animationDelay: '0.32s' }}
        >
          <label className="lead-form__label" htmlFor="email">Email</label>
          <input
            id="email"
            className="lead-form__input"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
          />
        </div>

        {/* Row 3: Phone (full width, required) */}
        <div
          className="lead-form__field lead-form__field--full"
          style={{ animationDelay: '0.4s' }}
        >
          <label className="lead-form__label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            className="lead-form__input"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
        </div>

        {/* Consent checkbox */}
        <div
          className="lead-form__consent lead-form__field--full"
          style={{ animationDelay: '0.5s' }}
        >
          <label className="lead-form__consent-label">
            <input
              className="lead-form__checkbox"
              type="checkbox"
              checked={form.consent}
              onChange={e => set('consent', e.target.checked)}
            />
            <span className="lead-form__consent-text">
              By continuing, I agree to receive communications from Colorado Plastic Surgery Center
              regarding my inquiry. Message and data rates may apply. Reply STOP to opt out.
            </span>
          </label>
        </div>

        {/* Submit CTA */}
        <div
          className="lead-form__field--full lead-form__cta"
          style={{ animationDelay: '0.58s' }}
        >
          <button
            type="submit"
            className={`btn-submit${canSubmit ? ' btn-submit--active' : ''}`}
            disabled={!canSubmit}
          >
            Continue with my estimate →
          </button>
        </div>

      </form>
    </div>
  )
}
