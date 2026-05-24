import { useState } from 'react'
import ProgressBar from './components/ProgressBar'
import Welcome from './screens/Welcome'
import Readiness from './screens/Readiness'
import Motivation from './screens/Motivation'
import ConversationalAI from './screens/ConversationalAI'
import ProcedureSelection from './screens/ProcedureSelection'
import Timing from './screens/Timing'
import FinancialReadiness from './screens/FinancialReadiness'
import SurgeonPreference from './screens/SurgeonPreference'
import LeadCapture from './screens/LeadCapture'
import Estimate from './screens/Estimate'
import NextStep from './screens/NextStep'
import { calculatePriorityScore, calculateSurgeonRecommendation } from './utils/scoring'

// Screen 5 (Timing) is skipped when readiness === 'low'
const TOTAL_SCREENS = 10

export default function App() {
  const [screen, setScreen] = useState(0)
  const [answers, setAnswers] = useState({})

  const skipTiming = answers.readiness === 'low'

  function next() {
    setScreen(prev => {
      if (prev === 4 && skipTiming) return 6
      return prev + 1
    })
  }

  function back() {
    setScreen(prev => {
      if (prev === 6 && skipTiming) return 4
      return Math.max(0, prev - 1)
    })
  }

  function setAnswer(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  // Screen 6 → compute + store priority score
  function handleFinancialContinue() {
    const score = calculatePriorityScore({
      readiness:          answers.readiness,
      financialReadiness: answers.financialReadiness,
      timingPreference:   answers.timingPreference,
    })
    setAnswer('priorityScore', score)
    next()
  }

  // Screen 7 → compute + store surgeon recommendation
  function handleSurgeonContinue() {
    const score = answers.priorityScore ?? calculatePriorityScore({
      readiness:          answers.readiness,
      financialReadiness: answers.financialReadiness,
      timingPreference:   answers.timingPreference,
    })
    const rec = calculateSurgeonRecommendation({
      surgeonPreference:  answers.surgeonPreference,
      readiness:          answers.readiness,
      financingInterest:  answers.financingInterest,
      priorityScore:      score,
      proceduresSelected: answers.proceduresSelected,
    })
    setAnswers(prev => ({ ...prev, priorityScore: score, surgeonRecommendation: rec }))
    next()
  }

  // Screen 8 → store contact info + confirm priority score
  function handleLeadSubmit(formData) {
    const score = answers.priorityScore ?? calculatePriorityScore({
      readiness:          answers.readiness,
      financialReadiness: answers.financialReadiness,
      timingPreference:   answers.timingPreference,
    })
    setAnswers(prev => ({
      ...prev,
      ...formData,       // firstName, lastName, email, phone, consent
      priorityScore: score,
    }))
    next()
  }

  // Progress: Screen 0 = 0%, screens 1-10 = n/TOTAL * 100
  // Screen 10 (NextStep) hits 100% — bar is fully filled on the handoff
  const progress = screen === 0 ? 0 : screen >= TOTAL_SCREENS ? 100 : (screen / TOTAL_SCREENS) * 100

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-header__name">Colorado Plastic Surgery Center</span>
      </header>
      <ProgressBar progress={progress} />

      {screen === 0 && (
        <Welcome onBegin={next} />
      )}
      {screen === 1 && (
        <Readiness
          value={answers.readiness}
          onChange={val => setAnswer('readiness', val)}
          onContinue={next}
          onBack={back}
        />
      )}
      {screen === 2 && (
        <Motivation
          values={answers.motivations || []}
          onChange={val => setAnswer('motivations', val)}
          onContinue={next}
          onBack={back}
        />
      )}
      {screen === 3 && (
        <ProcedureSelection
          values={answers.proceduresSelected || []}
          onChange={val => setAnswer('proceduresSelected', val)}
          onContinue={next}
          onBack={back}
        />
      )}
      {screen === 4 && (
        <ConversationalAI
          answers={answers}
          onConversationChange={history => setAnswer('conversationHistory', history)}
          onInitialText={text => setAnswer('patientOwnWords', text)}
          onContinue={next}
          onBack={back}
        />
      )}
      {screen === 5 && (
        <Timing
          value={answers.timingPreference}
          onChange={val => setAnswer('timingPreference', val)}
          onContinue={next}
          onBack={back}
        />
      )}
      {screen === 6 && (
        <FinancialReadiness
          value={answers.financialReadiness}
          onChange={val => setAnswer('financialReadiness', val)}
          financingValue={answers.financingInterest ?? null}
          onFinancingChange={val => setAnswer('financingInterest', val)}
          onContinue={handleFinancialContinue}
          onBack={back}
        />
      )}
      {screen === 7 && (
        <SurgeonPreference
          value={answers.surgeonPreference}
          onChange={val => setAnswer('surgeonPreference', val)}
          onContinue={handleSurgeonContinue}
          onBack={back}
        />
      )}
      {screen === 8 && (
        <LeadCapture
          initialValues={{
            firstName: answers.firstName || '',
            lastName:  answers.lastName  || '',
            email:     answers.email     || '',
            phone:     answers.phone     || '',
            consent:   answers.consent   || false,
          }}
          onContinue={handleLeadSubmit}
          onBack={back}
        />
      )}
      {screen === 9 && (
        <Estimate
          answers={answers}
          onView={() => setAnswer('estimateShown', true)}
          onContinue={next}
          onBack={back}
        />
      )}
      {screen >= 10 && (
        <NextStep answers={answers} />
      )}
    </div>
  )
}
