import { Link, useSearchParams } from 'react-router-dom'

function Tbd() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');

  return (
    <div>
      <h1>TBD</h1>
      {topic && <p>Page for {topic} is coming soon.</p>}
      <Link to="/about">Back to About</Link>
      <div className="center-button">
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
}

export default Tbd;
