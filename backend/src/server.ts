import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";

const app = express();

const PORT = Number(process.env.PORT) || 8080;

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/**
 * Root
 */
app.get("/", (_req, res) => {
  res.json({
    name: "AMORA Live API",
    status: "online",
    version: "1.0.0",
  });
});

/**
 * Health check
 */
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
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      service: "amora-live-backend",
      database: "disconnected",
    });
  }
});

/**
 * API welcome
 */
app.get("/api", (_req, res) => {
  res.json({
    message: "Welcome to the AMORA Live API",
  });
});

/**
 * REGISTER
 */
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      displayName,
      avatar,
      bio,
      dateOfBirth,
      gender,
      goal,
    } = req.body;

    if (!email || !username || !password || !displayName) {
      return res.status(400).json({
        message: "Email, username, password and display name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { username: username.trim() },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        passwordHash,
        displayName: displayName.trim(),
        avatar: avatar || null,
        bio: bio || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        goal: goal || null,
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
        isVip: user.isVip,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Unable to create account",
    });
  }
});

/**
 * LOGIN
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      return res.status(400).json({
        message: "Account and password are required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: account.toLowerCase().trim() },
          { username: account.trim() },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
        isVip: user.isVip,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login",
    });
  }
});

/**
 * GET USER
 */
app.get("/api/users/:id", async (req, res) => {
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
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AMORA Live API running on port ${PORT}`);
});
