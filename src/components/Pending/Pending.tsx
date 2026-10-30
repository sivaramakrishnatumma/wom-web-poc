import './Pending.css'

// Animated dots with a status label, e.g. "Translating…"
function Pending({ label }: { label: string }) {
  return (
    <span className="pending">
      <span className="typing" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label}
    </span>
  )
}

export default Pending
