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

const updatesRoot = document.getElementById('updates')

fetch('/api/session', { credentials: 'include' })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to check session: ${response.status}`)
    }
    return response.json()
  })
  .then((session) => {
    if (!session.logged_in) {
      if (updatesRoot) {
        updatesRoot.innerHTML =
          '<p>You need to log in before you can view updates.</p><p><a href="/login/">Go to login</a></p>'
      }
      return null
    }

    return fetch('/api/updates', { credentials: 'include' })
  })
  .then((response) => {
    if (!response) {
      return null
    }

    if (response.status === 401) {
      if (updatesRoot) {
        updatesRoot.innerHTML =
          '<p>You need to log in before you can view updates.</p><p><a href="/login/">Go to login</a></p>'
      }
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to load updates: ${response.status}`)
    }

    return response.json()
  })
  .then((updates) => {
    if (!updates || !updatesRoot) {
      return
    }

    updatesRoot.innerHTML = ''

    if (updates.length === 0) {
      updatesRoot.textContent = 'No updates found yet.'
      return
    }

    const list = document.createElement('div')
    list.className = 'stack'

    updates.forEach((update) => {
      const item = document.createElement('div')
      item.textContent = `${formatDate(update.date)}: ${update.info}`
      list.appendChild(item)
    })

    updatesRoot.appendChild(list)
  })
  .catch((error) => {
    if (updatesRoot) {
      updatesRoot.textContent = error instanceof Error ? error.message : 'Failed to load updates.'
    }
  })
