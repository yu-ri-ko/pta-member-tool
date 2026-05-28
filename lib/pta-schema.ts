/**
 * PTA会員管理ドメインの Zod スキーマと派生型。
 * 設計の出典: docs/pta-plan.md（データ設計・モックデータの補足ルール含む）
 *
 * データモデルの要点:
 *   - 児童（Child）は householdId で世帯（Household）に紐づく（正規化）
 *   - 学年グループ（GradeGroup）とクラス（SchoolClass）はデータ駆動（固定組数なし）
 *   - 中ペインの五十音順は studentKana でソート
 */

import { z } from "zod";

// ===== 設定（ヘッダー表示） =====

/** ワークスペース全体の表示設定（組織名・表示年度） */
export const ptaSettingsSchema = z.object({
  organizationName: z.string(),
  displayFiscalYear: z.number().int(),
});
export type PtaSettings = z.infer<typeof ptaSettingsSchema>;

// ===== 左ペイン: 学年グループ → クラス（動的） =====

/** 学年グループの種別。通常学年 or 特別学級（並列グループ） */
export const gradeGroupKindSchema = z.enum(["grade", "special"]);
export type GradeGroupKind = z.infer<typeof gradeGroupKindSchema>;

/**
 * 左ペインの折りたたみ単位（1年〜6年、特別学級）。
 * クラス数は固定せず、SchoolClass を gradeGroupId で紐づける。
 */
export const gradeGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: gradeGroupKindSchema,
  sortOrder: z.number().int(),
});
export type GradeGroup = z.infer<typeof gradeGroupSchema>;

/**
 * クラス（1組・2組…）。存在するクラスのみデータに載せ、左ペインはこれを動的表示。
 */
export const schoolClassSchema = z.object({
  id: z.string(),
  gradeGroupId: z.string(),
  name: z.string(),
  sortOrder: z.number().int(),
});
export type SchoolClass = z.infer<typeof schoolClassSchema>;

// ===== 世帯（保護者）— 右ペインの主単位 =====

/** 会員区分（2軸モデルの第1軸） */
export const membershipStatusSchema = z.enum(["member", "non_member"]);
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

/** 役員経験の1行（年度・役職・備考） */
export const officerHistoryRowSchema = z.object({
  fiscalYear: z.number().int(),
  role: z.string(),
  note: z.string().default(""),
});
export type OfficerHistoryRow = z.infer<typeof officerHistoryRowSchema>;

/**
 * 世帯（代表保護者1人 + 状態・役員経験・メモ）。
 * 児童は Child 側で householdId を持ち、ここにはネストしない。
 */
export const householdSchema = z.object({
  id: z.string(),
  guardianName: z.string(),
  membershipStatus: membershipStatusSchema,
  officerExempt: z.boolean().default(false),
  exemptReason: z.string().default(""),
  officerHistory: z.array(officerHistoryRowSchema).default([]),
  householdMemo: z.string().default(""),
});
export type Household = z.infer<typeof householdSchema>;

// ===== 児童 — 中ペイン1行・右ペイン個別エリア =====

/**
 * 児童。世帯とは householdId で結ぶ。
 * studentKana で中ペインを五十音順ソートする。
 */
export const childSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  name: z.string(),
  studentKana: z.string(),
  grade: z.number().int().min(1).max(6),
  classId: z.string(),
  exchangeClass: z.string().optional(),
});
export type Child = z.infer<typeof childSchema>;

// ===== JSON 全体（data/pta.json 想定） =====

export const ptaDataSchema = z.object({
  settings: ptaSettingsSchema,
  gradeGroups: z.array(gradeGroupSchema),
  classes: z.array(schoolClassSchema),
  households: z.array(householdSchema),
  children: z.array(childSchema),
});
export type PtaData = z.infer<typeof ptaDataSchema>;

// ===== UI 派生型 =====

/** 中ペイン1行: 児童 + 紐づく世帯（バッジ・右ペイン用） */
export type ChildListRow = {
  child: Child;
  household: Household;
};

/** 右ペイン: 世帯詳細 + 同世帯の児童一覧（チップ切替用） */
export type HouseholdDetailContext = {
  household: Household;
  children: Child[];
  selectedChildId: string;
  schoolClassById: Map<string, SchoolClass>;
};

/** 左ペイン: 学年グループ + 配下クラス（動的組み立て） */
export type GradeGroupWithClasses = {
  gradeGroup: GradeGroup;
  classes: SchoolClass[];
};

// ===== 参照ヘルパー =====

/** ID で世帯を取得 */
export function getHouseholdById(
  households: Household[],
  householdId: string,
): Household | undefined {
  return households.find((h) => h.id === householdId);
}

/** クラス ID に属する児童一覧 */
export function getChildrenByClassId(
  children: Child[],
  classId: string,
): Child[] {
  return children.filter((c) => c.classId === classId);
}

/** studentKana の五十音順でソート */
export function sortChildrenByKana(children: Child[]): Child[] {
  return [...children].sort((a, b) =>
    a.studentKana.localeCompare(b.studentKana, "ja"),
  );
}

/** 児童行 + 世帯を組み立て（世帯が無い児童は除外） */
export function buildChildListRows(
  children: Child[],
  households: Household[],
  classId: string,
): ChildListRow[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  return sortChildrenByKana(getChildrenByClassId(children, classId))
    .map((child) => {
      const household = householdById.get(child.householdId);
      if (!household) return null;
      return { child, household };
    })
    .filter((row): row is ChildListRow => row !== null);
}

/** 左ペイン用: gradeGroups に classes を紐づけたツリー */
export function buildGradeGroupTree(
  gradeGroups: GradeGroup[],
  classes: SchoolClass[],
): GradeGroupWithClasses[] {
  const byGroup = new Map<string, SchoolClass[]>();
  for (const cls of classes) {
    const list = byGroup.get(cls.gradeGroupId) ?? [];
    list.push(cls);
    byGroup.set(cls.gradeGroupId, list);
  }
  return [...gradeGroups]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((gradeGroup) => ({
      gradeGroup,
      classes: (byGroup.get(gradeGroup.id) ?? []).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    }));
}

/** 表示中年度に現役員か */
export function isCurrentOfficer(
  household: Household,
  displayFiscalYear: number,
): boolean {
  return household.officerHistory.some(
    (row) => row.fiscalYear === displayFiscalYear,
  );
}

/** 兄弟の学年バッジ用: 同世帯の他児童の学年 */
export function getSiblingGrades(
  children: Child[],
  householdId: string,
  excludeChildId: string,
): number[] {
  const grades = new Set<number>();
  for (const c of children) {
    if (c.householdId === householdId && c.id !== excludeChildId) {
      grades.add(c.grade);
    }
  }
  return [...grades].sort((a, b) => a - b);
}
