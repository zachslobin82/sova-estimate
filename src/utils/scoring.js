/**
 * Priority score — calculated silently after Screen 5, never shown raw to the user.
 *
 * Score 3 (Hot):    readiness = "high"  OR  financialReadiness = "funds_ready"
 *                   OR timingPreference = "1_3_months"
 * Score 2 (Warm):   readiness = "medium" AND financialReadiness in ["need_to_understand", "explore_financing"]
 * Score 1 (Nurture): everything else (including readiness = "low")
 */
/**
 * Surgeon recommendation — calculated silently after Screen 7, never shown to patient.
 * Slenkovich signals take priority when signals conflict; default is Slenkovich.
 */
export function calculateSurgeonRecommendation({
  surgeonPreference,
  readiness,
  financingInterest,
  priorityScore,
  proceduresSelected,
}) {
  const procCount  = (proceduresSelected || []).length
  const fitOrUnsure = surgeonPreference === 'fit' || surgeonPreference === 'unsure'

  const hasSlenkovich =
    surgeonPreference === 'experience' ||
    priorityScore === 3 ||
    procCount >= 3 ||
    (readiness === 'high' && financingInterest === false)

  const hasRoider =
    (fitOrUnsure && (readiness === 'low' || readiness === 'medium')) ||
    (fitOrUnsure && financingInterest === true) ||
    (procCount === 1 && readiness === 'low')

  if (hasSlenkovich) return 'Dr. Slenkovich'
  if (hasRoider) return 'Dr. Roider'
  return 'Dr. Slenkovich' // default when mixed or unclear
}

export function calculatePriorityScore({ readiness, financialReadiness, timingPreference }) {
  if (
    readiness === 'high' ||
    financialReadiness === 'funds_ready' ||
    timingPreference === '1_3_months'
  ) return 3

  if (
    readiness === 'medium' &&
    (financialReadiness === 'need_to_understand' || financialReadiness === 'explore_financing')
  ) return 2

  return 1
}
