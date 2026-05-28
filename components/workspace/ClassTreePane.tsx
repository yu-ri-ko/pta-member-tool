"use client";

/**
 * 左ペイン: 学年・クラス一覧。
 * 学年グループ（1〜6年・特別学級）は折りたたみ可能。
 * クラスをクリックすると中ペインの児童一覧が切り替わる。
 * 出典: docs/pta-plan.md「左ペイン：学年・クラス一覧」
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { type GradeGroupWithClasses, type SchoolClass } from "@/lib/pta-schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";

type ClassTreePaneProps = {
  /** buildGradeGroupTree で組み立てたツリー（sortOrder 順） */
  gradeGroupTree: GradeGroupWithClasses[];
  /** 選択中のクラス ID */
  selectedClassId: string;
  /** クラス選択時コールバック */
  onSelectClass: (classId: string) => void;
};

export function ClassTreePane({
  gradeGroupTree,
  selectedClassId,
  onSelectClass,
}: ClassTreePaneProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
    >
      {/* サイドバーヘッダー: タイトル + 折りたたみトグル */}
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <div className="flex h-12 items-center justify-between gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[state=expanded]:px-5">
          <h2 className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            学年・クラス
          </h2>
          <Pane1Toggle />
        </div>
      </SidebarHeader>

      {/* アイコン折りたたみ時はコンテンツを隠す */}
      <SidebarContent className="px-1 py-3 group-data-[collapsible=icon]:hidden">
        {gradeGroupTree.map(({ gradeGroup, classes }) => (
          <GradeGroupSection
            key={gradeGroup.id}
            label={gradeGroup.name}
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={onSelectClass}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

/** 学年グループ1件（折りたたみ可能な SidebarGroup） */
function GradeGroupSection({
  label,
  classes,
  selectedClassId,
  onSelectClass,
}: {
  label: string;
  classes: SchoolClass[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup className="px-1 py-0">
        {/* グループ見出し: クリックで折りたたみ */}
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/50">
          {label}
          <ChevronDown
            aria-hidden
            className="size-3.5 transition-transform in-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>

        {/* クラス一覧 */}
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {classes.map((cls) => {
                const active = cls.id === selectedClassId;
                return (
                  <SidebarMenuItem key={cls.id}>
                    <SidebarMenuButton
                      isActive={active}
                      aria-current={active ? "page" : undefined}
                      onClick={() => onSelectClass(cls.id)}
                    >
                      <span className="truncate">{cls.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
