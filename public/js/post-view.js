const params = new URLSearchParams(window.location.search)
const slug = params.get('slug')
const titleRoot = document.getElementById('title')
const contentRoot = document.getElementById('content')

if (!slug) {
    if (contentRoot) {
        contentRoot.textContent = 'Missing post slug.'
    }
} else {
    Promise.all([fetch('/posts.json'), fetch(`/posts/${slug}.md`)])
        .then(async ([indexResponse, markdownResponse]) => {
            if (!indexResponse.ok) {
                throw new Error(`Failed to load posts: ${indexResponse.status}`)
            }

            if (!markdownResponse.ok) {
                throw new Error(`Failed to load post: ${markdownResponse.status}`)
            }

            const posts = await indexResponse.json()
            const markdown = await markdownResponse.text()
            const post = posts.find((entry) => entry.slug === slug)

            if (titleRoot) {
                titleRoot.textContent = post ? post.title : slug
            }

            if (contentRoot) {
                contentRoot.textContent = markdown
            }
        })
        .catch((error) => {
            if (contentRoot) {
                contentRoot.textContent = error instanceof Error ? error.message : 'Unable to load post.'
            }
        })
}
