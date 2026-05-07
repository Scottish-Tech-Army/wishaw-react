import "../App.css";

const partners = [
  {
    name: "Wishaw YMCA",
    logo: "https://wymcaesports.co.uk/wp-content/uploads/2023/10/wishaw-ymca-logo.png",
    url: "https://wishawymca.org/",
  },
  {
    name: "Esports England",
    logo: "https://wymcaesports.co.uk/wp-content/uploads/2023/10/esports-england-logo.png",
    url: "https://esportsengland.co.uk/",
  },
  // Add more as needed
];

export default function Partners() {
  return (
    <section className="partners">
      <h2>Our Partners</h2>
      <div className="partners__logos">
        {partners.map((p) => (
          <a href={p.url} key={p.name} className="partners__logo" target="_blank" rel="noopener noreferrer">
            <img src={p.logo} alt={p.name} />
          </a>
        ))}
      </div>
    </section>
  );
}
