import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Book = {
  title: string;
  author: string;
  year: number | null;
  genre: string | null;
  category: string | null;
  reread: boolean;
  rating: number | null;
};

const getLastName = (author: string) => {
  const parts = author
    .split(/\s+/)
    .filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : author;
};

const categoryLabels: Record<string, string> = {
  contemporary: 'Contemporary',
  classic: 'Classic',
  to_read: 'To Read',
};

function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try { //thank you llm very cool :TODO: clean this up
        const response = await fetch('/books.json');
        if (!response.ok) {
          throw new Error('Failed to load books.json');
        }
        const data = (await response.json()) as Book[];
        setBooks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadBooks();
  }, []);

  const groupedBooks = useMemo(() => {
    return books.reduce<Record<string, Book[]>>((acc, book) => {
      const key = book.category ?? 'uncategorized';
      if (!acc[key]) acc[key] = [];
      acc[key].push(book);
      return acc;
    }, {});
  }, [books]);

  const sortedGroupedBooks = useMemo(() => {
    return Object.fromEntries(
      Object.entries(groupedBooks).map(([category, list]) => [
        category,
        [...list].sort((a, b) => {
          const lastA = getLastName(a.author).toLowerCase();
          const lastB = getLastName(b.author).toLowerCase();
          if (lastA !== lastB) return lastA.localeCompare(lastB);
          return a.title.localeCompare(b.title);
        }),
      ]),
    );
  }, [groupedBooks]);

  const categories = useMemo(() => {
    return Object.keys(groupedBooks).sort((a, b) => a.localeCompare(b));
  }, [groupedBooks]);

  return (
    <div className="center">
      <h2>Bookshelf</h2>
      <hr />

      <p>
        <i>
           Books that I liked in the last couple years. maybe ill make a bigger one with books i disliked but all of these i would recomend.
        </i>
      </p>

      {error && <p>Could not load books: {error}</p>}

      {!error && categories.length === 0 && <p>Loading…</p>}

      {categories.map((category) => (
        <section key={category}>
          <h3>{categoryLabels[category] ?? category}</h3>
          <table className="books-table">
            <tbody>
              {sortedGroupedBooks[category]?.map((book) => (
                <tr key={`${book.title}-${book.author}`}>
                  <td>
                    {book.title} — {book.author}
                    {book.year ? ` (${book.year})` : ''}
                    {book.genre ? ` • ${book.genre}` : ''}
                    {book.reread ? ' • reread' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <hr />
      <Link to="/">Back</Link>
    </div>
  );
}

export default Books