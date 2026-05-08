// deno-lint-ignore-file
import { Application, Router, Context } from "oak";
import { oakCors } from "cors";
import { SignJWT, jwtVerify } from "jose"; 

interface UserAccount {
  password: string;
  createdAt: string;
}

interface StoreData {
  username: string;
  bio: string;
  links: Array<{ platformName: string; url: string; source: string }>;
  updatedAt: string;
}

const app = new Application();
const router = new Router();
const kv = await Deno.openKv();

// Use a static secret for development so the server remembers keys after restart
const SECRET = new TextEncoder().encode("linkstore_ultra_secret_key_12345");

app.use(oakCors({ origin: "http://localhost:5173" }));

// --- HELPER: Auth Middleware ---
const authMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader) {
    ctx.response.status = 401;
    return;
  }
  try {
    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, SECRET);
    ctx.state.user = payload.user; // Inject the user email into the context
    await next();
  } catch (_e) {
    ctx.response.status = 401;
  }
};

// --- AUTH ROUTES ---

router.post("/api/register", async (ctx) => {
  const { email, password } = await ctx.request.body.json();
  const newUser: UserAccount = { password, createdAt: new Date().toISOString() };
  await kv.set(["users", email], newUser);
  ctx.response.body = { success: true };
});

router.post("/api/login", async (ctx) => {
  const { email, password } = await ctx.request.body.json();
  const user = await kv.get<UserAccount>(["users", email]);

  if (user.value && user.value.password === password) {
    const jwt = await new SignJWT({ user: email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(SECRET);
    ctx.response.body = { success: true, token: jwt };
  } else {
    ctx.response.status = 401;
  }
});

// --- STORE ROUTES ---

// 1. SAVE: Links the store to the logged-in user's email
router.post("/api/save-store", authMiddleware, async (ctx) => {
  const userEmail = ctx.state.user; 
  const body = await ctx.request.body.json();

  const newStore: StoreData = {
    ...body,
    updatedAt: new Date().toISOString()
  };

  // We save it under the user's email so we can find it easily later
  await kv.set(["user_stores", userEmail], newStore);
  
  // Also save it by username if you want a public link like /api/store/bolu
  await kv.set(["stores", body.username], newStore);

  ctx.response.body = { success: true, message: "Store synced!" };
});

// 2. GET: Fetches the store for the Dashboard
router.get("/api/get-store", authMiddleware, async (ctx) => {
  const userEmail = ctx.state.user;
  const store = await kv.get<StoreData>(["user_stores", userEmail]);

  if (!store.value) {
    ctx.response.body = { success: false, error: "No store found" };
  } else {
    ctx.response.body = { success: true, store: store.value };
  }
});

// 3. MOCK ORDERS: Added this so the Dashboard isn't empty
router.get("/api/orders", authMiddleware, async (ctx) => {
  ctx.response.body = {
    success: true,
    orders: [
      { id: '1', customerName: 'Tunde Dev', productName: 'Premium Lace', amount: '₦25,000', source: 'TikTok', status: 'Paid', timestamp: '5m ago' },
      { id: '2', customerName: 'Amaka W.', productName: 'Voile Fabric', amount: '₦12,000', source: 'Instagram', status: 'Pending', timestamp: '1h ago' }
    ]
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("🟢 Deno Hub Active: http://localhost:8000");
await app.listen({ port: 8000 });