"use client";

/**
 * 中ペイン: 選択クラスの児童一覧。
 * 1行 = 1児童（世帯は右ペインで表示）。
 * 並び順: studentKana 五十音順（buildChildListRows 内でソート済み）。
 * バッジ: アイコン優先・ホバーでツールチップ。
 * 出典: docs/pta-plan.md「中ペイン：児童一覧」
 */

import { cn } from "@/lib/utils";
import {
  type Child,
  type ChildListRow,
  getSiblingGrades,
  isCurrentOfficer,
} from "@/lib/pta-schema";
import { BADGE_CONFIG } from "@/lib/badges";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChildListPaneProps = {
  /** ペインヘッダーに表示するクラス名（例: "1年 1組"） */
  title: string;
  /** 選択クラスの児童行（childSchema + household）一覧 */
  rows: ChildListRow[];
  /** バッジ計算用の全児童（兄弟学年を派生するため） */
  allChildren: Child[];
  /** 現役員バッジの判定に使う表示年度 */
  displayFiscalYear: number;
  /** 選択中の児童 ID（null = 未選択） */
  selectedChildId: string | null;
  /** 児童行クリック時コールバック */
  onSelectChild: (childId: string) => void;
};

export function ChildListPane({
  title,
  rows,
  allChildren,
  displayFiscalYear,
  selectedChildId,
  onSelectChild,
}: ChildListPaneProps) {
  return (
    <section className="flex w-[280px] shrink-0 flex-col border-r border-border bg-background">
      {/* ペインヘッダー */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {title}
        </h2>
        <Badge variant="secondary" size="xs" className="shrink-0">
          {rows.length}
        </Badge>
      </header>

      {/* 児童リスト */}
      <ScrollArea className="min-h-0 flex-1">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            このクラスに児童がいません
          </p>
        ) : (
          <ul className="flex flex-col gap-1 px-2 py-3">
            {rows.map(({ child, household }) => {
              const isSelected = child.id === selectedChildId;
              const siblingGrades = getSiblingGrades(
                allChildren,
                child.householdId,
                child.id,
              );
              return (
                <li key={child.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectChild(child.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectChild(child.id);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors",
                      "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {/* 児童名 */}
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {child.name}
                    </span>

                    {/* アイコンバッジ群 */}
                    <span className="flex shrink-0 items-center gap-1">
                      <ChildBadges
                        household={household}
                        siblingGrades={siblingGrades}
                        displayFiscalYear={displayFiscalYear}
                        selected={isSelected}
                      />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </section>
  );
}

/** 児童行バッジ群（アイコン優先・ホバーでツールチップ） */
function ChildBadges({
  household,
  siblingGrades,
  displayFiscalYear,
  selected,
}: {
  household: ChildListRow["household"];
  siblingGrades: number[];
  displayFiscalYear: number;
  selected: boolean;
}) {
  const iconClass = cn(
    "size-3.5 shrink-0",
    selected ? "text-accent-foreground/70" : "text-muted-foreground",
  );

  const NonMemberIcon = BADGE_CONFIG.nonMember.icon;
  const ExemptIcon = BADGE_CONFIG.officerExempt.icon;
  const OfficerIcon = BADGE_CONFIG.currentOfficer.icon;

  return (
    <>
      {/* 非会員バッジ */}
      {household.membershipStatus === "non_member" && (
        <Tooltip>
          <TooltipTrigger>
            <NonMemberIcon aria-hidden className={iconClass} />
            <span className="sr-only">{BADGE_CONFIG.nonMember.label}</span>
          </TooltipTrigger>
          <TooltipContent>{BADGE_CONFIG.nonMember.label}</TooltipContent>
        </Tooltip>
      )}

      {/* 役員免除バッジ（理由は非表示） */}
      {household.officerExempt && (
        <Tooltip>
          <TooltipTrigger>
            <ExemptIcon aria-hidden className={iconClass} />
            <span className="sr-only">{BADGE_CONFIG.officerExempt.label}</span>
          </TooltipTrigger>
          <TooltipContent>{BADGE_CONFIG.officerExempt.label}</TooltipContent>
        </Tooltip>
      )}

      {/* 現役員バッジ */}
      {isCurrentOfficer(household, displayFiscalYear) && (
        <Tooltip>
          <TooltipTrigger>
            <OfficerIcon aria-hidden className={iconClass} />
            <span className="sr-only">{BADGE_CONFIG.currentOfficer.label}</span>
          </TooltipTrigger>
          <TooltipContent>{BADGE_CONFIG.currentOfficer.label}</TooltipContent>
        </Tooltip>
      )}

      {/* 兄弟の学年バッジ（最大2つ・超過は +N） */}
      {siblingGrades.slice(0, 2).map((grade) => (
        <Tooltip key={grade}>
          <TooltipTrigger>
            <Badge
              variant="secondary"
              size="xs"
              className="px-1 tabular-nums"
              aria-label={`${grade}年に兄弟`}
            >
              {grade}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{grade}年に兄弟</TooltipContent>
        </Tooltip>
      ))}
      {siblingGrades.length > 2 && (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" size="xs" className="px-1 tabular-nums">
              +{siblingGrades.length - 2}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            他{siblingGrades.length - 2}名の兄弟
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
