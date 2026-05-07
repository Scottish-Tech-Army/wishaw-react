import "../App.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">WYMCA Esports &copy; {new Date().getFullYear()}</div>
        <div className="footer__links">
          <a href="#about">About</a>
          <a href="#get-involved">Get Involved</a>
          <a href="#news">News</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="footer__social">
          {/* Replace with lucide-react icons after install */}
          <a href="https://twitter.com/wymcaesports" aria-label="Twitter">🐦</a>
          <a href="mailto:info@wymcaesports.co.uk" aria-label="Email">✉️</a>
        </div>
      </div>
    </footer>
  );
}
