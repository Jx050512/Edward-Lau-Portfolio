document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("fullName").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    let nameRegex = /^[A-Za-z\s]+$/;
    let phoneRegex = /^[0-9]{10,11}$/;
    let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!nameRegex.test(name)) {
        showError("fullName", "Full Name must contain letters only");
        return;
    }

    if (!phoneRegex.test(phone)) {
        showError("phone", "Phone number must be 10–11 digits");
        return;
    }

    if (!passwordRegex.test(password)) {
        showError("password", "Password must be at least 8 characters and include uppercase letters, numbers and symbols");
        return;
    }

    if (password !== confirmPassword) {
        showError("confirmPassword", "Passwords do not match");
        return;
    }

    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Registration successful") {
    showModal("success", "Success", data.message);
    document.getElementById("registerForm").reset();

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

    })
    .catch(() => {
        showModal("error", "Error", "Unable to connect to server");
    });
});

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add("error");

    showModal("error", "Validation Error", message);

    setTimeout(() => {
        input.classList.remove("error");
    }, 500);
}

function showModal(type, title, message) {
    const overlay = document.getElementById("modalOverlay");
    const box = document.getElementById("modalBox");

    box.className = "modal-box " + type;
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;

    overlay.style.display = "flex";
}

function closeModal() {
    document.getElementById("modalOverlay").style.display = "none";
}
