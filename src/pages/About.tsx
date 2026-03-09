import { Link, useNavigate } from 'react-router-dom'

const interests = [
  'Long distance running',
  'Books and novels',
  'Video games',
  'Music',
  'Movies',
];

function About() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>About</h1>
      <p>
        Hello! My name is Rohan. Here are a few interests I want to add more
        details about soon:
      </p>
      <div className="link-list">
        {interests.map((interest) => (
          <Link
            key={interest}
            className="link"
            to={`/tbd?topic=${encodeURIComponent(interest)}`}
          >
            {interest}
          </Link>
        ))}
      </div>
      <div className="center-button">
        <button onClick={() => navigate('/')}>Go back home</button>
      </div>
    </div>
  );
}

export default About;
