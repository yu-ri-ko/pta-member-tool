/**
 * 採用管理ドメインの Zod スキーマと派生型（ひな形用）。
 * PTA 実装 Step 3 完了後に削除予定。新規 PTA コードは `@/lib/pta-schema` を参照すること。
 *
 * 仕様の出典:
 *   - openspec/decision/0005-dashboard-drilldown-and-global-header.md
 *   - openspec/changes/add-4pane-workspace-template/specs/workspace-template/spec.md
 */

import { z } from "zod";

// ===== Pane 1: 部署 → ポジション 階層 =====

/** 部署配下の単一ポジション。Pane 1 の階層 Sidebar に表示する単位。 */
export const positionSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number(),
});
export type Position = z.infer<typeof positionSchema>;

/** 部署と配下のポジション一覧。Pane 1 の階層 Sidebar の最上位単位。 */
export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  positions: z.array(positionSchema),
});
export type Department = z.infer<typeof departmentSchema>;

// ===== 候補者プロフィール =====

export const profileSchema = z.object({
  name: z.string(),
  birthday: z.string(),
  source: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  recruiter: z.string(),
  desiredSalaryMin: z.string(),
  desiredSalaryMax: z.string(),
  availableStartDate: z.string(),
  careerText: z.string(),
  motivationFull: z.string(),
});
export type Profile = z.infer<typeof profileSchema>;

// ===== 評価観点（4 軸固定） =====

export const axisKeySchema = z.enum([
  "achievements",
  "thinkingAbility",
  "communication",
  "cultureFit",
]);
export type AxisKey = z.infer<typeof axisKeySchema>;

export const axisScoresSchema = z.object({
  achievements: z.number().nullable(),
  thinkingAbility: z.number().nullable(),
  communication: z.number().nullable(),
  cultureFit: z.number().nullable(),
});
export type AxisScores = z.infer<typeof axisScoresSchema>;

export const AXIS_ORDER = axisKeySchema.options;

// ===== 選考フロー =====

export const stageKeySchema = z.enum(["screening", "first", "second", "final"]);
export type StageKey = z.infer<typeof stageKeySchema>;

export const stageStatusSchema = z.enum(["done", "planned", "pending"]);
export type StageStatus = z.infer<typeof stageStatusSchema>;

const txtAttachmentSchema = z.object({
  id: z.string(),
  kind: z.literal("txt"),
  name: z.string(),
  size: z.string(),
  previewText: z.string(),
});
const pdfAttachmentSchema = z.object({
  id: z.string(),
  kind: z.literal("pdf"),
  name: z.string(),
  size: z.string(),
});
export const attachmentSchema = z.discriminatedUnion("kind", [
  txtAttachmentSchema,
  pdfAttachmentSchema,
]);
export type Attachment = z.infer<typeof attachmentSchema>;

export const scorecardSchema = z.object({
  stage: stageKeySchema,
  label: z.string(),
  date: z.string(),
  format: z.string(),
  interviewer: z.string(),
  decision: z.string().optional(),
  comment: z.string().optional(),
  summary: z.string().optional(),
  axisScores: axisScoresSchema,
  attachments: z.array(attachmentSchema),
});
export type Scorecard = z.infer<typeof scorecardSchema>;

export const STAGE_ORDER = stageKeySchema.options;

// ===== 候補者 =====

export const candidateSchema = z.object({
  id: z.string(),
  profile: profileSchema,
  scorecards: z.array(scorecardSchema),
  stage: stageKeySchema,
  archived: z.boolean().default(false),
});
export type Candidate = z.infer<typeof candidateSchema>;

// ===== JSON 全体用スキーマ =====

export const departmentsSchema = z.array(departmentSchema);
export const candidatesSchema = z.array(candidateSchema);
export const workspaceSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

export type SelectedDetail = { type: "stage"; stage: StageKey } | null;

export type CandidateRow = {
  id: string;
  name: string;
  averageScore: number | null;
};

export type Group =
  | { kind: "stage"; stage: StageKey; label: string; items: CandidateRow[] }
  | { kind: "archived"; label: string; items: CandidateRow[] };
