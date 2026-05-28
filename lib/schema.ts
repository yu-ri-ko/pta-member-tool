/**
 * スキーマのエントリポイント。
 *
 * - PTA会員管理: `@/lib/pta-schema`（新規実装の SSoT）
 * - 採用管理ひな形: `@/lib/recruitment-schema`（Step 3 完了まで Workspace が参照）
 *
 * 新規 PTA コードは `pta-schema` を直接 import してよい。
 */

export * from "@/lib/pta-schema";

/** 採用管理ひな形（PTA Step 3 で Workspace 差し替え後に削除予定） */
export * from "@/lib/recruitment-schema";
