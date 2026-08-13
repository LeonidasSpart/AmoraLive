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

import {
  Gender,
  MatchStatus,
  MessageType,
  RelationshipGoal,
  SubscriptionStatus,
} from "./generated/prisma/client.js";

import { prisma } from "./prisma.js";

const app = express();

const PORT = Number(process.env.PORT) || 8080;

const jwtSecretFromEnv = process.env.JWT_SECRET;

if (!jwtSecretFromEnv) {
  throw new Error("JWT_SECRET is not configured");
}

const JWT_SECRET: string = jwtSecretFromEnv;

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_DAYS = 30;

/* =========================================================
   EXPRESS TYPES
========================================================= */

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

/* =========================================================
   APP CONFIG
========================================================= */

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

/* =========================================================
   HELPERS
========================================================= */

function getRouteParam(
  req: Request,
  name: string
): string {
  const value = req.params[name];

  if (typeof value !== "string") {
    throw new Error(`Invalid route parameter: ${name}`);
  }

  return value;
}

function createAccessToken(userId: string): string {
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

function createRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

function hashToken(token: string): string {
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
      REFRESH_TOKEN_DAYS *
        24 *
        60 *
        60 *
        1000
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

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication required",
      });

      return;
    }

    const token = header.substring("Bearer ".length);

    const payload = jwt.verify(
      token,
      JWT_SECRET
    ) as {
      sub?: string;
      type?: string;
    };

    if (
      !payload.sub ||
      payload.type !== "access"
    ) {
      res.status(401).json({
        message: "Invalid authentication token",
      });

      return;
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
      res.status(401).json({
        message:
          "Account is inactive or unavailable",
      });

      return;
    }

    req.userId = user.id;

    next();
  } catch {
    res.status(401).json({
      message:
        "Invalid or expired authentication token",
    });
  }
}

/* =========================================================
   SYSTEM
========================================================= */

app.get("/", (_req, res) => {
  res.json({
    name: "AMORA Live API",
    status: "online",
    version: "1.0.0",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "Welcome to the AMORA Live API",
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
    console.error(
      "Health check failed:",
      error
    );

    res.status(500).json({
      status: "error",
      service: "amora-live-backend",
      database: "disconnected",
    });
  }
});

/* =========================================================
   AUTH
========================================================= */

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        username: z
          .string()
          .min(3)
          .max(30),
        password: z
          .string()
          .min(6)
          .max(100),
        displayName: z
          .string()
          .min(1)
          .max(100),
        avatar: z
          .string()
          .nullable()
          .optional(),
        bio: z
          .string()
          .max(500)
          .nullable()
          .optional(),
        dateOfBirth: z
          .string()
          .nullable()
          .optional(),
        gender: z
          .nativeEnum(Gender)
          .nullable()
          .optional(),
        goal: z
          .nativeEnum(RelationshipGoal)
          .nullable()
          .optional(),
      });

      const data = schema.parse(req.body);

      const email = data.email
        .trim()
        .toLowerCase();

      const username = data.username.trim();

      const existingUser =
        await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { username },
            ],
          },
        });

      if (existingUser) {
        res.status(409).json({
          message:
            "Email or username already exists",
        });

        return;
      }

      const passwordHash =
        await bcrypt.hash(
          data.password,
          12
        );

      const user =
        await prisma.user.create({
          data: {
            email,
            username,
            passwordHash,
            displayName:
              data.displayName.trim(),
            avatar: data.avatar ?? null,
            bio: data.bio ?? null,
            dateOfBirth:
              data.dateOfBirth
                ? new Date(
                    data.dateOfBirth
                  )
                : null,
            gender:
              data.gender ?? null,
            goal:
              data.goal ?? null,
          },
        });

      const tokens =
        await createSession(user.id);

      res.status(201).json({
        message:
          "Account created successfully",
        ...tokens,
        user: getUserResponse(user),
      });
    } catch (error) {
      if (
        error instanceof z.ZodError
      ) {
        res.status(400).json({
          message:
            "Invalid registration data",
          errors: error.issues,
        });

        return;
      }

      console.error(
        "Registration error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create account",
      });
    }
  }
);

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const schema = z.object({
        account:
          z.string().min(1),
        password:
          z.string().min(1),
      });

      const data =
        schema.parse(req.body);

      const account =
        data.account.trim();

      const user =
        await prisma.user.findFirst({
          where: {
            OR: [
              {
                email:
                  account
                    .toLowerCase(),
              },
              {
                username: account,
              },
            ],
          },
        });

      if (
        !user ||
        !user.isActive
      ) {
        res.status(401).json({
          message:
            "Invalid credentials",
        });

        return;
      }

      const validPassword =
        await bcrypt.compare(
          data.password,
          user.passwordHash
        );

      if (!validPassword) {
        res.status(401).json({
          message:
            "Invalid credentials",
        });

        return;
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastActiveAt:
            new Date(),
        },
      });

      const tokens =
        await createSession(user.id);

      res.json({
        message:
          "Login successful",
        ...tokens,
        user: getUserResponse(user),
      });
    } catch (error) {
      if (
        error instanceof z.ZodError
      ) {
        res.status(400).json({
          message:
            "Invalid login data",
        });

        return;
      }

      console.error(
        "Login error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to login",
      });
    }
  }
);

