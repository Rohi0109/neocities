function formatDate(value) {
    const parsed = new Date(`${value.trim()}T00:00:00`)
    return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(parsed)
}

const postsRoot = document.getElementById('posts')

fetch('/posts.json')
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to load posts: ${response.status}`)
        }
        return response.json()
    })
    .then((posts) => {
        if (!postsRoot) {
            return
        }

        postsRoot.innerHTML = ''

        const list = document.createElement('div')
        list.className = 'stack'

        posts
            .slice()
            .reverse()
            .forEach((post) => {
                const link = document.createElement('a')
                link.href = `/posts/view.html?slug=${encodeURIComponent(post.slug)}`
                link.textContent = `${post.title} (${formatDate(post.date)})`
                list.appendChild(link)
            })

        postsRoot.appendChild(list)
    })
    .catch((error) => {
        if (postsRoot) {
            postsRoot.textContent =
                error instanceof Error ? `Unable to load posts: ${error.message}` : 'Unable to load posts.'
        }
    })
