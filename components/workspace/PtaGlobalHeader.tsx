/**
 * PTA ワークスペースのグローバルヘッダー。
 * 組織名と表示年度を常時表示する（今月は固定ラベル）。
 * 将来: 手動切替・年度更新ボタン追加予定。
 * 出典: docs/pta-plan.md「画面上部（GlobalHeader）」
 */

type PtaGlobalHeaderProps = {
  /** `organizationName` フィールドの値をそのまま渡す */
  organizationName: string;
  /** 表示年度（例: 2025） */
  fiscalYear: number;
};

export function PtaGlobalHeader({
  organizationName,
  fiscalYear,
}: PtaGlobalHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border bg-background px-4">
      <h1 className="truncate text-sm font-semibold text-foreground">
        {organizationName}
        <span className="mx-2 text-muted-foreground" aria-hidden>
          |
        </span>
        <span className="text-muted-foreground">{fiscalYear}年度</span>
      </h1>
    </header>
  );
}
