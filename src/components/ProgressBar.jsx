export default function ProgressBar({ progress }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${progress}%` }} />
    </div>
  )
}