app.get(
  "/api/auth/me",
  authenticate,
  async (req, res) => {
    try {
      const user =
        await prisma.user.findUnique({
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
        res.status(404).json({
          message:
            "User not found",
        });

        return;
      }

      res.json({
        user,
      });
    } catch (error) {
      console.error(
        "Me error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load user",
      });
    }
  }
);

app.post(
  "/api/auth/refresh",
  async (req, res) => {
    try {
      const schema = z.object({
        refreshToken:
          z.string().min(1),
      });

      const data =
        schema.parse(req.body);

      const session =
        await prisma.session.findUnique(
          {
            where: {
              refreshTokenHash:
                hashToken(
                  data.refreshToken
                ),
            },
            include: {
              user: true,
            },
          }
        );

      if (
        !session ||
        session.revokedAt ||
        session.expiresAt <=
          new Date() ||
        !session.user.isActive
      ) {
        res.status(401).json({
          message:
            "Refresh token is invalid or expired",
        });

        return;
      }

      const newRefreshToken =
        createRefreshToken();

      await prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          refreshTokenHash:
            hashToken(
              newRefreshToken
            ),
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

      res.json({
        accessToken:
          createAccessToken(
            session.userId
          ),
        refreshToken:
          newRefreshToken,
      });
    } catch (error) {
      console.error(
        "Refresh error:",
        error
      );

      res.status(401).json({
        message:
          "Unable to refresh session",
      });
    }
  }
);

app.post(
  "/api/auth/logout",
  async (req, res) => {
    try {
      const schema = z.object({
        refreshToken:
          z.string().min(1),
      });

      const data =
        schema.parse(req.body);

      await prisma.session.updateMany(
        {
          where: {
            refreshTokenHash:
              hashToken(
                data.refreshToken
              ),
            revokedAt: null,
          },
          data: {
            revokedAt:
              new Date(),
          },
        }
      );

      res.json({
        message:
          "Logged out successfully",
      });
    } catch {
      res.status(400).json({
        message:
          "Unable to logout",
      });
    }
  }
);

/* =========================================================
   USERS
========================================================= */

app.get(
  "/api/users/:id",
  authenticate,
  async (req, res) => {
    try {
      const id = getRouteParam(
        req,
        "id"
      );

      const user =
        await prisma.user.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            gender: true,
            goal: true,
            isVerified: true,
            isVip: true,
            createdAt: true,
          },
        });

      if (!user) {
        res.status(404).json({
          message:
            "User not found",
        });

        return;
      }

      res.json({
        user,
      });
    } catch (error) {
      console.error(
        "Get user error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch user",
      });
    }
  }
);

app.patch(
  "/api/users/me",
  authenticate,
  async (req, res) => {
    try {
      const schema = z.object({
        displayName:
          z.string()
            .min(1)
            .max(100)
            .optional(),

        bio:
          z.string()
            .max(500)
            .nullable()
            .optional(),

        avatar:
          z.string()
            .nullable()
            .optional(),

        gender:
          z.nativeEnum(Gender)
            .nullable()
            .optional(),

        goal:
          z.nativeEnum(
            RelationshipGoal
          )
            .nullable()
            .optional(),

        dateOfBirth:
          z.string()
            .nullable()
            .optional(),
      });

      const data =
        schema.parse(req.body);

      const user =
        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            ...(data.displayName !==
              undefined && {
              displayName:
                data.displayName.trim(),
            }),

            ...(data.bio !==
              undefined && {
              bio: data.bio,
            }),

            ...(data.avatar !==
              undefined && {
              avatar: data.avatar,
            }),

            ...(data.gender !==
              undefined && {
              gender: data.gender,
            }),

            ...(data.goal !==
              undefined && {
              goal: data.goal,
            }),

            ...(data.dateOfBirth !==
              undefined && {
              dateOfBirth:
                data.dateOfBirth
                  ? new Date(
                      data.dateOfBirth
                    )
                  : null,
            }),
          },
        });

      res.json({
        message:
          "Profile updated",
        user:
          getUserResponse(user),
      });
    } catch (error) {
      if (
        error instanceof z.ZodError
      ) {
        res.status(400).json({
          message:
            "Invalid profile data",
          errors: error.issues,
        });

        return;
      }

      console.error(
        "Update profile error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update profile",
      });
    }
  }
);

/* =========================================================
   PHOTOS
========================================================= */

app.get(
  "/api/users/me/photos",
  authenticate,
  async (req, res) => {
    try {
      const photos =
        await prisma.photo.findMany({
          where: {
            userId: req.userId,
          },
          orderBy: {
            position: "asc",
          },
        });

      res.json({
        photos,
      });
    } catch (error) {
      console.error(
        "Get photos error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load photos",
      });
    }
  }
);

app.post(
  "/api/users/me/photos",
  authenticate,
  async (req, res) => {
    try {
      const schema = z.object({
        url: z.string().url(),
        isPrimary:
          z.boolean().optional(),
      });

      const data =
        schema.parse(req.body);

      const count =
        await prisma.photo.count({
          where: {
            userId: req.userId,
          },
        });

      const photo =
        await prisma.photo.create({
          data: {
            userId: req.userId,
            url: data.url,
            isPrimary:
              data.isPrimary ??
              count === 0,
            position: count,
          },
        });

      res.status(201).json({
        photo,
      });
    } catch (error) {
      if (
        error instanceof z.ZodError
      ) {
        res.status(400).json({
          message:
            "Invalid photo data",
          errors: error.issues,
        });

        return;
      }

      console.error(
        "Photo error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to add photo",
      });
    }
  }
);

app.delete(
  "/api/users/me/photos/:id",
  authenticate,
  async (req, res) => {
    try {
      const id = getRouteParam(
        req,
        "id"
      );

      const photo =
        await prisma.photo.findFirst({
          where: {
            id,
            userId: req.userId,
          },
        });

      if (!photo) {
        res.status(404).json({
          message:
            "Photo not found",
        });

        return;
      }

      await prisma.photo.delete({
        where: {
          id: photo.id,
        },
      });

      res.json({
        message:
          "Photo deleted",
      });
    } catch (error) {
      console.error(
        "Delete photo error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete photo",
      });
    }
  }
);

/* =========================================================
   PREFERENCES
========================================================= */

app.get(
  "/api/preferences",
  authenticate,
  async (req, res) => {
    try {
      const preferences =
        await prisma.preference.findUnique(
          {
            where: {
              userId: req.userId,
            },
          }
        );

      res.json({
        preferences,
      });
    } catch (error) {
      console.error(
        "Preferences error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load preferences",
      });
    }
  }
);

app.put(
  "/api/preferences",
  authenticate,
  async (req, res) => {
    try {
      const schema = z.object({
        minAge:
          z.number()
            .int()
            .min(18)
            .max(100)
            .nullable()
            .optional(),

        maxAge:
          z.number()
            .int()
            .min(18)
            .max(100)
            .nullable()
            .optional(),

        preferredGender:
          z.nativeEnum(Gender)
            .nullable()
            .optional(),

        maxDistanceKm:
          z.number()
            .int()
            .min(1)
            .max(10000)
            .nullable()
            .optional(),

        relationshipGoal:
          z.nativeEnum(
            RelationshipGoal
          )
            .nullable()
            .optional(),
      });

      const data =
        schema.parse(req.body);

      const preferences =
        await prisma.preference.upsert(
          {
            where: {
              userId: req.userId,
            },
            create: {
              userId: req.userId,
              ...data,
            },
            update: {
              ...data,
            },
          }
        );

      res.json({
        preferences,
      });
    } catch (error) {
      if (
        error instanceof z.ZodError
      ) {
        res.status(400).json({
          message:
            "Invalid preference data",
          errors: error.issues,
        });

        return;
      }

      console.error(
        "Preferences error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update preferences",
      });
    }
  }
);

/* =========================================================
   LIKES
========================================================= */

app.post(
  "/api/likes/:userId",
  authenticate,
  async (req, res) => {
    try {
      const userId =
        getRouteParam(
          req,
          "userId"
        );

      if (req.userId === userId) {
        res.status(400).json({
          message:
            "You cannot like yourself",
        });

        return;
      }

      const target =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            isActive: true,
          },
        });

      if (
        !target ||
        !target.isActive
      ) {
        res.status(404).json({
          message:
            "User not found",
        });

        return;
      }

      const blocked =
        await prisma.block.findFirst({
          where: {
            OR: [
              {
                blockerId:
                  req.userId,
                blockedId:
                  userId,
              },
              {
                blockerId:
                  userId,
                blockedId:
                  req.userId,
              },
            ],
          },
        });

      if (blocked) {
        res.status(403).json({
          message:
            "Interaction unavailable",
        });

        return;
      }

      const like =
        await prisma.like.upsert({
          where: {
            senderId_receiverId: {
              senderId:
                req.userId,
              receiverId:
                userId,
            },
          },
          create: {
            senderId:
              req.userId,
            receiverId:
              userId,
          },
          update: {},
        });

      const reciprocal =
        await prisma.like.findUnique(
          {
            where: {
              senderId_receiverId: {
                senderId:
                  userId,
                receiverId:
                  req.userId,
              },
            },
          }
        );

      let match = null;

      if (reciprocal) {
        const existingMatch =
          await prisma.match.findFirst(
            {
              where: {
                OR: [
                  {
                    userAId:
                      req.userId,
                    userBId:
                      userId,
                  },
                  {
                    userAId:
                      userId,
                    userBId:
                      req.userId,
                  },
                ],
              },
            }
          );

        match =
          existingMatch ??
          (await prisma.match.create({
            data: {
              userAId:
                req.userId,
              userBId:
                userId,
            },
          }));
      }

      res.status(201).json({
        like,
        matched:
          Boolean(match),
        match,
      });
    } catch (error) {
      console.error(
        "Like error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to like user",
      });
    }
  }
);

app.delete(
  "/api/likes/:userId",
  authenticate,
  async (req, res) => {
    try {
      const userId =
        getRouteParam(
          req,
          "userId"
        );

      await prisma.like.deleteMany({
        where: {
          senderId:
            req.userId,
          receiverId:
            userId,
        },
      });

      res.json({
        message:
          "Like removed",
      });
    } catch (error) {
      console.error(
        "Remove like error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to remove like",
      });
    }
  }
);

/* =========================================================
   MATCHES
========================================================= */

app.get(
  "/api/matches",
  authenticate,
  async (req, res) => {
    try {
      const matches =
        await prisma.match.findMany({
          where: {
            status:
              MatchStatus.ACTIVE,
            OR: [
              {
                userAId:
                  req.userId,
              },
              {
                userBId:
                  req.userId,
              },
            ],
          },
          include: {
            userA: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                isVerified: true,
                isVip: true,
              },
            },
            userB: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                isVerified: true,
                isVip: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        });

      res.json({
        matches,
      });
    } catch (error) {
      console.error(
        "Matches error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load matches",
      });
    }
  }
);

app.delete(
  "/api/matches/:id",
  authenticate,
  async (req, res) => {
    try {
      const id = getRouteParam(
        req,
        "id"
      );

      const match =
        await prisma.match.findFirst({
          where: {
            id,
            OR: [
              {
                userAId:
                  req.userId,
              },
              {
                userBId:
                  req.userId,
              },
            ],
          },
        });

      if (!match) {
        res.status(404).json({
          message:
            "Match not found",
        });

        return;
      }

      await prisma.match.update({
        where: {
          id: match.id,
        },
        data: {
          status:
            MatchStatus.UNMATCHED,
        },
      });

      res.json({
        message:
          "Match removed",
      });
    } catch (error) {
      console.error(
        "Remove match error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to remove match",
      });
    }
  }
);

/* =========================================================
   MESSAGES
========================================================= */

app.get(
  "/api/matches/:matchId/messages",
  authenticate,
  async (req, res) => {
    try {
      const matchId =
        getRouteParam(
          req,
          "matchId"
        );

      const match =
        await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [
              {
                userAId:
                  req.userId,
              },
              {
                userBId:
                  req.userId,
              },
            ],
          },
        });

      if (!match) {
        res.status(404).json({
          message:
            "Match not found",
        });

        return;
      }

      const messages =
        await prisma.message.findMany(
          {
            where: {
              matchId:
                match.id,
            },
            orderBy: {
              createdAt: "asc",
            },
          }
        );

      res.json({
        messages,
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load messages",
      });
    }
  }
);

