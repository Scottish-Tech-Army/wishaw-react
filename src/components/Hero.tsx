import "../App.css";

export default function Hero() {
  return (
    <section
      className="hero"
      id="home"
      aria-label="Hero: Welcome to WYMCA Esports"
    >
      <div className="hero__overlay">
        <div className="hero__content">
          <h1 className="hero__title">Welcome to WYMCA Esports</h1>
          <p className="hero__subtitle">
            Empowering young people through gaming, teamwork, and digital skills
            in Wishaw and beyond.
          </p>
          <a href="#get-involved" className="hero__cta">
            Get Involved
          </a>
        </div>
      </div>
    </section>
  );
}
