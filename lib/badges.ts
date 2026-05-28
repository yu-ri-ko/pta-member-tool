/**
 * PTA 中ペイン（児童行）に表示するバッジのアイコン・ツールチップ設定。
 * アイコンを後から差し替えたい場合はここだけ変更する。
 * 出典: docs/pta-plan.md「中ペイン：児童一覧」バッジ仕様
 */

import type { LucideIcon } from "lucide-react";
import { Shield, ShieldOff, UserX } from "lucide-react";

/** バッジ1件の設定型 */
export type BadgeConfig = {
  /** lucide-react のアイコンコンポーネント */
  icon: LucideIcon;
  /** ツールチップ・スクリーンリーダー向けラベル */
  label: string;
};

/** アイコンバッジの設定マップ */
export const BADGE_CONFIG = {
  /** 役員免除（理由はセンシティブなため表示しない） */
  officerExempt: { icon: ShieldOff, label: "役員免除" } satisfies BadgeConfig,
  /** 非会員 */
  nonMember: { icon: UserX, label: "非会員" } satisfies BadgeConfig,
  /** 現役員（表示年度の役員経験行がある） */
  currentOfficer: { icon: Shield, label: "現役員" } satisfies BadgeConfig,
} as const;
