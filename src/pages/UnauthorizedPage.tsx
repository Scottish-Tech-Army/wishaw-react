import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <section className="card stack-sm">
      <h2>Access Denied</h2>
      <p>Your role does not have permission to access this page.</p>
      <Link className="button" to="/">
        Back to dashboard
      </Link>
    </section>
  )
}
