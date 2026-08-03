const categoryLabels = {
  contemporary: 'Contemporary',
  classic: 'Classic',
  to_read: 'To Read',
}

function getLastName(author) {
  const parts = author.split(/\s+/).filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : author
}

function renderBooks(data) {
  const grouped = data.reduce((acc, book) => {
    const key = book.category || 'uncategorized'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(book)
    return acc
  }, {})

  const root = document.getElementById('books')
  if (!root) {
    return
  }

  root.innerHTML = ''

  Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .forEach((category) => {
      grouped[category].sort((a, b) => {
        const lastA = getLastName(a.author).toLowerCase()
        const lastB = getLastName(b.author).toLowerCase()
        if (lastA !== lastB) {
          return lastA.localeCompare(lastB)
        }
        return a.title.localeCompare(b.title)
      })

      const section = document.createElement('section')
      section.className = 'section'

      const heading = document.createElement('h3')
      heading.textContent = categoryLabels[category] || category
      section.appendChild(heading)

      const list = document.createElement('div')
      list.className = 'stack'

      grouped[category].forEach((book) => {
        const item = document.createElement('p')
        item.textContent =
          book.title +
          ' - ' +
          book.author +
          (book.year ? ` (${book.year})` : '') +
          (book.genre ? ` • ${book.genre}` : '') +
          (book.reread ? ' • reread' : '')
        list.appendChild(item)
      })

      section.appendChild(list)
      root.appendChild(section)
    })
}

fetch('/books.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load books: ${response.status}`)
    }
    return response.json()
  })
  .then(renderBooks)
  .catch((error) => {
    const root = document.getElementById('books')
    if (root) {
      root.textContent = error instanceof Error ? `Could not load books: ${error.message}` : 'Could not load books.'
    }
  })
