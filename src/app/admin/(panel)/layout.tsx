import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function PanelLayout({children}:{children:React.ReactNode}){const admin=await getCurrentAdmin();if(!admin)redirect("/admin/login");return <AdminShell admin={admin}>{children}</AdminShell>}
