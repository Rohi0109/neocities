const loginForm = document.getElementById('login-form')

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        const message = document.getElementById('message')
        const passwordInput = document.getElementById('password')
        const password = passwordInput ? passwordInput.value : ''

        if (message) {
            message.textContent = ''
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ password }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || `Login failed: ${response.status}`)
            }

            window.location.href = '/updates/'
        } catch (error) {
            if (message) {
                message.textContent = error instanceof Error ? error.message : 'Unable to log in.'
            }
        }
    })
}
