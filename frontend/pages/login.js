document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("passwordInput").value;

  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: password }),
  });

  const result = await response.json();

  if (result.status === "success") {
    window.location.href = "/updates";
  } else {
    document.getElementById("errorMessage").innerText = result.message;
  }
});
