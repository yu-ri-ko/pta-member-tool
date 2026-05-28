/**
 * PTA会員管理ツール トップページ（Server Component）。
 * data/pta.json を Zod スキーマで検証し、PtaWorkspace に渡す。
 * アクセス先: /pta
 * 出典: docs/pta-plan.md「今月のスコープ」「データ設計・補足ルール」
 */

import ptaRawData from "@/data/pta.json";
import { ptaDataSchema } from "@/lib/pta-schema";
import { PtaWorkspace } from "@/components/workspace/PtaWorkspace";

export default function PtaPage() {
  // Zod でランタイム検証（形式エラーはビルド/起動時に即気づける）
  const result = ptaDataSchema.safeParse(ptaRawData);
  if (!result.success) {
    throw new Error(
      `data/pta.json の形式が正しくありません: ${result.error.issues[0]?.message}`,
    );
  }

  return <PtaWorkspace data={result.data} />;
}
