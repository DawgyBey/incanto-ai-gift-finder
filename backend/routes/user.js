import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createError } from "../middleware/errorHandler.js";

const router = Router();
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "incanto-dev-secret-change-me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, "../data/users.json");

const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch (_err) {
    return [];
  }
};

const saveUsers = () => {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const users = readUsers();

const ensureUserProfileFields = (user) => {
  let changed = false;
  if (!user.preferences) {
    user.preferences = {};
    changed = true;
  }
  if (!user.personalInfo) {
    user.personalInfo = {};
    changed = true;
  }
  if (!Array.isArray(user.recentlyViewed)) {
    user.recentlyViewed = [];
    changed = true;
  }
  if (!Array.isArray(user.cart)) {
    user.cart = [];
    changed = true;
  }
  return changed;
};

if (users.some(ensureUserProfileFields)) {
  saveUsers();
}

const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  verified: user.verified,
  provider: user.provider,
  personalInfo: user.personalInfo || {},
  preferences: user.preferences || {},
  recentlyViewed: user.recentlyViewed || [],
  cart: user.cart || [],
});

const base64Url = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const signToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = base64Url(payload);
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
};

const verifyToken = (token) => {
  try {
    if (!token || !token.includes(".")) return null;
    const [body, signature] = token.split(".");
    const expected = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(body)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (_err) {
    return null;
  }
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 120000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

const passwordsMatch = (password, savedHash) => {
  const [salt] = savedHash.split(":");
  return hashPassword(password, salt) === savedHash;
};

const decodeGoogleCredential = (credential) => {
  const parts = String(credential || "").split(".");
  if (parts.length < 2) return null;
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
};

const requireAuth = (req, _res, next) => {
  const rawHeader = req.get("Authorization") || "";
  const token = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload) return next(createError("Unauthorized or expired token.", 401));

  const user = users.find((item) => item.id === payload.sub);
  if (!user) return next(createError("User not found.", 401));

  req.user = user;
  next();
};

const issueAuthResponse = (res, user, status = 200) => {
  const token = signToken(user);
  res.status(status).json({
    success: true,
    data: {
      token,
      tokenType: "Bearer",
      expiresIn: TOKEN_TTL_MS / 1000,
      user: toPublicUser(user),
    },
  });
};

router.post("/register", (req, res, next) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !email || !password) {
      return next(createError("Username, email, and password are required.", 400));
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return next(createError("Please enter a valid email address.", 400));
    }

    if (password.length < 8) {
      return next(createError("Password must be at least 8 characters.", 400));
    }

    if (users.some((user) => user.email === email)) {
      return next(createError("An account with this email already exists.", 409));
    }

    const user = {
      id: crypto.randomUUID(),
      username,
      email,
      passwordHash: hashPassword(password),
      verified: false,
      provider: "password",
      personalInfo: {},
      preferences: {},
      recentlyViewed: [],
      cart: [],
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    saveUsers();
    issueAuthResponse(res, user, 201);
  } catch (err) {
    next(err);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = users.find((item) => item.email === email);

    if (!user || !user.passwordHash || !passwordsMatch(password, user.passwordHash)) {
      return next(createError("Invalid email or password.", 401));
    }

    issueAuthResponse(res, user);
  } catch (err) {
    next(err);
  }
});

router.post("/google", (req, res, next) => {
  try {
    const payload = decodeGoogleCredential(req.body.credential);

    if (!payload?.email) {
      return next(createError("A valid Google credential token is required.", 400));
    }

    if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
      return next(createError("Google credential was not issued for this app.", 401));
    }

    const email = payload.email.toLowerCase();
    let user = users.find((item) => item.email === email);

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        username: payload.name || email.split("@")[0],
        email,
        passwordHash: null,
        verified: Boolean(payload.email_verified),
        provider: "google",
        personalInfo: {},
        preferences: {},
        recentlyViewed: [],
        cart: [],
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsers();
    } else {
      user.verified = user.verified || Boolean(payload.email_verified);
      user.provider = user.provider === "password" ? "password+google" : user.provider;
      saveUsers();
    }

    issueAuthResponse(res, user);
  } catch (_err) {
    next(createError("Could not read the Google credential token.", 400));
  }
});

