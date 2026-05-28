/**
 * PTA モックデータ（data/pta.json）を生成するワンショットスクリプト。
 * 設計: docs/pta-plan.md の「モックデータの設計」に準拠。
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "pta.json");

const DISPLAY_FISCAL_YEAR = 2025;

// 架空の姓・名プール（児童・保護者名の組み立て用）
const SURNAMES = [
  { name: "田中", kana: "タナカ" },
  { name: "佐藤", kana: "サトウ" },
  { name: "鈴木", kana: "スズキ" },
  { name: "高橋", kana: "タカハシ" },
  { name: "伊藤", kana: "イトウ" },
  { name: "渡辺", kana: "ワタナベ" },
  { name: "山本", kana: "ヤマモト" },
  { name: "中村", kana: "ナカムラ" },
  { name: "小林", kana: "コバヤシ" },
  { name: "加藤", kana: "カトウ" },
  { name: "吉田", kana: "ヨシダ" },
  { name: "山田", kana: "ヤマダ" },
  { name: "松本", kana: "マツモト" },
  { name: "井上", kana: "イノウエ" },
  { name: "木村", kana: "キムラ" },
];

const GIVEN_BOYS = [
  { name: "太郎", kana: "タロウ" },
  { name: "健太", kana: "ケンタ" },
  { name: "翔太", kana: "ショウタ" },
  { name: "大輔", kana: "ダイスケ" },
  { name: "蓮", kana: "レン" },
  { name: "悠斗", kana: "ユウト" },
  { name: "陽向", kana: "ヒナタ" },
  { name: "颯太", kana: "ソウタ" },
];

const GIVEN_GIRLS = [
  { name: "花子", kana: "ハナコ" },
  { name: "美咲", kana: "ミサキ" },
  { name: "結衣", kana: "ユイ" },
  { name: "さくら", kana: "サクラ" },
  { name: "陽菜", kana: "ヒナ" },
  { name: "凛", kana: "リン" },
  { name: "葵", kana: "アオイ" },
  { name: "心春", kana: "コハル" },
];

let idSeq = 0;
/** 一意 ID を発行する */
function nextId(prefix) {
  idSeq += 1;
  return `${prefix}${idSeq}`;
}

/** 学年グループ（1〜6年 + 特別学級） */
const gradeGroups = [];
for (let g = 1; g <= 6; g += 1) {
  gradeGroups.push({
    id: `g${g}`,
    name: `${g}年`,
    kind: "grade",
    sortOrder: g,
  });
}
gradeGroups.push({
  id: "gSpecial",
  name: "特別学級",
  kind: "special",
  sortOrder: 7,
});

/** クラス一覧（1〜3年は4組、4〜6年は5組、特別学級は5組） */
const classes = [];
for (let g = 1; g <= 6; g += 1) {
  const classCount = g <= 3 ? 4 : 5;
  for (let c = 1; c <= classCount; c += 1) {
    classes.push({
      id: `c${g}${c}`,
      gradeGroupId: `g${g}`,
      name: `${c}組`,
      sortOrder: c,
    });
  }
}
for (let c = 1; c <= 5; c += 1) {
  classes.push({
    id: `cs${c}`,
    gradeGroupId: "gSpecial",
    name: `${c}組`,
    sortOrder: c,
  });
}

const households = [];
const children = [];

let nameIndex = 0;

/** 次の架空氏名を順番に取る */
function pickName(isBoy) {
  const surname = SURNAMES[nameIndex % SURNAMES.length];
  const givenPool = isBoy ? GIVEN_BOYS : GIVEN_GIRLS;
  const given = givenPool[Math.floor(nameIndex / SURNAMES.length) % givenPool.length];
  nameIndex += 1;
  return {
    full: `${surname.name} ${given.name}`,
    kana: `${surname.kana} ${given.kana}`,
    surname: surname.name,
    given: given.name,
  };
}

/**
 * 世帯と児童を1件追加する
 * @param {object} opts - 世帯・児童の属性
 */
function addHouseholdWithChildren(opts) {
  const householdId = nextId("h");
  households.push({
    id: householdId,
    guardianName: opts.guardianName,
    membershipStatus: opts.membershipStatus ?? "member",
    officerExempt: opts.officerExempt ?? false,
    exemptReason: opts.exemptReason ?? "",
    officerHistory: opts.officerHistory ?? [],
    householdMemo: opts.householdMemo ?? "",
  });
  for (const child of opts.childrenSpecs) {
    children.push({
      id: nextId("ch"),
      householdId,
      name: child.name,
      studentKana: child.studentKana,
      grade: child.grade,
      classId: child.classId,
      ...(child.exchangeClass ? { exchangeClass: child.exchangeClass } : {}),
    });
  }
}

// --- 意図的なバッジ・ビジネスルール用の世帯（設計書の分散パターン） ---

