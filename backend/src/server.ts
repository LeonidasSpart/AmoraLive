import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "./prisma.js";

const app = express();

const PORT = Number(process.env.PORT) || 8080;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_DAYS = 30;

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

type AuthRequest = Request & {
  userId?: string;
};

function createAccessToken(userId: string) {
  return jwt.sign(
    {
      sub: userId,
      type: "access",
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function getUserResponse(user: {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  isVip: boolean;
  coins: number;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    isVerified: user.isVerified,
    isVip: user.isVip,
    coins: user.coins,
  };
}

async function createSession(userId: string) {
  const refreshToken = createRefreshToken();

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return {
    accessToken: createAccessToken(userId),
    refreshToken,
  };
}

async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = header.substring("Bearer ".length);

    const payload = jwt.verify(token, JWT_SECRET) as {
      sub?: string;
      type?: string;
    };

    if (!payload.sub || payload.type !== "access") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Account is inactive or unavailable",
      });
    }

    req.userId = user.id;

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}

app.get("/", (_req, res) => {
  res.json({
    name: "AMORA Live API",
    status: "online",
    version: "1.0.0",
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      service: "amora-live-backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(500).json({
      status: "error",
      service: "amora-live-backend",
      database: "disconnected",
    });
  }
});

app.get("/api", (_req, res) => {
  res.json({
    message: "Welcome to the AMORA Live API",
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      username: z.string().min(3).max(30),
      password: z.string().min(6).max(100),
      displayName: z.string().min(1).max(100),
      avatar: z.string().nullable().optional(),
      bio: z.string().max(500).nullable().optional(),
      dateOfBirth: z.string().nullable().optional(),
      gender: z.string().nullable().optional(),
      goal: z.string().nullable().optional(),
    });

    const data = schema.parse(req.body);

    const email = data.email.trim().toLowerCase();
    const username = data.username.trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName: data.displayName.trim(),
        avatar: data.avatar || null,
        bio: data.bio || null,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : null,
        gender: data.gender as any,
        goal: data.goal as any,
      },
    });

    const tokens = await createSession(user.id);

    return res.status(201).json({
      message: "Account created successfully",
      ...tokens,
      user: getUserResponse(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid registration data",
        errors: error.issues,
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Unable to create account",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const schema = z.object({
      account: z.string().min(1),
      password: z.string().min(1),
    });

    const data = schema.parse(req.body);
    const account = data.account.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: account.toLowerCase() },
          { username: account },
        ],
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastActiveAt: new Date(),
      },
    });

    const tokens = await createSession(user.id);

    return res.json({
      message: "Login successful",
      ...tokens,
      user: getUserResponse(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid login data",
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login",
    });
  }
});

app.get(
  "/api/auth/me",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          isVerified: true,
          isVip: true,
          coins: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Me error:", error);

      return res.status(500).json({
        message: "Unable to load user",
      });
    }
  }
);

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const schema = z.object({
      refreshToken: z.string().min(1),
    });

    const data = schema.parse(req.body);

    const session = await prisma.session.findUnique({
      where: {
        refreshTokenHash: hashToken(data.refreshToken),
      },
      include: {
        user: true,
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.isActive
    ) {
      return res.status(401).json({
        message: "Refresh token is invalid or expired",
      });
    }

    const newRefreshToken = createRefreshToken();

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(
          Date.now() +
            REFRESH_TOKEN_DAYS *
              24 *
              60 *
              60 *
              1000
        ),
      },
    });

    return res.json({
      accessToken: createAccessToken(session.userId),
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).json({
      message: "Unable to refresh session",
    });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const schema = z.object({
      refreshToken: z.string().min(1),
    });

    const data = schema.parse(req.body);

    await prisma.session.updateMany({
      where: {
        refreshTokenHash: hashToken(data.refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return res.json({
      message: "Logged out successfully",
    });
  } catch {
    return res.status(400).json({
      message: "Unable to logout",
    });
  }
});

app.get(
  "/api/users/:id",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.params.id,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          isVerified: true,
          isVip: true,
          coins: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);

      return res.status(500).json({
        message: "Unable to fetch user",
      });
    }
  }
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AMORA Live API running on port ${PORT}`);
});
