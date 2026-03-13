import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type UpdateEntry = {
  date: string;
  info: string;
};

function Block() {
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUpdates = async () => {
      try {
        const response = await fetch('/updates.json');
        if (!response.ok) {
          throw new Error('Failed to load updates.json');
        }
        const data = (await response.json()) as UpdateEntry[];
        setUpdates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadUpdates();
  }, []);

  return (
    <div className="center">
      <h2>Site Updates</h2>
      <hr />
      <p>
        <i>
          <q>Daily Posts about me ig</q>
        </i>
      </p>
      <hr />

      {error && <p>Could not load updates: {error}</p>}

      {!error && updates.length === 0 && <p>Loading…</p>}

      {updates.map((entry) => (
        <p key={`${entry.date}-${entry.info.slice(0, 16)}`}>
          <i>{entry.date}</i> - {entry.info}
        </p>
      ))}

      <hr />
      <Link to="/">Back</Link>
    </div>
  );
}

export default Block
