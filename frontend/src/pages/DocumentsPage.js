import React from "react";
import { FileText, Stamp } from "lucide-react";

import TabPage from "@/components/patterns/TabPage";
import DocumentsListTab from "@/components/documents/DocumentsListTab";
import PermitsPage from "@/pages/PermitsPage";
import { useAuth } from "@/context/AuthContext";
import { DOCS } from "@/constants/testIds";

// Peran yang memang punya izin melihat perizinan (rbac.py: permits view_all).
const PERMIT_ROLES = ["super_admin", "owner", "project_manager", "site_engineer",
  "sales_manager", "finance", "finance_manager"];

/**
 * DocumentsPage (`/documents`) — hub **Dokumen** (IA V2 §3).
 *
 * Menu “Perizinan & Dokumen” dilebur ke sini: daftar GLOBAL perizinan menjadi tab, sedangkan
 * perizinan per objek tetap muncul di Unit 360 & halaman Proyek. Rute `/permits` tetap hidup
 * (tautan lama & pintasan) — tidak ada fitur yang hilang, hanya pintu masuknya disatukan.
 */
export default function DocumentsPage() {
  const { user } = useAuth();
  const canPermits = PERMIT_ROLES.includes(user?.role);
  return (
    <div data-testid={DOCS.page} className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Dokumen</h1>
        <p className="text-sm text-muted-foreground">
          Dokumen transaksi (SPR/PPJB/AJB) dan — bagi peran yang berwenang — daftar perizinan
          proyek/unit.
        </p>
      </div>
      <TabPage paramKey="hub" tabs={[
        { key: "dokumen", label: "Dokumen Transaksi", icon: FileText,
          content: <DocumentsListTab /> },
        ...(canPermits ? [{ key: "perizinan", label: "Perizinan", icon: Stamp,
          content: <PermitsPage /> }] : []),
      ]} />
    </div>
  );
}
