import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { adminActivityLogs, adminSessions, permissions, rolePermissions, roles, userRoles, users } from "@/db/schema";
import { hashIp, hashSessionToken, randomToken } from "@/lib/security";

export const ADMIN_COOKIE = "nirvana_admin_session";
const ADMIN_SESSION_HOURS = 8;
export const adminCookieOptions=(maxAge=ADMIN_SESSION_HOURS*3600)=>({httpOnly:true as const,sameSite:"strict" as const,secure:process.env.NODE_ENV==="production",path:"/",maxAge});

export const PERMISSIONS = [
  "dashboard.view", "products.view", "products.create", "products.edit", "products.delete",
  "inventory.view", "inventory.adjust", "orders.view", "orders.edit", "orders.refund",
  "customers.view", "customers.edit", "reports.view", "reports.export",
  "users.view", "users.create", "users.edit", "users.delete", "roles.manage",
  "settings.manage", "activity.view", "notifications.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [...PERMISSIONS],
  admin: PERMISSIONS.filter((p) => !["users.delete", "roles.manage"].includes(p)),
  manager: PERMISSIONS.filter((p) => !p.startsWith("users.") && p !== "roles.manage" && p !== "settings.manage"),
  inventory_manager: ["dashboard.view", "products.view", "products.edit", "inventory.view", "inventory.adjust", "notifications.view"],
  order_manager: ["dashboard.view", "orders.view", "orders.edit", "customers.view", "reports.view", "notifications.view"],
  support: ["dashboard.view", "orders.view", "customers.view", "customers.edit", "notifications.view"],
};

export type AdminUser = { id: number; name: string; email: string; role: string; permissions: Permission[] };

export function isAdminRole(role: string) {
  return role !== "customer" && Object.prototype.hasOwnProperty.call(DEFAULT_ROLE_PERMISSIONS, role);
}
export function canAssignAdminRole(actorRole:string,targetRole:string){
  if(!isAdminRole(targetRole))return false;
  if(targetRole==="super_admin")return actorRole==="super_admin";
  return actorRole==="super_admin"||actorRole==="admin";
}

export async function createAdminSession(userId: number, ip: string, userAgent: string) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000);
  await db.transaction(async tx=>{await tx.insert(adminSessions).values({userId,tokenHash:hashSessionToken(`admin:${token}`),expiresAt,ipHash:hashIp(ip),userAgent:userAgent.slice(0,180)});await tx.insert(adminActivityLogs).values({adminId:userId,action:"auth.login",targetType:"admin",targetId:String(userId),metadata:{},ipHash:hashIp(ip)})});
  const jar = await cookies();
  jar.set(ADMIN_COOKIE,token,adminCookieOptions());
}

async function permissionsFor(userId: number, legacyRole: string): Promise<Permission[]> {
  if (legacyRole === "super_admin") return [...PERMISSIONS];
  const assignments=await db.select({roleId:userRoles.roleId}).from(userRoles).where(eq(userRoles.userId,userId));
  if(assignments.length){
    const rows=await db.select({key:permissions.key}).from(userRoles).innerJoin(roles,eq(userRoles.roleId,roles.id)).innerJoin(rolePermissions,eq(roles.id,rolePermissions.roleId)).innerJoin(permissions,eq(rolePermissions.permissionId,permissions.id)).where(eq(userRoles.userId,userId));
    return [...new Set(rows.map(r=>r.key).filter((key):key is Permission=>(PERMISSIONS as readonly string[]).includes(key)))];
  }
  const [configuredRole]=await db.select({id:roles.id}).from(roles).where(eq(roles.key,legacyRole)).limit(1);
  if(configuredRole){
    const rows=await db.select({key:permissions.key}).from(rolePermissions).innerJoin(permissions,eq(rolePermissions.permissionId,permissions.id)).where(eq(rolePermissions.roleId,configuredRole.id));
    return [...new Set(rows.map(r=>r.key).filter((key):key is Permission=>(PERMISSIONS as readonly string[]).includes(key)))];
  }
  return DEFAULT_ROLE_PERMISSIONS[legacyRole]??[];
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token || token.length < 32) return null;
    const rows = await db.select({ user: users, session: adminSessions }).from(adminSessions)
      .innerJoin(users, eq(adminSessions.userId, users.id))
      .where(and(eq(adminSessions.tokenHash, hashSessionToken(`admin:${token}`)), gt(adminSessions.expiresAt, new Date()), eq(users.status, "active"))).limit(1);
    const user = rows[0]?.user;
    if (!user || !isAdminRole(user.role)) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role, permissions: await permissionsFor(user.id, user.role) };
  } catch { return null; }
}

export async function destroyAdminSession(admin?:{id:number;ip?:string}){
 const jar=await cookies(),token=jar.get(ADMIN_COOKIE)?.value;
 if(token)await db.transaction(async tx=>{await tx.delete(adminSessions).where(eq(adminSessions.tokenHash,hashSessionToken(`admin:${token}`)));if(admin)await tx.insert(adminActivityLogs).values({adminId:admin.id,action:"auth.logout",targetType:"admin",targetId:String(admin.id),metadata:{},ipHash:admin.ip?hashIp(admin.ip):null})});
 jar.set(ADMIN_COOKIE,"",adminCookieOptions(0));
}

export async function requireAdmin(permission?: Permission): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AdminAuthError(401, "نشست مدیریت معتبر نیست");
  if (permission && !admin.permissions.includes(permission)) throw new AdminAuthError(403, "اجازه انجام این عملیات را ندارید");
  return admin;
}

export class AdminAuthError extends Error { constructor(public status: 401 | 403, message: string) { super(message); } }

export async function audit(adminId: number | null, action: string, targetType: string, targetId?: string | number | null, metadata: Record<string, unknown> = {}, ip?: string) {
  await db.insert(adminActivityLogs).values({ adminId, action, targetType, targetId: targetId == null ? null : String(targetId), metadata, ipHash: ip ? hashIp(ip) : null });
}

export async function requireAdminApi(permission?: Permission) {
  try { return { admin: await requireAdmin(permission), response: null }; }
  catch (error) {
    if (error instanceof AdminAuthError) return { admin: null, response: Response.json({ ok: false, message: error.message }, { status: error.status }) };
    throw error;
  }
}
