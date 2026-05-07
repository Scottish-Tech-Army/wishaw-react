import "../App.css";

const news = [
  {
    title: "WYMCA Wins Regional Esports Cup!",
    date: "March 2026",
    desc: "Our Overwatch team took home the trophy at the Yorkshire Youth Esports Cup.",
    link: "#",
  },
  {
    title: "New Digital Skills Workshops Launched",
    date: "February 2026",
    desc: "Sign up for our new series of workshops on streaming, video editing, and more!",
    link: "#",
  },
  {
    title: "Community Gaming Night Success",
    date: "January 2026",
    desc: "Thanks to everyone who joined our first gaming night of the year!",
    link: "#",
  },
];

export default function News() {
  return (
    <section className="news" id="news">
      <h2>Latest News</h2>
      <div className="news__grid">
        {news.map((n) => (
          <a className="news__card" key={n.title} href={n.link}>
            <div className="news__date">{n.date}</div>
            <h3>{n.title}</h3>
            <p>{n.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
