import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="card stack-sm">
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link className="button" to="/">
        Go Home
      </Link>
    </section>
  )
}
