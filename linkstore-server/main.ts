// deno-lint-ignore-file
import { Application, Router, Context } from "oak";
import { oakCors } from "cors";
import { SignJWT, jwtVerify } from "jose";

const app = new Application();
const router = new Router();

const remoteUrl = Deno.env.get("HUB_DATABASE_URL");
let kv: Deno.Kv | null = null;

try {
  kv = await Deno.openKv(remoteUrl);
  console.log("✅ Deno KV Connected");
} catch (err) {
  const error = err as Error;
  console.error("❌ KV CONNECTION ERROR:", error.message);
}

const SECRET_STR = Deno.env.get("JWT_SECRET") || "fallback_secret_for_local_only";
const SECRET = new TextEncoder().encode(SECRET_STR);

app.use(oakCors({ 
  origin: ["http://localhost:5173", "https://linkstore.bolujolayemi-a11y.deno.net"],
  credentials: true,
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  optionsSuccessStatus: 200, 
}));

const authMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Authorization required" };
    return;
  }
  try {
    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, SECRET);
    ctx.state.user = payload.user; 
    await next();
  } catch {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid Session" };
  }
};

// --- AUTH ROUTES ---
router.post("/api/register", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { email, password } = body;
    if (!kv) throw new Error("Database not connected");
    await kv.set(["users", email], { password, createdAt: new Date().toISOString() });
    ctx.response.body = { success: true };
  } catch (err) {
    const error = err as Error;
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

router.post("/api/login", async (ctx) => {
  try {
    const { email, password } = await ctx.request.body.json();
    if (!kv) throw new Error("Database not connected");
    const user = await kv.get<{password: string}>(["users", email]);

    if (user.value && user.value.password === password) {
      const jwt = await new SignJWT({ user: email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(SECRET);
      ctx.response.body = { success: true, token: jwt };
    } else {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid credentials" };
    }
  } catch (err) {
    const error = err as Error;
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
});

// --- HUB DATA ROUTES ---
router.post("/api/save-store", authMiddleware, async (ctx) => {
  try {
    const userEmail = ctx.state.user; 
    const body = await ctx.request.body.json();
    if (!kv) throw new Error("DB Offline");

    const sub = await kv.get<{plan: string, status: string}>(["subscriptions", userEmail]);
    const isPro = sub.value?.plan === 'Pro' && sub.value?.status === 'Active';

    if (!isPro && body.links.length > 3) {
      ctx.response.status = 403;
      ctx.response.body = { success: false, error: "Limit reached. Upgrade to Pro." };
      return;
    }
    
    const storeData = { ...body, isPro, updatedAt: new Date().toISOString() };
    await kv.set(["user_stores", userEmail], storeData);
    await kv.set(["stores", body.username], storeData);
    
    ctx.response.body = { success: true };
  } catch (err) {
    const error = err as Error;
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

router.get("/api/get-store", authMiddleware, async (ctx) => {
  try {
    const userEmail = ctx.state.user;
    if (!kv) throw new Error("DB Offline");
    
    // Safely get store and subscription
    const [storeRes, subRes] = await Promise.all([
      kv.get<Record<string, unknown>>(["user_stores", userEmail]),
      kv.get<{plan: string}>(["subscriptions", userEmail])
    ]);
    
    // If store doesn't exist yet, return a clean empty state instead of crashing
    const storeData = storeRes.value || { username: "", bio: "", links: [] };
    const isPro = subRes.value?.plan === 'Pro';

    ctx.response.body = { 
      success: true, 
      store: { ...storeData, isPro } 
    };
  } catch (err) {
    const error = err as Error;
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

router.post("/api/update-subscription", authMiddleware, async (ctx) => {
  try {
    const userEmail = ctx.state.user;
    const { plan, status } = await ctx.request.body.json();
    if (!kv) throw new Error("DB Offline");
    await kv.set(["subscriptions", userEmail], { plan, status, updatedAt: new Date().toISOString() });
    ctx.response.body = { success: true };
  } catch (err) {
    const error = err as Error;
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`🟢 LinkStore Hub Online`);
await app.listen({ port: 8000 });