// 兄弟世帯（3人・学年がばらける）
addHouseholdWithChildren({
  guardianName: "田中 花子",
  membershipStatus: "member",
  householdMemo: "LINE で連絡可",
  childrenSpecs: [
    {
      name: "田中 太郎",
      studentKana: "タナカ タロウ",
      grade: 4,
      classId: "c42",
    },
    {
      name: "田中 次郎",
      studentKana: "タナカ ジロウ",
      grade: 1,
      classId: "c11",
    },
    {
      name: "田中 三郎",
      studentKana: "タナカ サブロウ",
      grade: 1,
      classId: "c12",
    },
  ],
});

// 現役員世帯（表示年度 2025 の役員経験あり）
addHouseholdWithChildren({
  guardianName: "佐藤 一郎",
  membershipStatus: "member",
  officerHistory: [{ fiscalYear: 2025, role: "会計", note: "今年度担当" }],
  childrenSpecs: [
    {
      name: "佐藤 美咲",
      studentKana: "サトウ ミサキ",
      grade: 3,
      classId: "c31",
    },
  ],
});

// 会員かつ役員免除（理由あり・バッジに理由は出さない設計）
addHouseholdWithChildren({
  guardianName: "鈴木 恵子",
  membershipStatus: "member",
  officerExempt: true,
  exemptReason: "前年度本部役員のため",
  childrenSpecs: [
    {
      name: "鈴木 健太",
      studentKana: "スズキ ケンタ",
      grade: 2,
      classId: "c21",
    },
  ],
});

// 非会員世帯
addHouseholdWithChildren({
  guardianName: "高橋 誠",
  membershipStatus: "non_member",
  childrenSpecs: [
    {
      name: "高橋 翔太",
      studentKana: "タカハシ ショウタ",
      grade: 5,
      classId: "c53",
    },
  ],
});

// 双子世帯（同クラス・兄弟学年バッジは出ない）
addHouseholdWithChildren({
  guardianName: "伊藤 由美",
  membershipStatus: "member",
  childrenSpecs: [
    {
      name: "伊藤 蓮",
      studentKana: "イトウ レン",
      grade: 2,
      classId: "c23",
    },
    {
      name: "伊藤 葵",
      studentKana: "イトウ アオイ",
      grade: 2,
      classId: "c23",
    },
  ],
});

// 特別学級 + 交流学級あり
addHouseholdWithChildren({
  guardianName: "渡辺 直樹",
  membershipStatus: "member",
  childrenSpecs: [
    {
      name: "渡辺 悠斗",
      studentKana: "ワタナベ ユウト",
      grade: 3,
      classId: "cs1",
      exchangeClass: "3年2組（交流）",
    },
  ],
});

/** 通常学年の各クラスに 3〜4 人の児童を追加する */
for (let g = 1; g <= 6; g += 1) {
  const classCount = g <= 3 ? 4 : 5;
  for (let c = 1; c <= classCount; c += 1) {
    const classId = `c${g}${c}`;
    const count = (g + c) % 2 === 0 ? 4 : 3;
    for (let i = 0; i < count; i += 1) {
      const isBoy = (g + c + i) % 2 === 0;
      const person = pickName(isBoy);
      const guardianGiven = isBoy ? "一郎" : "花子";
      const guardianKana = isBoy ? "イチロウ" : "ハナコ";
      addHouseholdWithChildren({
        guardianName: `${person.surname} ${guardianGiven}`,
        membershipStatus: "member",
        childrenSpecs: [
          {
            name: person.full,
            studentKana: person.kana,
            grade: g,
            classId,
          },
        ],
      });
      void guardianKana;
    }
  }
}

/** 特別学級：5組 × 6人 */
for (let c = 1; c <= 5; c += 1) {
  const classId = `cs${c}`;
  for (let i = 0; i < 6; i += 1) {
    const isBoy = (c + i) % 2 === 0;
    const person = pickName(isBoy);
    const nominalGrade = ((c + i - 1) % 6) + 1;
    const hasExchange = i === 0 || i === 3;
    addHouseholdWithChildren({
      guardianName: `${person.surname} ${isBoy ? "健" : "美香"}`,
      membershipStatus: i === 5 && c === 5 ? "non_member" : "member",
      officerExempt: c === 2 && i === 1,
      exemptReason: c === 2 && i === 1 ? "家庭の事情" : "",
      childrenSpecs: [
        {
          name: person.full,
          studentKana: person.kana,
          grade: nominalGrade,
          classId,
          ...(hasExchange
            ? { exchangeClass: `${nominalGrade}年${c}組（交流）` }
            : {}),
        },
      ],
    });
  }
}

const ptaData = {
  settings: {
    organizationName: "さくら市立青葉小学校 PTA",
    displayFiscalYear: DISPLAY_FISCAL_YEAR,
  },
  gradeGroups,
  classes,
  households,
  children,
};

writeFileSync(OUT_PATH, `${JSON.stringify(ptaData, null, 2)}\n`, "utf8");

console.log(`Wrote ${OUT_PATH}`);
console.log(
  `gradeGroups: ${gradeGroups.length}, classes: ${classes.length}, households: ${households.length}, children: ${children.length}`,
);
