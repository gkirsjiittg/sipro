import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { TABPAGE } from "@/constants/testIds";

/**
 * TabPage — layout halaman kanonik dengan tab yang SINKRON KE URL (`?tab=`).
 *
 * Kenapa sinkron ke URL: tab yang hanya hidup di state tidak bisa dibagikan ("lihat tab
 * Dokumen lead ini"), hilang saat halaman dimuat ulang, dan membuat tombol Kembali browser
 * terasa rusak.
 *
 * tabs: [{ key, label, icon?, badge?, content, soon? }]
 *   `soon: "Fase 43"` → tab tetap TERLIHAT (supaya pemakai tahu peta jalannya) tetapi
 *   isinya menjelaskan dengan jujur bahwa datanya belum ada, bukan tabel kosong palsu.
 */
export default function TabPage({ tabs = [], header = null, paramKey = "tab", testId }) {
  const [params, setParams] = useSearchParams();
  const list = tabs.filter(Boolean);
  const active = useMemo(() => {
    const want = params.get(paramKey);
    return list.find((t) => t.key === want) || list[0];
  }, [params, paramKey, list]);

  const go = (key) => {
    const next = new URLSearchParams(params);
    next.set(paramKey, key);
    // Filter daftar di dalam tab lain tidak boleh terbawa: bersihkan penanda paginasi.
    next.delete("skip");
    setParams(next, { replace: false });
  };

  return (
    <div data-testid={testId || TABPAGE.root} className="space-y-4">
      {header}
      <div data-testid={TABPAGE.tabs} role="tablist"
        className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
        {list.map((t) => {
          const on = active?.key === t.key;
          const Icon = t.icon;
          return (
            <button key={t.key} type="button" role="tab" aria-selected={on}
              data-testid={`${TABPAGE.tab}-${t.key}`} data-active={on ? "true" : "false"}
              onClick={() => go(t.key)}
              className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
                "transition-colors",
                on ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {t.label}
              {t.badge !== undefined && t.badge !== null ? (
                <span className={cn("rounded px-1 text-xs tabular-nums",
                  on ? "bg-primary-foreground/20" : "bg-secondary")}>{t.badge}</span>
              ) : null}
              {t.soon ? (
                <span className="rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-800">
                  {t.soon}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div data-testid={TABPAGE.panel} data-tab={active?.key} role="tabpanel">
        {active?.soon ? (
          <div data-testid={TABPAGE.soon}
            className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" /> Belum aktif — dijadwalkan {active.soon}
            </p>
            <p className="mt-1.5">
              {active.soonNote || `Data untuk “${active.label}” belum dibuat sistem, jadi tab ini `
                + "sengaja tidak menampilkan angka apa pun (lebih baik kosong-jujur daripada "
                + "tabel palsu). Tab ini tetap terlihat agar peta jalannya jelas."}
            </p>
          </div>
        ) : active?.content}
      </div>
    </div>
  );
}
