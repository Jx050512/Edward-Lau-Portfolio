fetch("http://localhost:3000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password })
})
.then(res => res.json())
.then(data => {
    if (data.success) {
        showModal("success", "Success", "Registration successful! Redirecting to login...");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    } else {
        showModal("error", "Error", data.message);
    }
})
.catch(() => {
    showModal("error", "Error", "Unable to connect to server");
});
