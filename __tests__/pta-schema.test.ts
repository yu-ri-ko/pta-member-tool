import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, it, expect } from "vitest";

import {
  ptaDataSchema,
  buildChildListRows,
  buildGradeGroupTree,
  sortChildrenByKana,
  getHouseholdById,
} from "@/lib/pta-schema";

const ptaJsonPath = join(process.cwd(), "data", "pta.json");

const minimalPtaData = {
  settings: {
    organizationName: "さくら市立青葉小学校 PTA",
    displayFiscalYear: 2025,
  },
  gradeGroups: [
    { id: "g1", name: "1年", kind: "grade" as const, sortOrder: 1 },
  ],
  classes: [
    { id: "c1a", gradeGroupId: "g1", name: "1組", sortOrder: 1 },
    { id: "c1b", gradeGroupId: "g1", name: "2組", sortOrder: 2 },
  ],
  households: [
    {
      id: "h1",
      guardianName: "田中 花子",
      membershipStatus: "member" as const,
      officerExempt: false,
      exemptReason: "",
      officerHistory: [],
      householdMemo: "",
    },
    {
      id: "h2",
      guardianName: "佐藤 一郎",
      membershipStatus: "member" as const,
      officerExempt: true,
      exemptReason: "前本部役員",
      officerHistory: [{ fiscalYear: 2025, role: "会計", note: "" }],
      householdMemo: "",
    },
  ],
  children: [
    {
      id: "ch2",
      householdId: "h2",
      name: "佐藤 次郎",
      studentKana: "サトウ ジロウ",
      grade: 1,
      classId: "c1a",
    },
    {
      id: "ch1",
      householdId: "h1",
      name: "田中 太郎",
      studentKana: "タナカ タロウ",
      grade: 1,
      classId: "c1a",
    },
  ],
};

describe("ptaDataSchema", () => {
  it("data/pta.json を検証できる", () => {
    const raw = JSON.parse(readFileSync(ptaJsonPath, "utf8"));
    const result = ptaDataSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.settings.organizationName).toContain("青葉小学校");
      expect(result.data.gradeGroups.some((g) => g.kind === "special")).toBe(
        true,
      );
      expect(result.data.children.length).toBeGreaterThan(100);
    }
  });

  it("最小データを検証できる", () => {
    const result = ptaDataSchema.safeParse(minimalPtaData);
    expect(result.success).toBe(true);
  });

  it("householdId 欠落の児童は不可", () => {
    const invalid = {
      ...minimalPtaData,
      children: [
        {
          id: "ch-x",
          name: "無効",
          studentKana: "ムコウ",
          grade: 1,
          classId: "c1a",
        },
      ],
    };
    expect(ptaDataSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("pta-schema helpers", () => {
  const data = ptaDataSchema.parse(minimalPtaData);

  it("getHouseholdById で世帯を引ける", () => {
    const h = getHouseholdById(data.households, "h1");
    expect(h?.guardianName).toBe("田中 花子");
  });

  it("sortChildrenByKana は五十音順（サ行はタ行より前）", () => {
    const sorted = sortChildrenByKana(data.children);
    expect(sorted.map((c) => c.name)).toEqual(["佐藤 次郎", "田中 太郎"]);
  });

  it("buildChildListRows は児童+世帯の行を返す", () => {
    const rows = buildChildListRows(
      data.children,
      data.households,
      "c1a",
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].child.name).toBe("佐藤 次郎");
    expect(rows[1].child.name).toBe("田中 太郎");
    expect(rows[1].household.id).toBe("h1");
  });

  it("buildGradeGroupTree はクラスを動的に紐づける", () => {
    const tree = buildGradeGroupTree(data.gradeGroups, data.classes);
    expect(tree[0].classes).toHaveLength(2);
    expect(tree[0].classes.map((c) => c.name)).toEqual(["1組", "2組"]);
  });
});