router.get("/profile", requireAuth, (req, res) => {
  res.json({ success: true, data: { user: toPublicUser(req.user) } });
});

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Users API is running",
    routes: {
      register: "POST /api/v1/users/register",
      login: "POST /api/v1/users/login",
      google: "POST /api/v1/users/google",
      profile: "GET /api/v1/users/profile",
      preferences: "POST /api/v1/users/preferences",
      personalInfo: "POST /api/v1/users/personal-info",
      recentlyViewed: "POST /api/v1/users/recently-viewed",
      cart: "POST /api/v1/users/cart",
    },
  });
});

router.post("/preferences", requireAuth, (req, res) => {
  req.user.preferences = {
    recipient: req.body.recipient || "",
    budget: Number(req.body.budget) || 0,
    interests: Array.isArray(req.body.interests)
      ? req.body.interests
      : String(req.body.interests || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    personality: req.body.personality || "",
    occasion: req.body.occasion || "",
    updatedAt: new Date().toISOString(),
  };
  saveUsers();

  res.json({
    success: true,
    message: "Preferences saved.",
    data: { user: toPublicUser(req.user) },
  });
});

const savePersonalInfo = (req, res) => {
  req.user.personalInfo = {
    fullName: String(req.body.fullName || "").trim(),
    phone: String(req.body.phone || "").trim(),
    birthday: String(req.body.birthday || "").trim(),
    location: String(req.body.location || "").trim(),
    updatedAt: new Date().toISOString(),
  };
  saveUsers();

  res.json({
    success: true,
    message: "Personal information saved.",
    data: { user: toPublicUser(req.user) },
  });
};

router.post("/personal-info", requireAuth, savePersonalInfo);
router.put("/personal-info", requireAuth, savePersonalInfo);

router.post("/recently-viewed", requireAuth, (req, res) => {
  const item = req.body.gift || req.body;
  if (!item?.id || !item?.name) {
    return res.status(400).json({ success: false, message: "Gift id and name are required." });
  }

  req.user.recentlyViewed = (req.user.recentlyViewed || []).filter(
    (gift) => String(gift.id) !== String(item.id)
  );
  req.user.recentlyViewed.unshift({
    id: item.id,
    name: String(item.name || ""),
    description: String(item.description || ""),
    category: String(item.category || "Gift"),
    emoji: String(item.emoji || "Gift"),
    price: Number(item.price) || null,
    priceLabel: String(item.priceLabel || "Price unavailable"),
    reason: String(item.reason || ""),
    link: String(item.link || "#"),
    viewedAt: new Date().toISOString(),
  });
  req.user.recentlyViewed = req.user.recentlyViewed.slice(0, 6);
  saveUsers();

  res.json({ success: true, data: { user: toPublicUser(req.user) } });
});

router.post("/cart", requireAuth, (req, res) => {
  const item = req.body.gift || req.body;
  if (!item?.id || !item?.name) {
    return res.status(400).json({ success: false, message: "Gift id and name are required." });
  }

  req.user.cart = req.user.cart || [];
  const existing = req.user.cart.find((gift) => String(gift.id) === String(item.id));
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    req.user.cart.unshift({
      id: item.id,
      name: String(item.name || ""),
      description: String(item.description || ""),
      category: String(item.category || "Gift"),
      emoji: String(item.emoji || "Gift"),
      price: Number(item.price) || null,
      priceLabel: String(item.priceLabel || "Price unavailable"),
      reason: String(item.reason || ""),
      link: String(item.link || "#"),
      quantity: 1,
      addedAt: new Date().toISOString(),
    });
  }
  saveUsers();

  res.json({ success: true, data: { user: toPublicUser(req.user) } });
});

router.delete("/cart/:id", requireAuth, (req, res) => {
  req.user.cart = (req.user.cart || []).filter(
    (gift) => String(gift.id) !== String(req.params.id)
  );
  saveUsers();

  res.json({ success: true, data: { user: toPublicUser(req.user) } });
});

export default router;
