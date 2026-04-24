import crypto from "crypto";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateEmail } from "../validation.js";
import {
  createUser,
  findUserByEmail,
  setResetToken,
  findUserByResetToken,
  updateUserPassword,
  updateUserProfile,
  updateUserHealthInfo,
  getUserMeasurements,
  addUserMeasurement,
  getClientsByDietitianId,
} from "./userStore.js";
import {
  getPlansByDietitianId,
  createPlan,
  deletePlan,
  getMealsByPlanId,
  addMealToPlan,
  deleteMealFromPlan,
} from "./planStore.js";

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
    boy: u.boy ?? "",
    kilo: u.kilo ?? "",
    hedef: u.hedef ?? "",
    alerji: u.alerji ?? "",
    hastalik: u.hastalik ?? "",
    kanGrubu: u.kanGrubu ?? "",
    dogumTarihi: u.dogumTarihi ?? "",
    cinsiyet: u.cinsiyet ?? "",
    aktiviteSeviyesi: u.aktiviteSeviyesi ?? "",
    kronikRahatsizlik: u.kronikRahatsizlik ?? "",
    kullanilanIlaclar: u.kullanilanIlaclar ?? "",
    ameliyatGecmisi: u.ameliyatGecmisi ?? "",
    sigaraAlkol: u.sigaraAlkol ?? "",
    saglikNotu: u.saglikNotu ?? "",
  };
}

function getUserFromAuthHeader(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = typeof decoded.email === "string" ? decoded.email : null;
    if (!email) return null;

    return findUserByEmail(email);
  } catch {
    return null;
  }
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


app.post("/api/auth/forgot-password", (req, res) => {
  try {
    const { email } = req.body ?? {};

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      return res.status(400).json({ error: emailCheck.error });
    }

    const user = findUserByEmail(emailCheck.value);

    if (user) {
      const resetToken = crypto.randomBytes(24).toString("hex");
      const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      setResetToken(user.email, resetToken, resetTokenExpiresAt);

      console.log("[forgot-password] reset token:", resetToken);
    }

    return res.json({
      message: "Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.",
    });
  } catch (e) {
    console.error("[forgot-password]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword, newPasswordConfirm } = req.body ?? {};

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Geçerli bir token gerekli." });
    }

    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ error: "Yeni şifre gerekli." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Şifre en az 8 karakter olmalı." });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ error: "Şifreler eşleşmiyor." });
    }

    const user = findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: "Geçersiz veya kullanılmış token." });
    }

    if (!user.resetTokenExpiresAt || new Date(user.resetTokenExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "Token süresi dolmuş." });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    updateUserPassword(user.id, passwordHash);

    return res.json({ message: "Şifreniz başarıyla güncellendi." });
  } catch (e) {
    console.error("[reset-password]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.get("/api/profile", (req, res) => {
  const user = getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ error: "Yetkisiz." });
  }

  return res.json(publicUser(user));
});

app.put("/api/profile", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    const {
      fullName,
      boy,
      kilo,
      hedef,
      alerji,
      hastalik,
    } = req.body ?? {};

    const name = typeof fullName === "string" ? fullName.trim() : "";
    if (!name) {
      return res.status(400).json({ error: "Ad soyad gerekli." });
    }

    const updated = updateUserProfile(user.id, {
      fullName: name,
      boy,
      kilo,
      hedef,
      alerji,
      hastalik,
    });

    if (!updated) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    return res.json({
      message: "Profil bilgileri güncellendi.",
      user: publicUser(updated),
    });
  } catch (e) {
    console.error("[profile-update]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.get("/api/health-info", (req, res) => {
  const user = getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ error: "Yetkisiz." });
  }

  return res.json({
    kanGrubu: user.kanGrubu ?? "",
    dogumTarihi: user.dogumTarihi ?? "",
    cinsiyet: user.cinsiyet ?? "",
    aktiviteSeviyesi: user.aktiviteSeviyesi ?? "",
    kronikRahatsizlik: user.kronikRahatsizlik ?? "",
    kullanilanIlaclar: user.kullanilanIlaclar ?? "",
    ameliyatGecmisi: user.ameliyatGecmisi ?? "",
    sigaraAlkol: user.sigaraAlkol ?? "",
    saglikNotu: user.saglikNotu ?? "",
  });
});

app.put("/api/health-info", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    const {
      kanGrubu,
      dogumTarihi,
      cinsiyet,
      aktiviteSeviyesi,
      kronikRahatsizlik,
      kullanilanIlaclar,
      ameliyatGecmisi,
      sigaraAlkol,
      saglikNotu,
    } = req.body ?? {};

    const updated = updateUserHealthInfo(user.id, {
      kanGrubu,
      dogumTarihi,
      cinsiyet,
      aktiviteSeviyesi,
      kronikRahatsizlik,
      kullanilanIlaclar,
      ameliyatGecmisi,
      sigaraAlkol,
      saglikNotu,
    });

    if (!updated) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    return res.json({
      message: "Sağlık bilgileri güncellendi.",
      healthInfo: {
        kanGrubu: updated.kanGrubu ?? "",
        dogumTarihi: updated.dogumTarihi ?? "",
        cinsiyet: updated.cinsiyet ?? "",
        aktiviteSeviyesi: updated.aktiviteSeviyesi ?? "",
        kronikRahatsizlik: updated.kronikRahatsizlik ?? "",
        kullanilanIlaclar: updated.kullanilanIlaclar ?? "",
        ameliyatGecmisi: updated.ameliyatGecmisi ?? "",
        sigaraAlkol: updated.sigaraAlkol ?? "",
        saglikNotu: updated.saglikNotu ?? "",
      },
    });
  } catch (e) {
    console.error("[health-info-update]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.get("/api/measurements", (req, res) => {
  const user = getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ error: "Yetkisiz." });
  }

  const measurements = getUserMeasurements(user.id);
  if (measurements === null) {
    return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  }

  return res.json({ measurements });
});

