require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BCRYPT_ROUNDS = 10;

const allowedOrigins = (
    process.env.FRONTEND_ORIGINS ||
    "http://127.0.0.1:5500,http://localhost:5500"
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Allow non-browser tools and explicitly configured local/front-end origins.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Origin not allowed by CORS"));
    }
}));
app.use(express.json({ limit: "16kb" }));

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "SCMS_database"
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection error:", err.message);
        process.exitCode = 1;
        return;
    }
    console.log("MySQL connected");
});

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPhone(phone) {
    return /^[0-9]{10,11}$/.test(phone);
}

function validPassword(password) {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
}

app.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
});

app.post("/register", (req, res) => {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");

    if (!name || !email || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (!validEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email address"
        });
    }

    if (!validPhone(phone)) {
        return res.status(400).json({
            success: false,
            message: "Phone number must contain 10–11 digits"
        });
    }

    if (!validPassword(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters and include an uppercase letter, number and symbol"
        });
    }

    db.query("SELECT id FROM users WHERE email = ?", [email], (checkErr, rows) => {
        if (checkErr) {
            console.error("Email lookup failed:", checkErr.message);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        bcrypt.hash(password, BCRYPT_ROUNDS, (hashErr, passwordHash) => {
            if (hashErr) {
                console.error("Password hashing failed:", hashErr.message);
                return res.status(500).json({
                    success: false,
                    message: "Registration failed"
                });
            }

            const insertSql =
                "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";

            db.query(insertSql, [name, email, phone, passwordHash], insertErr => {
                if (insertErr) {
                    console.error("Registration insert failed:", insertErr.message);
                    return res.status(500).json({
                        success: false,
                        message: "Registration failed"
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: "Registration successful"
                });
            });
        });
    });
});

app.post("/login", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    db.query(
        "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
        [email],
        (err, rows) => {
            if (err) {
                console.error("Login query failed:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const user = rows[0];

            bcrypt.compare(password, user.password, (compareErr, matches) => {
                if (compareErr) {
                    console.error("Password comparison failed:", compareErr.message);
                    return res.status(500).json({
                        success: false,
                        message: "Login failed"
                    });
                }

                if (!matches) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }

                return res.json({
                    success: true,
                    message: "Login successful",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            });
        }
    );
});

app.use((err, _req, res, _next) => {
    if (err && err.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Request origin is not allowed"
        });
    }

    console.error("Unexpected server error:", err?.message || err);
    return res.status(500).json({
        success: false,
        message: "Unexpected server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
