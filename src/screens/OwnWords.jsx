import { useState, useEffect, useRef } from 'react'

// Mic icon SVG
function MicIcon({ active }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9"  y1="22" x2="15" y2="22" />
    </svg>
  )
}

export default function OwnWords({ value = '', onChange, onContinue, onBack }) {
  const [text, setText]               = useState(value)
  const [isRecording, setIsRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const recognitionRef = useRef(null)

  // Detect Web Speech API support once on mount
  useEffect(() => {
    setSpeechAvailable(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
    // Clean up any active recognition on unmount
    return () => recognitionRef.current?.abort()
  }, [])

  function handleTextChange(val) {
    setText(val)
    onChange(val)
  }

  function toggleRecording() {
    if (isRecording) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return

    const rec = new SpeechRec()
    rec.continuous      = true
    rec.interimResults  = true
    rec.lang            = 'en-US'

    rec.onresult = e => {
      let finalChunk  = ''
      let interimChunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalChunk   += e.results[i][0].transcript
        else                       interimChunk += e.results[i][0].transcript
      }
      if (finalChunk) {
        setText(prev => {
          const joined = prev + (prev.trim() ? ' ' : '') + finalChunk.trim()
          onChange(joined)
          return joined
        })
        setInterimText('')
      } else {
        setInterimText(interimChunk)
      }
    }

    rec.onerror = () => { setIsRecording(false); setInterimText('') }
    rec.onend   = () => { setIsRecording(false); setInterimText('') }

    rec.start()
    recognitionRef.current = rec
    setIsRecording(true)
  }

  function handleSkip() {
    recognitionRef.current?.abort()
    onChange('')
    onContinue()
  }

  function handleContinue() {
    recognitionRef.current?.stop()
    onChange(text)
    onContinue()
  }

  return (
    <div className="screen own-words">

      <button className="btn-back" onClick={onBack}>← Back</button>

      <h2 className="screen__headline">
        What would you want your doctor to know before you met?
      </h2>

      <p className="own-words__subtext">
        This goes directly to your care team — in your words, not a checkbox.
      </p>

      <div className="own-words__field">
        <textarea
          className="own-words__textarea"
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          placeholder="Share whatever feels relevant — there are no wrong answers."
          rows={5}
          aria-label="Share anything on your mind"
        />

        {/* Live interim transcription indicator */}
        {isRecording && interimText && (
          <p className="own-words__interim" aria-live="polite">
            {interimText}
          </p>
        )}
      </div>

      {/* Mic + Skip row */}
      <div className="own-words__controls">
        {speechAvailable && (
          <button
            type="button"
            className={`own-words__mic${isRecording ? ' own-words__mic--recording' : ''}`}
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Dictate with microphone'}
          >
            <MicIcon active={isRecording} />
            <span>{isRecording ? 'Listening…' : 'Use voice'}</span>
          </button>
        )}

        <button type="button" className="own-words__skip" onClick={handleSkip}>
          Skip
        </button>
      </div>

      {/* Continue — always visible, never gated */}
      <div className="btn-continue-wrap">
        <button
          type="button"
          className="btn-continue btn-continue--visible"
          onClick={handleContinue}
        >
          Continue →
        </button>
      </div>

    </div>
  )
}
