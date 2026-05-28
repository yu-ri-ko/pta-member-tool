"use client";

/**
 * PTA ワークスペースの親コンポーネント（3ペイン構成）。
 *
 * レイアウト:
 * ```
 * <SidebarProvider>
 * ┌─ ClassTreePane (Sidebar) ─┬─ SidebarInset ──────────────────────┐
 * │ 学年・クラス                │ PtaGlobalHeader (h-12)             │
 * │ collapsible="icon"          ├─ ChildListPane ─┬─ HouseholdDetailPane ─┤
 * │                             │ 児童一覧         │ 世帯詳細・編集        │
 * └─────────────────────────────┴─────────────────┴───────────────────────┘
 * ```
 *
 * 選択状態:
 * - selectedClassId: 左ペインで選択中のクラス
 * - selectedChildId: 中ペインで選択中の児童（クラス変更時は render でフォールバック）
 *
 * 出典: docs/pta-plan.md「画面構成（3ペイン）」「ひな形との対応」
 */

import { useState, useMemo, useCallback } from "react";

import {
  type PtaData,
  buildChildListRows,
  buildGradeGroupTree,
} from "@/lib/pta-schema";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClassTreePane } from "@/components/workspace/ClassTreePane";
import { ChildListPane } from "@/components/workspace/ChildListPane";
import { HouseholdDetailPane } from "@/components/workspace/HouseholdDetailPane";
import { PtaGlobalHeader } from "@/components/workspace/PtaGlobalHeader";

type PtaWorkspaceProps = {
  data: PtaData;
};

export function PtaWorkspace({ data }: PtaWorkspaceProps) {
  // 学年グループツリーを構築（sortOrder 順）
  const gradeGroupTree = useMemo(
    () => buildGradeGroupTree(data.gradeGroups, data.classes),
    [data.gradeGroups, data.classes],
  );

  // クラス ID → SchoolClass のマップ（クラス名引き当て用）
  const classById = useMemo(
    () => new Map(data.classes.map((c) => [c.id, c])),
    [data.classes],
  );

  // 初期選択: 最初の学年グループの最初のクラス
  const firstClassId = gradeGroupTree[0]?.classes[0]?.id ?? "";
  const [selectedClassId, setSelectedClassId] = useState(firstClassId);

  // 中ペインの選択児童（null = 未選択。クラス変更時に render でフォールバック）
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // 選択クラスの表示タイトル（例: "1年 1組"）
  const selectedClassObj = classById.get(selectedClassId);
  const selectedGradeGroup = data.gradeGroups.find(
    (g) => g.id === selectedClassObj?.gradeGroupId,
  );
  const classTitle =
    selectedGradeGroup && selectedClassObj
      ? `${selectedGradeGroup.name} ${selectedClassObj.name}`
      : "クラス未選択";

  // 選択クラスの児童行（五十音順ソート済み）
  const childRows = useMemo(
    () => buildChildListRows(data.children, data.households, selectedClassId),
    [data.children, data.households, selectedClassId],
  );

  // クラス変更で selectedChildId が無効になった場合、先頭児童にフォールバック
  // Effect+setState を使わず、レンダー時に派生計算する（React 19 規律）
  const effectiveChildId =
    childRows.some((r) => r.child.id === selectedChildId)
      ? selectedChildId
      : (childRows[0]?.child.id ?? null);

  // 右ペイン用のアクティブデータ
  const activeRow = childRows.find((r) => r.child.id === effectiveChildId);
  const activeHousehold = activeRow?.household ?? null;
  const activeChild = activeRow?.child ?? null;

  // 同世帯の全児童（右ペイン児童チップ用）
  const householdChildren = useMemo(
    () =>
      activeHousehold
        ? data.children.filter((c) => c.householdId === activeHousehold.id)
        : [],
    [data.children, activeHousehold],
  );

  const handleSelectClass = useCallback((classId: string) => {
    setSelectedClassId(classId);
  }, []);

  const handleSelectChild = useCallback((childId: string) => {
    setSelectedChildId(childId);
  }, []);

  return (
    <SidebarProvider
      defaultOpen
      className="h-screen w-full overflow-hidden bg-background text-foreground"
    >
      {/* 左ペイン: 学年・クラスツリー */}
      <ClassTreePane
        gradeGroupTree={gradeGroupTree}
        selectedClassId={selectedClassId}
        onSelectClass={handleSelectClass}
      />

      <SidebarInset className="flex min-w-0 flex-col bg-background">
        {/* グローバルヘッダー: 組織名 | 年度 */}
        <PtaGlobalHeader
          organizationName={data.settings.organizationName}
          fiscalYear={data.settings.displayFiscalYear}
        />

        {/* 中ペイン + 右ペインの横並び */}
        <div className="flex min-h-0 flex-1">
          {/* 中ペイン: 児童一覧 */}
          <ChildListPane
            title={classTitle}
            rows={childRows}
            allChildren={data.children}
            displayFiscalYear={data.settings.displayFiscalYear}
            selectedChildId={effectiveChildId}
            onSelectChild={handleSelectChild}
          />

          {/* 右ペイン: 世帯詳細 */}
          <HouseholdDetailPane
            household={activeHousehold}
            selectedChild={activeChild}
            householdChildren={householdChildren}
            classById={classById}
            displayFiscalYear={data.settings.displayFiscalYear}
            onSelectChild={handleSelectChild}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
