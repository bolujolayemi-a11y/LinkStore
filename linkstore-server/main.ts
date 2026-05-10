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
} catch (err) {
  console.error("❌ KV Error:", (err as Error).message);
}

const SECRET_STR = Deno.env.get("JWT_SECRET") || "fallback_secret";
const SECRET = new TextEncoder().encode(SECRET_STR);

// 🌍 PERMISSIVE CORS FOR VERCEL
app.use(oakCors({ 
  origin: true, 
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
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

// --- ROUTES ---
router.post("/api/register", async (ctx) => {
  try {
    const { email, password } = await ctx.request.body.json();
    if (!kv) throw new Error("DB Offline");
    await kv.set(["users", email], { password, createdAt: new Date().toISOString() });
    ctx.response.body = { success: true };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

router.post("/api/login", async (ctx) => {
  try {
    const { email, password } = await ctx.request.body.json();
    if (!kv) throw new Error("DB Offline");
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
    ctx.response.status = 400;
    ctx.response.body = { error: (err as Error).message };
  }
});

router.get("/api/get-store", authMiddleware, async (ctx) => {
  try {
    const userEmail = ctx.state.user;
    if (!kv) throw new Error("DB Offline");
    const [storeRes, subRes] = await Promise.all([
      kv.get<any>(["user_stores", userEmail]),
      kv.get<any>(["subscriptions", userEmail])
    ]);
    ctx.response.body = { 
      success: true, 
      store: { ...(storeRes.value || { links: [] }), isPro: subRes.value?.plan === 'Pro' } 
    };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

router.post("/api/save-store", authMiddleware, async (ctx) => {
    try {
      const userEmail = ctx.state.user;
      const body = await ctx.request.body.json();
      if (!kv) throw new Error("DB Offline");
      await kv.set(["user_stores", userEmail], body);
      ctx.response.body = { success: true };
    } catch (err) {
      ctx.response.status = 500;
      ctx.response.body = { error: (err as Error).message };
    }
});

router.post("/api/update-subscription", authMiddleware, async (ctx) => {
  try {
    const userEmail = ctx.state.user;
    const body = await ctx.request.body.json();
    if (!kv) throw new Error("DB Offline");
    await kv.set(["subscriptions", userEmail], { ...body, updatedAt: new Date().toISOString() });
    ctx.response.body = { success: true };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

router.get("/api/orders", authMiddleware, async (ctx) => {
  try {
    const userEmail = ctx.state.user;
    if (!kv) throw new Error("DB Offline");
    const iter = kv.list({ prefix: ["orders", userEmail] });
    const orders = [];
    for await (const res of iter) orders.push(res.value);
    ctx.response.body = { success: true, orders };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });