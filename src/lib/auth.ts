import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { eq, and, gt, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import type { PublicUser } from "@/lib/auth-types";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  hashIp,
  hashSessionToken,
  randomToken,
} from "@/lib/security";
export type { PublicUser } from "@/lib/auth-types";

const BCRYPT_ROUNDS = 12;
const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function toPublic(user: typeof users.$inferSelect): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export function isLocked(user: { lockedUntil: Date | null }): boolean {
  return Boolean(user.lockedUntil && user.lockedUntil.getTime() > Date.now());
}

export async function recordFailedLogin(userId:number){
 await db.update(users).set({failedLoginCount:sql`${users.failedLoginCount}+1`,lockedUntil:sql`CASE WHEN ${users.failedLoginCount}+1 >= ${MAX_FAILED} THEN NOW()+(${LOCK_MS} * INTERVAL '1 millisecond') ELSE ${users.lockedUntil} END`,updatedAt:new Date()}).where(eq(users.id,userId));
}

export async function recordSuccessfulLogin(userId: number, ip: string) {
  await db
    .update(users)
    .set({
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIpHash: hashIp(ip),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function createSession(userId: number, ip: string, ua: string) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
    ipHash: hashIp(ip),
    userAgent: ua.slice(0, 180),
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token)));
  }
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token || token.length < 32) return null;

    const tokenHash = hashSessionToken(token);
    const rows = await db
      .select({ user: users, session: sessions })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date()), eq(users.status, "active")))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return toPublic(row.user);
  } catch {
    return null;
  }
}

export async function pruneExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export async function findUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}
