import crypto from "crypto";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateEmail } from "../validation.js";
import { getClientsByDiyetisyenId } from "./userStore.js";
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
  listApprovedDanisanlar,
} from "./userStore.js";
import {
  listPlansByDietitian,
  getPlanByDietitian,
  createPlanForDietitian,
  updatePlanForDietitian,
  addPlanOgun,
  updatePlanOgun,
  deletePlanOgun,
  deletePlanByDietitian,
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

function requireDiyetisyen(req, res) {
  const user = getUserFromAuthHeader(req);
  if (!user) {
    res.status(401).json({ error: "Yetkisiz." });
    return null;
  }
  if (user.role !== "diyetisyen") {
    res.status(403).json({ error: "Bu işlem için diyetisyen hesabı gerekli." });
    return null;
  }
  return user;
}

function planErrorResponse(res, result) {
  if (result.code === "VALIDATION") {
    return res.status(400).json({ error: "Geçersiz veya eksik alanlar." });
  }
  if (result.code === "NO_MEAL_CONTENT") {
    return res.status(400).json({
      error: "En az bir günlük öğün kaydı (gun + ogunler) gerekli.",
    });
  }
  if (result.code === "CLIENT_INACTIVE") {
    return res.status(403).json({ error: "Danışan hesabı uygun değil." });
  }
  if (result.code === "CLIENT_INVALID") {
    return res.status(400).json({ error: "Geçerli bir danışan seçin." });
  }
  if (result.code === "NOT_FOUND") {
    return res.status(404).json({ error: "Plan veya öğün satırı bulunamadı." });
  }
  return res.status(400).json({ error: "İşlem yapılamadı." });
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

app.get("/api/diyetisyen/clients", (req, res) => {
  const user = getUserFromAuthHeader(req);

  if (!user) {
    return res.status(401).json({ error: "Yetkisiz." });
  }

  if (user.role !== "diyetisyen") {
    return res.status(403).json({ error: "Bu işlem sadece diyetisyenler içindir." });
  }

  const clients = getClientsByDiyetisyenId(user.id);

const safeClients = clients.map((u) => ({
  id: u.id,
  fullName: u.fullName,
  yas: u.yas ?? "",
  boy: u.boy ?? "",
  kilo: u.kilo ?? "",
  hedef: u.hedef ?? "",
  sonGorusme: u.sonGorusme ?? "",
  durum: u.durum ?? "Pasif",
  alerji: u.alerji ?? "",
  hastalik: u.hastalik ?? "",
}));

return res.json({ clients: safeClients });
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

/* --- PB-08 / PB-09 / PB-10: beslenme planı (şimdilik server/data/plans.json) --- */

app.get("/api/diyetisyen/danisanlar", (req, res) => {
  const u = requireDiyetisyen(req, res);
  if (!u) return;
  return res.json({ danisanlar: listApprovedDanisanlar() });
});

app.get("/api/diyetisyen/plans", (req, res) => {
  const u = requireDiyetisyen(req, res);
  if (!u) return;
  return res.json({ plans: listPlansByDietitian(u.id) });
});

app.get("/api/diyetisyen/plans/:id", (req, res) => {
  const u = requireDiyetisyen(req, res);
  if (!u) return;
  const plan = getPlanByDietitian(u.id, req.params.id);
  if (!plan) {
    return res.status(404).json({ error: "Plan bulunamadı." });
  }
  return res.json({ plan });
});

app.post("/api/diyetisyen/plans", (req, res) => {
  try {
    const u = requireDiyetisyen(req, res);
    if (!u) return;
    const {
      clientUserId,
      planAdi,
      baslangicTarihi,
      bitisTarihi,
      ogunler,
    } = req.body ?? {};
    const result = createPlanForDietitian(u.id, {
      clientUserId: Number(clientUserId),
      planAdi,
      baslangicTarihi,
      bitisTarihi,
      ogunler,
    });
    if (!result.ok) {
      return planErrorResponse(res, result);
    }
    return res.status(201).json({ plan: result.plan });
  } catch (e) {
    console.error("[diyetisyen-plans-create]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

/** PB-10: plan başlığı / tarihler / danışan / tüm öğün listesi (ogunler) kısmi veya tam güncelleme */
app.patch("/api/diyetisyen/plans/:id", (req, res) => {
  try {
    const u = requireDiyetisyen(req, res);
    if (!u) return;
    const result = updatePlanForDietitian(u.id, req.params.id, req.body ?? {});
    if (!result.ok) {
      return planErrorResponse(res, result);
    }
    return res.json({ plan: result.plan });
  } catch (e) {
    console.error("[diyetisyen-plans-patch]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.delete("/api/diyetisyen/plans/:id", (req, res) => {
  try {
    const u = requireDiyetisyen(req, res);
    if (!u) return;
    const out = deletePlanByDietitian(u.id, req.params.id);
    if (!out.ok) {
      return res.status(404).json({ error: "Plan bulunamadı veya yetkiniz yok." });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error("[diyetisyen-plans-delete]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

/** PB-09: tek PlanOgun satırı ekle */
app.post("/api/diyetisyen/plans/:id/ogunler", (req, res) => {
  try {
    const u = requireDiyetisyen(req, res);
    if (!u) return;
    const result = addPlanOgun(u.id, req.params.id, req.body ?? {});
    if (!result.ok) {
      return planErrorResponse(res, result);
    }
    return res.status(201).json({ plan: result.plan, planOgun: result.planOgun });
  } catch (e) {
    console.error("[plan-ogun-add]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

/** PB-09: tek satır güncelle */
app.patch("/api/diyetisyen/plans/:id/ogunler/:planOgunId", (req, res) => {
  try {
    const u = requireDiyetisyen(req, res);
    if (!u) return;
    const result = updatePlanOgun(
      u.id,
      req.params.id,
      req.params.planOgunId,
      req.body ?? {}
    );
    if (!result.ok) {
      return planErrorResponse(res, result);
    }
    return res.json({ plan: result.plan, planOgun: result.planOgun });
  } catch (e) {
    console.error("[plan-ogun-patch]", e);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

/** PB-09: tek satır sil (en az bir öğün satırı kalmalı) */
app.delete("/api/diyetisyen/plans/:id/ogunler/:planOgunId", (req, res) => {
  try {
    const u = requireDiyetisyen(req, res);
    if (!u) return;
    const result = deletePlanOgun(
      u.id,
      req.params.id,
      req.params.planOgunId
    );
    if (!result.ok) {
      return planErrorResponse(res, result);
    }
    return res.json({ plan: result.plan });
  } catch (e) {
    console.error("[plan-ogun-delete]", e);
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