app.post(
  "/api/matches/:matchId/messages",
  authenticate,
  async (req, res) => {
    try {
      const matchId =
        getRouteParam(
          req,
          "matchId"
        );

      const schema = z.object({
        content:
          z.string()
            .min(1)
            .max(5000),

        type:
          z.nativeEnum(
            MessageType
          ).optional(),
      });

      const data =
        schema.parse(req.body);

      const match =
        await prisma.match.findFirst({
          where: {
            id: matchId,
            status:
              MatchStatus.ACTIVE,
            OR: [
              {
                userAId:
                  req.userId,
              },
              {
                userBId:
                  req.userId,
              },
            ],
          },
        });

      if (!match) {
        res.status(404).json({
          message:
            "Match not found",
        });

        return;
      }

      const receiverId =
        match.userAId ===
        req.userId
          ? match.userBId
          : match.userAId;

      const message =
        await prisma.message.create({
          data: {
            matchId:
              match.id,
            senderId:
              req.userId,
            receiverId,
            type:
              data.type ??
              MessageType.TEXT,
            content:
              data.content.trim(),
          },
        });

      res.status(201).json({
        message,
      });
    } catch (error) {
      if (
        error instanceof z.ZodError
      ) {
        res.status(400).json({
          message:
            "Invalid message",
          errors: error.issues,
        });

        return;
      }

      console.error(
        "Send message error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to send message",
      });
    }
  }
);

app.patch(
  "/api/messages/:id/read",
  authenticate,
  async (req, res) => {
    try {
      const id = getRouteParam(
        req,
        "id"
      );

      const message =
        await prisma.message.findFirst({
          where: {
            id,
            receiverId:
              req.userId,
          },
        });

      if (!message) {
        res.status(404).json({
          message:
            "Message not found",
        });

        return;
      }

      const updated =
        await prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            readAt:
              new Date(),
          },
        });

      res.json({
        message: updated,
      });
    } catch (error) {
      console.error(
        "Read message error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to mark message as read",
      });
    }
  }
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

app.get(
  "/api/notifications",
  authenticate,
  async (req, res) => {
    try {
      const notifications =
        await prisma.notification.findMany(
          {
            where: {
              userId:
                req.userId,
            },
            orderBy: {
              createdAt:
                "desc",
            },
            take: 100,
          }
        );

      res.json({
        notifications,
      });
    } catch (error) {
      console.error(
        "Notifications error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load notifications",
      });
    }
  }
);

app.get(
  "/api/notifications/unread-count",
  authenticate,
  async (req, res) => {
    try {
      const count =
        await prisma.notification.count(
          {
            where: {
              userId:
                req.userId,
              readAt: null,
            },
          }
        );

      res.json({
        count,
      });
    } catch (error) {
      console.error(
        "Unread count error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load unread count",
      });
    }
  }
);

app.patch(
  "/api/notifications/:id/read",
  authenticate,
  async (req, res) => {
    try {
      const id = getRouteParam(
        req,
        "id"
      );

      const notification =
        await prisma.notification.updateMany(
          {
            where: {
              id,
              userId:
                req.userId,
              readAt: null,
            },
            data: {
              readAt:
                new Date(),
            },
          }
        );

      if (
        notification.count === 0
      ) {
        res.status(404).json({
          message:
            "Notification not found",
        });

        return;
      }

      res.json({
        message:
          "Notification marked as read",
      });
    } catch (error) {
      console.error(
        "Read notification error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to mark notification as read",
      });
    }
  }
);

app.patch(
  "/api/notifications/read-all",
  authenticate,
  async (req, res) => {
    try {
      await prisma.notification.updateMany(
        {
          where: {
            userId:
              req.userId,
            readAt: null,
          },
          data: {
            readAt:
              new Date(),
          },
        }
      );

      res.json({
        message:
          "Notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Read all notifications error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to mark notifications as read",
      });
    }
  }
);

/* =========================================================
   BLOCKS
========================================================= */

