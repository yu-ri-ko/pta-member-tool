"use client";

/**
 * 右ペイン: 世帯詳細（Step 3 = 骨組み表示のみ）。
 * 右ペインの単位は「世帯（保護者）」。
 * 構造: タイトル（保護者名）→ 児童チップ → 区切り → 児童個別エリア → 世帯共通エリア。
 * Step 6 でインライン編集 UI を追加する。
 * 出典: docs/pta-plan.md「右ペイン：世帯詳細・編集」
 */

import { Shield, ShieldOff, UserX } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type Child,
  type Household,
  type SchoolClass,
  isCurrentOfficer,
} from "@/lib/pta-schema";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/primitives/SectionLabel";

type HouseholdDetailPaneProps = {
  /** 選択中世帯（null = 未選択状態） */
  household: Household | null;
  /** 選択中の児童（右ペイン児童個別エリア用） */
  selectedChild: Child | null;
  /** 同世帯の全児童（チップ表示用） */
  householdChildren: Child[];
  /** クラス名引き当て用マップ */
  classById: Map<string, SchoolClass>;
  /** 現役員バッジ判定に使う表示年度 */
  displayFiscalYear: number;
  /** 児童チップクリック時（右ペイン内で選択切替） */
  onSelectChild: (childId: string) => void;
};

export function HouseholdDetailPane({
  household,
  selectedChild,
  householdChildren,
  classById,
  displayFiscalYear,
  onSelectChild,
}: HouseholdDetailPaneProps) {
  if (!household || !selectedChild) {
    return (
      <section className="flex min-h-0 flex-1 items-center justify-center bg-canvas">
        <p className="text-sm text-muted-foreground">児童を選択してください</p>
      </section>
    );
  }

  const selectedClass = classById.get(selectedChild.classId);
  const classLabel = selectedClass
    ? `${selectedChild.grade}年 ${selectedClass.name}`
    : `${selectedChild.grade}年`;

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-canvas">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-5 py-5">
          {/* タイトル: 保護者名 */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">保護者</p>
            <h2 className="text-base font-semibold text-foreground">
              {household.guardianName}
            </h2>
          </div>

          {/* 児童チップ（折り返し可。クリックで右ペイン内の対象児童切替） */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">児童</p>
            <div className="flex flex-wrap gap-1.5">
              {householdChildren.map((c) => {
                const cls = classById.get(c.classId);
                const chipLabel = cls
                  ? `${c.grade}年${cls.name}`
                  : `${c.grade}年`;
                const isSelected = c.id === selectedChild.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectChild(c.id)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs transition-colors",
                      "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {c.name}
                    <span className="ml-1.5 opacity-60">{chipLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 児童個別エリア（選択中の児童の情報） */}
          <div className="flex flex-col gap-3">
            <SectionLabel>児童情報</SectionLabel>
            <div className="flex flex-col gap-0 rounded-lg bg-card">
              <FieldRow label="氏名" value={selectedChild.name} />
              <FieldRow label="学年・クラス" value={classLabel} />
              {selectedChild.exchangeClass && (
                <FieldRow
                  label="交流学級"
                  value={selectedChild.exchangeClass}
                />
              )}
            </div>
          </div>

          {/* 世帯共通エリア: 状態（2軸モデル） */}
          <div className="flex flex-col gap-3">
            <SectionLabel>会員情報</SectionLabel>
            <div className="flex flex-col gap-0 rounded-lg bg-card">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-xs text-muted-foreground">会員区分</span>
                {household.membershipStatus === "member" ? (
                  <Badge variant="default" size="xs">
                    会員
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="xs">
                    <UserX className="size-3" aria-hidden />
                    非会員
                  </Badge>
                )}
              </div>

              {/* 役員免除（会員のときだけ表示） */}
              {household.membershipStatus === "member" && (
                <>
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      役員免除
                    </span>
                    {household.officerExempt ? (
                      <Badge variant="secondary" size="xs">
                        <ShieldOff className="size-3" aria-hidden />
                        免除
                      </Badge>
                    ) : (
                      <span className="text-xs text-foreground">なし</span>
                    )}
                  </div>
                  {/* 免除理由（免除 ON かつ理由テキストあり のときだけ表示） */}
                  {household.officerExempt && household.exemptReason && (
                    <div className="flex items-start justify-between gap-2 px-4 py-2.5">
                      <span className="shrink-0 text-xs text-muted-foreground">
                        免除理由
                      </span>
                      <span className="min-w-0 text-right text-xs text-foreground">
                        {household.exemptReason}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* 現役員 */}
              {isCurrentOfficer(household, displayFiscalYear) && (
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">現役員</span>
                  <Badge variant="default" size="xs">
                    <Shield className="size-3" aria-hidden />
                    {displayFiscalYear}年度
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* 役員経験表（行がある場合のみ表示） */}
          {household.officerHistory.length > 0 && (
            <div className="flex flex-col gap-3">
              <SectionLabel>役員経験</SectionLabel>
              <div className="rounded-lg bg-card px-4 py-3">
                <div className="flex flex-col gap-2">
                  {/* テーブルヘッダー */}
                  <div className="grid grid-cols-[4rem_4rem_1fr_1fr] text-xs font-medium text-muted-foreground">
                    <span>年度</span>
                    <span>区分</span>
                    <span>役職</span>
                    <span>備考</span>
                  </div>
                  <Separator />
                  {/* 役員経験行 */}
                  {household.officerHistory.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[4rem_4rem_1fr_1fr] text-xs text-foreground"
                    >
                      <span className="tabular-nums">{row.fiscalYear}年度</span>
                      <span className="text-muted-foreground">{row.division}</span>
                      <span>{row.role}</span>
                      <span className="text-muted-foreground">{row.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 世帯メモ（入力がある場合のみ表示） */}
          {household.householdMemo && (
            <div className="flex flex-col gap-3">
              <SectionLabel>世帯メモ</SectionLabel>
              <div className="rounded-lg bg-card px-4 py-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {household.householdMemo}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}

/** フィールド行（ラベル + 値） */
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-xs text-foreground">{value}</span>
    </div>
  );
}