app.post("/api/measurements", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    const {
      tarih,
      kilo,
      boy,
      belCevresi,
      kalcaCevresi,
      yagOrani,
      not,
    } = req.body ?? {};

    if (!tarih || typeof tarih !== "string") {
      return res.status(400).json({ error: "Tarih gerekli." });
    }

    const measurement = addUserMeasurement(user.id, {
      tarih,
      kilo,
      boy,
      belCevresi,
      kalcaCevresi,
      yagOrani,
      not,
    });

    if (!measurement) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    return res.status(201).json({
      message: "Ölçüm kaydı eklendi.",
      measurement,
    });
  } catch (e) {
    console.error("[measurements-create]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.get("/api/diyetisyen/clients", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    if (user.role !== "diyetisyen") {
      return res.status(403).json({
        error: "Bu işlem yalnızca diyetisyen kullanıcılar içindir.",
      });
    }

    const clients = getClientsByDietitianId(user.id);

    return res.json({
      clients: clients.map((client) => publicUser(client)),
    });
  } catch (e) {
    console.error("[dietitian-clients]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.get("/api/plans", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    if (user.role !== "diyetisyen") {
      return res.status(403).json({
        error: "Bu işlem yalnızca diyetisyen kullanıcılar içindir.",
      });
    }

    const plans = getPlansByDietitianId(user.id);

    return res.json({ plans });
  } catch (e) {
    console.error("[plans-list]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.post("/api/plans", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    if (user.role !== "diyetisyen") {
      return res.status(403).json({
        error: "Bu işlem yalnızca diyetisyen kullanıcılar içindir.",
      });
    }

    const { danisanAdi, baslik } = req.body ?? {};

    if (!danisanAdi || typeof danisanAdi !== "string" || !danisanAdi.trim()) {
      return res.status(400).json({ error: "Danışan adı gerekli." });
    }

    if (!baslik || typeof baslik !== "string" || !baslik.trim()) {
      return res.status(400).json({ error: "Plan başlığı gerekli." });
    }

    const plan = createPlan({
      danisanAdi,
      baslik,
      createdBy: user.id,
    });

    return res.status(201).json({
      message: "Plan oluşturuldu.",
      plan,
    });
  } catch (e) {
    console.error("[plans-create]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.delete("/api/plans/:id", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    if (user.role !== "diyetisyen") {
      return res.status(403).json({
        error: "Bu işlem yalnızca diyetisyen kullanıcılar içindir.",
      });
    }

    const deleted = deletePlan(req.params.id, user.id);

    if (!deleted) {
      return res.status(404).json({ error: "Plan bulunamadı." });
    }

    return res.json({
      message: "Plan silindi.",
      plan: deleted,
    });
  } catch (e) {
    console.error("[plans-delete]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.get("/api/plans/:id/meals", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    if (user.role !== "diyetisyen") {
      return res.status(403).json({
        error: "Bu işlem yalnızca diyetisyen kullanıcılar içindir.",
      });
    }

    const meals = getMealsByPlanId(req.params.id, user.id);

    if (meals === null) {
      return res.status(404).json({ error: "Plan bulunamadı." });
    }

    return res.json({ meals });
  } catch (e) {
    console.error("[plan-meals-list]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.post("/api/plans/:id/meals", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    if (user.role !== "diyetisyen") {
      return res.status(403).json({
        error: "Bu işlem yalnızca diyetisyen kullanıcılar içindir.",
      });
    }

    const { ogun, detay, kalori } = req.body ?? {};

    if (!ogun || typeof ogun !== "string" || !ogun.trim()) {
      return res.status(400).json({ error: "Öğün adı gerekli." });
    }

    if (!detay || typeof detay !== "string" || !detay.trim()) {
      return res.status(400).json({ error: "Öğün detayı gerekli." });
    }

    if (kalori === undefined || Number.isNaN(Number(kalori))) {
      return res.status(400).json({ error: "Geçerli bir kalori değeri gerekli." });
    }

    const meal = addMealToPlan(req.params.id, user.id, {
      ogun,
      detay,
      kalori,
    });

    if (!meal) {
      return res.status(404).json({ error: "Plan bulunamadı." });
    }

    return res.status(201).json({
      message: "Plana öğün eklendi.",
      meal,
    });
  } catch (e) {
    console.error("[plan-meals-create]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.delete("/api/plans/:planId/meals/:mealId", (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz." });
    }

    if (user.role !== "diyetisyen") {
      return res.status(403).json({
        error: "Bu işlem yalnızca diyetisyen kullanıcılar içindir.",
      });
    }

    const deletedMeal = deleteMealFromPlan(
      req.params.planId,
      req.params.mealId,
      user.id
    );

    if (!deletedMeal) {
      return res.status(404).json({ error: "Plan veya öğün bulunamadı." });
    }

    return res.json({
      message: "Öğün silindi.",
      meal: deletedMeal,
    });
  } catch (e) {
    console.error("[plan-meals-delete]", e);
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
