import "../App.css";

const programs = [
  {
    title: "Esports Teams",
    desc: "Join our competitive teams and represent WYMCA in national tournaments.",
    icon: "🎮",
  },
  {
    title: "Workshops & Training",
    desc: "Level up your skills with coaching, digital literacy, and teamwork workshops.",
    icon: "🧑‍💻",
  },
  {
    title: "Community Events",
    desc: "Participate in fun gaming nights, LAN parties, and social events.",
    icon: "🤝",
  },
];

export default function Programs() {
  return (
    <section className="programs" id="get-involved">
      <h2>Get Involved</h2>
      <div className="programs__grid">
        {programs.map((p) => (
          <div className="programs__card" key={p.title}>
            <div className="programs__icon">{p.icon}</div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
