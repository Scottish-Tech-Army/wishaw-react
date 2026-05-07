import "../App.css";

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about__container">
        <div className="about__text">
          <h2>About WYMCA Esports</h2>
          <p>
            WYMCA Esports is a youth-led initiative based in Wishaw, dedicated to empowering young people through the world of esports. We provide a safe, inclusive, and inspiring environment for young gamers to develop teamwork, leadership, and digital skills.
          </p>
          <p>
            Our mission is to use gaming as a force for good—helping young people build confidence, make friends, and unlock new opportunities in the digital age.
          </p>
        </div>
        <div className="about__image">
          {/* Replace with actual image if available */}
          <img src="https://wymcaesports.co.uk/wp-content/uploads/2023/10/IMG_20231025_173325-scaled.jpg" alt="WYMCA Esports Team" />
        </div>
      </div>
    </section>
  );
}
