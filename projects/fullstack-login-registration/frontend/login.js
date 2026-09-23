const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
            console.log("LOGIN RESPONSE:", data);

            if (data.success) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", data.user.name);

                // ✅ 这里一定会跳
                window.location.href = "dashboard.html";
            } else {
                showModal("error", "Login Failed", data.message);
            }
        })
        .catch(err => {
            console.error(err);
            showModal("error", "Error", "Cannot connect to server");
        });
    });
}
