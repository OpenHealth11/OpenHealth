import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateEmail } from "../validation.js";
import { createUser, findUserByEmail } from "./userStore.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}
const JWT_SECRET = process.env.JWT_SECRET;

const PORT = Number(process.env.PORT) || 3001;
const SALT_ROUNDS = 10;

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const ROLES = new Set(["danisan", "diyetisyen"]);

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    status: u.status,
  };
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, passwordConfirm, fullName, role } = req.body ?? {};

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      return res.status(400).json({ error: emailCheck.error });
    }
    const normalizedEmail = emailCheck.value;
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Şifre gerekli." });
    }
    if (!ROLES.has(role)) {
      return res.status(400).json({ error: "Geçerli bir rol seçin (danisan | diyetisyen)." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Şifre en az 8 karakter olmalı." });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ error: "Şifreler eşleşmiyor." });
    }
    const name = typeof fullName === "string" ? fullName.trim() : "";
    if (!name) {
      return res.status(400).json({ error: "Ad soyad gerekli." });
    }

    if (findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ error: "Bu e-posta ile kayıt zaten var." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = createUser({
      fullName: name,
      email: normalizedEmail,
      passwordHash,
      role,
    });

    if (!user) {
      return res.status(409).json({ error: "Bu e-posta ile kayıt zaten var." });
    }

    if (role === "diyetisyen") {
      return res.status(201).json({
        user: publicUser(user),
        message:
          "Kaydınız alındı. Hesabınız admin onayından sonra aktif olacak.",
      });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    console.error("[register]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body ?? {};

    if (!password) {
      return res.status(400).json({ error: "E-posta ve şifre gerekli." });
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      return res.status(400).json({ error: emailCheck.error });
    }
    if (!ROLES.has(role)) {
      return res.status(400).json({ error: "Geçerli bir rol seçin." });
    }

    const user = findUserByEmail(emailCheck.value);
    if (!user) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı." });
    }
    if (user.role !== role) {
      return res.status(403).json({ error: "Bu hesap seçtiğiniz rol ile eşleşmiyor." });
    }

    if (typeof user.passwordHash !== "string" || !user.passwordHash) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı." });
    }
    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.passwordHash);
    } catch {
      return res.status(401).json({ error: "E-posta veya şifre hatalı." });
    }
    if (!ok) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı." });
    }

    const accountStatus = user.status ?? "approved";
    if (accountStatus === "pending") {
      return res.status(403).json({
        error:
          "Hesabınız admin onayı bekliyor. Lütfen daha sonra tekrar deneyin.",
      });
    }
    if (accountStatus === "rejected") {
      return res.status(403).json({ error: "Hesap başvurunuz reddedildi." });
    }
    if (accountStatus !== "approved") {
      return res.status(403).json({ error: "Hesabınız aktif değil." });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, user: publicUser(user) });
  } catch (e) {
    console.error("[login]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.get("/api/auth/me", (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkisiz." });
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ error: "Yetkisiz." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = typeof decoded.email === "string" ? decoded.email : null;
    if (!email) {
      return res.status(401).json({ error: "Yetkisiz." });
    }
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }
    return res.json(publicUser(user));
  } catch {
    return res.status(401).json({ error: "Yetkisiz." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/><title>OpenHealth API</title></head>
<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:2rem;line-height:1.5">
  <h1>OpenHealth API</h1>
  <p>Bu adres sadece REST API içindir; arayüz için Vite ile <strong>http://localhost:5173</strong> aç.</p>
  <p>Deneme: <a href="/api/health">/api/health</a></p>
</body></html>`);
});

app.listen(PORT, () => {
  console.log(`OpenHealth API → http://localhost:${PORT}/`);
  console.log(`Arayüz (Vite)  → http://localhost:5173  (ayrı: npm run dev)`);
});
