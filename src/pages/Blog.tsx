import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from 'react-markdown'

type PostMeta = {
  slug: string;
  title: string;
  date: string;
};

function Blog() {
  const { slug } = useParams();
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/posts.json');
        if (!response.ok) throw new Error('Failed to load posts.json');
        const data = (await response.json()) as PostMeta[];
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    loadPosts();
  }, []);

  useEffect(() => {
    if (!slug) {
      setContent(null);
      return;
    }
    const loadPost = async () => {
      try {
        const response = await fetch(`/posts/${slug}.md`);
        if (!response.ok) throw new Error('Post not found');
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    loadPost();
  }, [slug]);

  // Show individual post
  if (slug && content) {
    return (
      <div className="center">
        <Markdown>{content}</Markdown>
        <hr />
        <Link to="/blog">Back to posts</Link>
      </div>
    );
  }

  // Show post list
  return (
    <div className="center">
      <h2>The Commonplace</h2>
      <hr />

      {error && <p>Could not load posts: {error}</p>}

      {!error && posts.length === 0 && <p>Loading…</p>}

      <h3>My pieces on stuff i do and think about</h3>
      <table>
        <tbody>
          {posts.map((post) => (
            <tr key={post.slug}>
              <td>
                <Link to={`/blog/${post.slug}`}>
                  {post.title}, {post.date}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />
      <Link to="/">Back</Link>
    </div>
  );
}

export default Blog