app.post(
  "/api/blocks/:userId",
  authenticate,
  async (req, res) => {
    try {
      const userId =
        getRouteParam(
          req,
          "userId"
        );

      if (req.userId === userId) {
        res.status(400).json({
          message:
            "You cannot block yourself",
        });

        return;
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        });

      if (!user) {
        res.status(404).json({
          message:
            "User not found",
        });

        return;
      }

      const block =
        await prisma.block.upsert({
          where: {
            blockerId_blockedId: {
              blockerId:
                req.userId,
              blockedId:
                userId,
            },
          },
          create: {
            blockerId:
              req.userId,
            blockedId:
              userId,
          },
          update: {},
        });

      await prisma.like.deleteMany({
        where: {
          OR: [
            {
              senderId:
                req.userId,
              receiverId:
                userId,
            },
            {
              senderId:
                userId,
              receiverId:
                req.userId,
            },
          ],
        },
      });

      res.status(201).json({
        block,
      });
    } catch (error) {
      console.error(
        "Block error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to block user",
      });
    }
  }
);

app.delete(
  "/api/blocks/:userId",
  authenticate,
  async (req, res) => {
    try {
      const userId =
        getRouteParam(
          req,
          "userId"
        );

      await prisma.block.deleteMany({
        where: {
          blockerId:
            req.userId,
          blockedId:
            userId,
        },
      });

      res.json({
        message:
          "User unblocked",
      });
    } catch (error) {
      console.error(
        "Unblock error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to unblock user",
      });
    }
  }
);

app.get(
  "/api/blocks",
  authenticate,
  async (req, res) => {
    try {
      const blocks =
        await prisma.block.findMany({
          where: {
            blockerId:
              req.userId,
          },
          include: {
            blocked: {
              select: {
                id: true,
                username: true,
                displayName:
                  true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt:
              "desc",
          },
        });

      res.json({
        blocks,
      });
    } catch (error) {
      console.error(
        "Get blocks error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load blocks",
      });
    }
  }
);

/* =========================================================
   REPORTS
========================================================= */

app.post(
  "/api/reports/:userId",
  authenticate,
  async (req, res) => {
    try {
      const userId =
        getRouteParam(
          req,
          "userId"
        );

      if (req.userId === userId) {
        res.status(400).json({
          message:
            "You cannot report yourself",
        });

        return;
      }

      const schema = z.object({
        reason:
          z.string()
            .min(1)
            .max(100),

        details:
          z.string()
            .max(1000)
            .nullable()
            .optional(),
      });

      const data =
        schema.parse(req.body);

      const user =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        });

      if (!user) {
        res.status(404).json({
          message:
            "User not found",
        });

        return;
      }

      const report =
        await prisma.report.create({
          data: {
            reporterId:
              req.userId,
            reportedId:
              userId,
            reason:
              data.reason,
            details:
              data.details ?? null,
          },
        });

      res.status(201).json({
        message:
          "Report submitted",
        report,
      });
    } catch (error) {
      if (
        error instanceof z.ZodError
      ) {
        res.status(400).json({
          message:
            "Invalid report",
          errors: error.issues,
        });

        return;
      }

      console.error(
        "Report error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to submit report",
      });
    }
  }
);

/* =========================================================
   SUBSCRIPTIONS
========================================================= */

app.get(
  "/api/subscriptions",
  authenticate,
  async (req, res) => {
    try {
      const subscriptions =
        await prisma.subscription.findMany(
          {
            where: {
              userId:
                req.userId,
            },
            orderBy: {
              startedAt:
                "desc",
            },
          }
        );

      res.json({
        subscriptions,
      });
    } catch (error) {
      console.error(
        "Subscriptions error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load subscriptions",
      });
    }
  }
);

app.get(
  "/api/subscriptions/active",
  authenticate,
  async (req, res) => {
    try {
      const subscription =
        await prisma.subscription.findFirst(
          {
            where: {
              userId:
                req.userId,
              status:
                SubscriptionStatus.ACTIVE,
              OR: [
                {
                  expiresAt:
                    null,
                },
                {
                  expiresAt: {
                    gt: new Date(),
                  },
                },
              ],
            },
            orderBy: {
              startedAt:
                "desc",
            },
          }
        );

      res.json({
        subscription,
      });
    } catch (error) {
      console.error(
        "Active subscription error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load active subscription",
      });
    }
  }
);

/* =========================================================
   404 HANDLER
========================================================= */

app.use(
  (
    req: Request,
    res: Response
  ) => {
    res.status(404).json({
      message: "Route not found",
      path: req.path,
    });
  }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(
      "Unhandled API error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error",
    });
  }
);

/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `AMORA Live API running on port ${PORT}`
    );
  }
);
