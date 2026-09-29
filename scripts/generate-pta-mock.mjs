/**
 * PTA モックデータ（data/pta.json）を生成するワンショットスクリプト。
 * 設計: docs/pta-plan.md の「モックデータの設計」に準拠。
 *
 * 氏名ルール:
 * - 名字は世帯ごとに一意（兄弟は同じ名字）
 * - 名前（下の名前）は児童・保護者を通じて一意（一度使ったら再利用しない）
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "pta.json");

const DISPLAY_FISCAL_YEAR = 2025;

/** 架空の姓プール（世帯数以上を用意） */
const SURNAMES = [
  { name: "青木", kana: "アオキ" },
  { name: "赤井", kana: "アカイ" },
  { name: "浅田", kana: "アサダ" },
  { name: "麻生", kana: "アソウ" },
  { name: "安藤", kana: "アンドウ" },
  { name: "飯田", kana: "イイダ" },
  { name: "池田", kana: "イケダ" },
  { name: "石井", kana: "イシイ" },
  { name: "石川", kana: "イシカワ" },
  { name: "石田", kana: "イシダ" },
  { name: "泉", kana: "イズミ" },
  { name: "市川", kana: "イチカワ" },
  { name: "伊藤", kana: "イトウ" },
  { name: "井上", kana: "イノウエ" },
  { name: "今井", kana: "イマイ" },
  { name: "岩崎", kana: "イワサキ" },
  { name: "岩田", kana: "イワタ" },
  { name: "上田", kana: "ウエダ" },
  { name: "宇野", kana: "ウノ" },
  { name: "江口", kana: "エグチ" },
  { name: "遠藤", kana: "エンドウ" },
  { name: "大石", kana: "オオイシ" },
  { name: "大久保", kana: "オオクボ" },
  { name: "大島", kana: "オオシマ" },
  { name: "大谷", kana: "オオタニ" },
  { name: "大西", kana: "オオニシ" },
  { name: "大野", kana: "オオノ" },
  { name: "岡田", kana: "オカダ" },
  { name: "岡本", kana: "オカモト" },
  { name: "小川", kana: "オガワ" },
  { name: "奥村", kana: "オクムラ" },
  { name: "小野", kana: "オノ" },
  { name: "加藤", kana: "カトウ" },
  { name: "金井", kana: "カナイ" },
  { name: "金子", kana: "カネコ" },
  { name: "川口", kana: "カワグチ" },
  { name: "川崎", kana: "カワサキ" },
  { name: "川村", kana: "カワムラ" },
  { name: "菊地", kana: "キクチ" },
  { name: "北村", kana: "キタムラ" },
  { name: "木下", kana: "キノシタ" },
  { name: "木村", kana: "キムラ" },
  { name: "工藤", kana: "クドウ" },
  { name: "久保", kana: "クボ" },
  { name: "黒田", kana: "クロダ" },
  { name: "小島", kana: "コジマ" },
  { name: "小林", kana: "コバヤシ" },
  { name: "小松", kana: "コマツ" },
  { name: "斎藤", kana: "サイトウ" },
  { name: "坂本", kana: "サカモト" },
  { name: "桜井", kana: "サクライ" },
  { name: "佐々木", kana: "ササキ" },
  { name: "佐藤", kana: "サトウ" },
  { name: "佐野", kana: "サノ" },
  { name: "柴田", kana: "シバタ" },
  { name: "清水", kana: "シミズ" },
  { name: "杉山", kana: "スギヤマ" },
  { name: "鈴木", kana: "スズキ" },
  { name: "瀬戸", kana: "セト" },
  { name: "高木", kana: "タカギ" },
  { name: "高橋", kana: "タカハシ" },
  { name: "高田", kana: "タカダ" },
  { name: "滝沢", kana: "タキザワ" },
  { name: "竹内", kana: "タケウチ" },
  { name: "武田", kana: "タケダ" },
  { name: "田村", kana: "タムラ" },
  { name: "千葉", kana: "チバ" },
  { name: "辻", kana: "ツジ" },
  { name: "土屋", kana: "ツチヤ" },
  { name: "堤", kana: "ツツミ" },
  { name: "角田", kana: "ツノダ" },
  { name: "鶴田", kana: "ツルタ" },
  { name: "手塚", kana: "テヅカ" },
  { name: "寺田", kana: "テラダ" },
  { name: "戸田", kana: "トダ" },
  { name: "中島", kana: "ナカジマ" },
  { name: "中田", kana: "ナカダ" },
  { name: "中西", kana: "ナカニシ" },
  { name: "中野", kana: "ナカノ" },
  { name: "中村", kana: "ナカムラ" },
  { name: "永井", kana: "ナガイ" },
  { name: "長谷川", kana: "ハセガワ" },
  { name: "成田", kana: "ナリタ" },
  { name: "西田", kana: "ニシダ" },
  { name: "西山", kana: "ニシヤマ" },
  { name: "野口", kana: "ノグチ" },
  { name: "野村", kana: "ノムラ" },
  { name: "橋本", kana: "ハシモト" },
  { name: "長谷", kana: "ハセ" },
  { name: "畠山", kana: "ハタケヤマ" },
  { name: "服部", kana: "ハットリ" },
  { name: "浜田", kana: "ハマダ" },
  { name: "早川", kana: "ハヤカワ" },
  { name: "原田", kana: "ハラダ" },
  { name: "平野", kana: "ヒラノ" },
  { name: "福島", kana: "フクシマ" },
  { name: "福田", kana: "フクダ" },
  { name: "藤井", kana: "フジイ" },
  { name: "藤田", kana: "フジタ" },
  { name: "藤原", kana: "フジワラ" },
  { name: "古川", kana: "フルカワ" },
  { name: "星野", kana: "ホシノ" },
  { name: "堀", kana: "ホリ" },
  { name: "本田", kana: "ホンダ" },
  { name: "松井", kana: "マツイ" },
  { name: "松岡", kana: "マツオカ" },
  { name: "松田", kana: "マツダ" },
  { name: "松本", kana: "マツモト" },
  { name: "丸山", kana: "マルヤマ" },
  { name: "三浦", kana: "ミウラ" },
  { name: "水野", kana: "ミズノ" },
  { name: "宮崎", kana: "ミヤザキ" },
  { name: "宮本", kana: "ミヤモト" },
  { name: "村上", kana: "ムラカミ" },
  { name: "村田", kana: "ムラタ" },
  { name: "望月", kana: "モチヅキ" },
  { name: "森", kana: "モリ" },
  { name: "森本", kana: "モリモト" },
  { name: "矢野", kana: "ヤノ" },
  { name: "山口", kana: "ヤマグチ" },
  { name: "山崎", kana: "ヤマザキ" },
  { name: "山田", kana: "ヤマダ" },
  { name: "山本", kana: "ヤマモト" },
  { name: "横山", kana: "ヨコヤマ" },
  { name: "吉川", kana: "ヨシカワ" },
  { name: "吉田", kana: "ヨシダ" },
  { name: "吉村", kana: "ヨシムラ" },
  { name: "米田", kana: "ヨネダ" },
  { name: "若林", kana: "ワカバヤシ" },
  { name: "渡辺", kana: "ワタナベ" },
  { name: "和田", kana: "ワダ" },
  { name: "新井", kana: "アライ" },
  { name: "荒木", kana: "アラキ" },
  { name: "有馬", kana: "アリマ" },
  { name: "飯塚", kana: "イイヅカ" },
  { name: "五十嵐", kana: "イガラシ" },
  { name: "内田", kana: "ウチダ" },
  { name: "内藤", kana: "ナイトウ" },
  { name: "梅田", kana: "ウメダ" },
  { name: "江藤", kana: "エトウ" },
  { name: "片岡", kana: "カタオカ" },
  { name: "菅原", kana: "スガワラ" },
  { name: "栗原", kana: "クリハラ" },
  { name: "黒木", kana: "クロキ" },
  { name: "河野", kana: "コウノ" },
  { name: "近藤", kana: "コンドウ" },
  { name: "斉藤", kana: "サイトウニ" },
  { name: "酒井", kana: "サカイ" },
  { name: "篠原", kana: "シノハラ" },
  { name: "白井", kana: "シライ" },
  { name: "菅野", kana: "カンノ" },
  { name: "田口", kana: "タグチ" },
  { name: "田辺", kana: "タナベ" },
  { name: "谷口", kana: "タニグチ" },
  { name: "徳田", kana: "トクダ" },
  { name: "中尾", kana: "ナカオ" },
  { name: "永田", kana: "ナガタ" },
  { name: "西岡", kana: "ニシオカ" },
  { name: "沼田", kana: "ヌマタ" },
  { name: "野田", kana: "ノダ" },
  { name: "萩原", kana: "ハギワラ" },
  { name: "浜崎", kana: "ハマサキ" },
  { name: "林", kana: "ハヤシ" },
  { name: "原", kana: "ハラ" },
  { name: "東", kana: "ヒガシ" },
  { name: "平田", kana: "ヒラタ" },
  { name: "広瀬", kana: "ヒロセ" },
  { name: "福井", kana: "フクイ" },
  { name: "藤本", kana: "フジモト" },
  { name: "堀内", kana: "ホリウチ" },
  { name: "前田", kana: "マエダ" },
  { name: "松浦", kana: "マツウラ" },
  { name: "三木", kana: "ミキ" },
  { name: "南", kana: "ミナミ" },
  { name: "宮田", kana: "ミヤタ" },
  { name: "森川", kana: "モリカワ" },
  { name: "安田", kana: "ヤスダ" },
  { name: "山内", kana: "ヤマウチ" },
  { name: "山下", kana: "ヤマシタ" },
  { name: "横田", kana: "ヨコタ" },
  { name: "吉岡", kana: "ヨシオカ" },
  { name: "米沢", kana: "ヨネザワ" },
  { name: "渡部", kana: "ワタナベニ" },
];

/** 児童・保護者共用の下の名前プール（性別混合・一意消費） */
const GIVEN_NAMES = [
  { name: "蒼", kana: "アオイ", gender: "boy" },
  { name: "陽翔", kana: "ハルト", gender: "boy" },
  { name: "連", kana: "レン", gender: "boy" },
  { name: "樹", kana: "イツキ", gender: "boy" },
  { name: "湊", kana: "ミナト", gender: "boy" },
  { name: "朝陽", kana: "アサヒ", gender: "boy" },
  { name: "悠真", kana: "ユウマ", gender: "boy" },
  { name: "陽大", kana: "ヒナタ", gender: "boy" },
  { name: "新", kana: "アラタ", gender: "boy" },
  { name: "颯", kana: "ハヤテ", gender: "boy" },
  { name: "大和", kana: "ヤマト", gender: "boy" },
  { name: "律", kana: "リツ", gender: "boy" },
  { name: "奏太", kana: "ソウタ", gender: "boy" },
  { name: "瑛太", kana: "エイタ", gender: "boy" },
  { name: "凱", kana: "ガイ", gender: "boy" },
  { name: "陸", kana: "リク", gender: "boy" },
  { name: "碧", kana: "アオ", gender: "boy" },
  { name: "橙", kana: "ダイダイ", gender: "boy" },
  { name: "晴", kana: "ハル", gender: "boy" },
  { name: "迅", kana: "ジン", gender: "boy" },
  { name: "翼", kana: "ツバサ", gender: "boy" },
  { name: "海斗", kana: "カイト", gender: "boy" },
  { name: "涼介", kana: "リョウスケ", gender: "boy" },
  { name: "拓海", kana: "タクミ", gender: "boy" },
  { name: "健", kana: "ケン", gender: "boy" },
  { name: "誠", kana: "マコト", gender: "boy" },
  { name: "翔", kana: "ショウ", gender: "boy" },
  { name: "大智", kana: "ダイチ", gender: "boy" },
  { name: "智也", kana: "トモヤ", gender: "boy" },
  { name: "直樹", kana: "ナオキ", gender: "boy" },
  { name: "和也", kana: "カズヤ", gender: "boy" },
  { name: "亮", kana: "リョウ", gender: "boy" },
  { name: "匠", kana: "タクミニ", gender: "boy" },
  { name: "哲也", kana: "テツヤ", gender: "boy" },
  { name: "剛", kana: "ツヨシ", gender: "boy" },
  { name: "俊介", kana: "シュンスケ", gender: "boy" },
  { name: "啓太", kana: "ケイタ", gender: "boy" },
  { name: "裕也", kana: "ユウヤ", gender: "boy" },
  { name: "駿", kana: "シュン", gender: "boy" },
  { name: "航", kana: "ワタル", gender: "boy" },
  { name: "凌", kana: "リョウニ", gender: "boy" },
  { name: "颯真", kana: "ソウマ", gender: "boy" },
  { name: "永遠", kana: "トワ", gender: "boy" },
  { name: "煌", kana: "コウ", gender: "boy" },
  { name: "琉生", kana: "ルイ", gender: "boy" },
  { name: "結人", kana: "ユイト", gender: "boy" },
  { name: "春樹", kana: "ハルキ", gender: "boy" },
  { name: "優斗", kana: "ユウト", gender: "boy" },
  { name: "一真", kana: "カズマ", gender: "boy" },
  { name: "虎太郎", kana: "コタロウ", gender: "boy" },
  { name: "龍之介", kana: "リュウノスケ", gender: "boy" },
  { name: "北斗", kana: "ホクト", gender: "boy" },
  { name: "蒼介", kana: "ソウスケ", gender: "boy" },
  { name: "伊織", kana: "イオリ", gender: "boy" },
  { name: "廉", kana: "レンニ", gender: "boy" },
  { name: "岳", kana: "ガク", gender: "boy" },
  { name: "颯汰", kana: "ソウタニ", gender: "boy" },
  { name: "旭", kana: "アサヒニ", gender: "boy" },
  { name: "慶", kana: "ケイ", gender: "boy" },
  { name: "智樹", kana: "トモキ", gender: "boy" },
  { name: "将也", kana: "マサヤ", gender: "boy" },
  { name: "悠希", kana: "ユウキ", gender: "boy" },
  { name: "怜", kana: "レイ", gender: "boy" },
  { name: "颯人", kana: "ハヤト", gender: "boy" },
  { name: "陽向", kana: "ヒナタニ", gender: "boy" },
  { name: "結翔", kana: "ユイトニ", gender: "boy" },
  { name: "蒼大", kana: "ソウダイ", gender: "boy" },
  { name: "璃子", kana: "リコ", gender: "girl" },
  { name: "結菜", kana: "ユナ", gender: "girl" },
  { name: "心春", kana: "コハル", gender: "girl" },
  { name: "咲良", kana: "サクラ", gender: "girl" },
  { name: "陽葵", kana: "ヒマリ", gender: "girl" },
  { name: "紬", kana: "ツムギ", gender: "girl" },
  { name: "芽依", kana: "メイ", gender: "girl" },
  { name: "澪", kana: "ミオ", gender: "girl" },
  { name: "彩葉", kana: "イロハ", gender: "girl" },
  { name: "琴音", kana: "コトネ", gender: "girl" },
  { name: "美月", kana: "ミツキ", gender: "girl" },
  { name: "優奈", kana: "ユウナ", gender: "girl" },
  { name: "莉子", kana: "リコニ", gender: "girl" },
  { name: "椛", kana: "モミジ", gender: "girl" },
  { name: "杏", kana: "アン", gender: "girl" },
  { name: "桜", kana: "サクラニ", gender: "girl" },
  { name: "穂香", kana: "ホノカ", gender: "girl" },
  { name: "千晴", kana: "チハル", gender: "girl" },
  { name: "夏帆", kana: "カホ", gender: "girl" },
  { name: "真央", kana: "マオ", gender: "girl" },
  { name: "玲奈", kana: "レナ", gender: "girl" },
  { name: "彩花", kana: "アヤカ", gender: "girl" },
  { name: "恵", kana: "メグミ", gender: "girl" },
  { name: "由紀", kana: "ユキ", gender: "girl" },
  { name: "麻衣", kana: "マイ", gender: "girl" },
  { name: "香織", kana: "カオリ", gender: "girl" },
  { name: "奈々", kana: "ナナ", gender: "girl" },
  { name: "美穂", kana: "ミホ", gender: "girl" },
  { name: "亜美", kana: "アミ", gender: "girl" },
  { name: "智子", kana: "トモコ", gender: "girl" },
  { name: "裕子", kana: "ユウコ", gender: "girl" },
  { name: "明美", kana: "アケミ", gender: "girl" },
  { name: "佳奈", kana: "カナ", gender: "girl" },
  { name: "里奈", kana: "リナ", gender: "girl" },
  { name: "沙織", kana: "サオリ", gender: "girl" },
  { name: "美香", kana: "ミカ", gender: "girl" },
  { name: "恵子", kana: "ケイコ", gender: "girl" },
  { name: "由美", kana: "ユミ", gender: "girl" },
  { name: "早紀", kana: "サキ", gender: "girl" },
  { name: "愛", kana: "アイ", gender: "girl" },
  { name: "瞳", kana: "ヒトミ", gender: "girl" },
  { name: "奈緒", kana: "ナオ", gender: "girl" },
  { name: "瑞穂", kana: "ミズホ", gender: "girl" },
  { name: "茜", kana: "アカネ", gender: "girl" },
  { name: "柚葉", kana: "ユズハ", gender: "girl" },
  { name: "陽菜", kana: "ヒナ", gender: "girl" },
  { name: "美桜", kana: "ミオニ", gender: "girl" },
  { name: "結衣", kana: "ユイ", gender: "girl" },
  { name: "凛", kana: "リン", gender: "girl" },
  { name: "葵", kana: "アオイニ", gender: "girl" },
  { name: "花", kana: "ハナ", gender: "girl" },
  { name: "詩", kana: "ウタ", gender: "girl" },
  { name: "希", kana: "ノゾミ", gender: "girl" },
  { name: "和", kana: "ナギ", gender: "girl" },
  { name: "遥", kana: "ハルカ", gender: "girl" },
  { name: "奏", kana: "カナデ", gender: "girl" },
  { name: "虹", kana: "ニジ", gender: "girl" },
  { name: "雪", kana: "ユキニ", gender: "girl" },
  { name: "月", kana: "ツキ", gender: "girl" },
  { name: "星", kana: "ホシ", gender: "girl" },
  { name: "波", kana: "ナミ", gender: "girl" },
  { name: "葉月", kana: "ハヅキ", gender: "girl" },
  { name: "美羽", kana: "ミウ", gender: "girl" },
  { name: "心結", kana: "ミユ", gender: "girl" },
  { name: "愛莉", kana: "アイリ", gender: "girl" },
  { name: "莉緒", kana: "リオ", gender: "girl" },
  { name: "咲希", kana: "サキニ", gender: "girl" },
  { name: "琴葉", kana: "コトハ", gender: "girl" },
  { name: "彩乃", kana: "アヤノ", gender: "girl" },
  { name: "友香", kana: "トモカ", gender: "girl" },
  { name: "菜々子", kana: "ナナコ", gender: "girl" },
  { name: "千夏", kana: "チナツ", gender: "girl" },
  { name: "若葉", kana: "ワカバ", gender: "girl" },
  { name: "百合", kana: "ユリ", gender: "girl" },
  { name: "楓", kana: "カエデ", gender: "girl" },
  { name: "一花", kana: "イチカ", gender: "girl" },
  { name: "二葉", kana: "フタバ", gender: "girl" },
  { name: "三咲", kana: "ミサキ", gender: "girl" },
  { name: "四葉", kana: "ヨツバ", gender: "girl" },
  { name: "五郎", kana: "ゴロウ", gender: "boy" },
  { name: "六花", kana: "リッカ", gender: "girl" },
  { name: "七海", kana: "ナナミ", gender: "girl" },
  { name: "八雲", kana: "ヤクモ", gender: "boy" },
  { name: "九条", kana: "クジョウ", gender: "boy" },
  { name: "十郎", kana: "ジュウロウ", gender: "boy" },
  { name: "一郎", kana: "イチロウ", gender: "adult" },
  { name: "次郎", kana: "ジロウ", gender: "adult" },
  { name: "三郎", kana: "サブロウ", gender: "adult" },
  { name: "花子", kana: "ハナコ", gender: "adult" },
  { name: "太郎", kana: "タロウ", gender: "adult" },
  { name: "正男", kana: "マサオ", gender: "adult" },
  { name: "和子", kana: "カズコ", gender: "adult" },
  { name: "義男", kana: "ヨシオ", gender: "adult" },
  { name: "節子", kana: "セツコ", gender: "adult" },
  { name: "清", kana: "キヨシ", gender: "adult" },
  { name: "豊", kana: "ユタカ", gender: "adult" },
  { name: "茂", kana: "シゲル", gender: "adult" },
  { name: "幸子", kana: "サチコ", gender: "adult" },
  { name: "紀子", kana: "ノリコ", gender: "adult" },
  { name: "洋子", kana: "ヨウコ", gender: "adult" },
  { name: "京子", kana: "キョウコ", gender: "adult" },
  { name: "博", kana: "ヒロシ", gender: "adult" },
  { name: "進", kana: "ススム", gender: "adult" },
  { name: "修", kana: "オサム", gender: "adult" },
  { name: "勉", kana: "ツトム", gender: "adult" },
  { name: "聡", kana: "サトシ", gender: "adult" },
  { name: "学", kana: "マナブ", gender: "adult" },
  { name: "達也", kana: "タツヤ", gender: "adult" },
  { name: "康弘", kana: "ヤスヒロ", gender: "adult" },
  { name: "宏美", kana: "ヒロミ", gender: "adult" },
  { name: "典子", kana: "ノリコニ", gender: "adult" },
  { name: "雅子", kana: "マサコ", gender: "adult" },
  { name: "文子", kana: "フミコ", gender: "adult" },
  { name: "久美子", kana: "クミコ", gender: "adult" },
  { name: "真理", kana: "マリ", gender: "adult" },
  { name: "恵美", kana: "エミ", gender: "adult" },
  { name: "尚子", kana: "ナオコ", gender: "adult" },
  { name: "敦", kana: "アツシ", gender: "adult" },
  { name: "浩二", kana: "コウジ", gender: "adult" },
  { name: "健一", kana: "ケンイチ", gender: "adult" },
  { name: "秀樹", kana: "ヒデキ", gender: "adult" },
  { name: "貴子", kana: "タカコ", gender: "adult" },
  { name: "洋平", kana: "ヨウヘイ", gender: "adult" },
  { name: "佳代", kana: "カヨ", gender: "adult" },
  { name: "絵里", kana: "エリ", gender: "adult" },
  { name: "奈津子", kana: "ナツコ", gender: "adult" },
  { name: "伸一", kana: "シンイチ", gender: "adult" },
  { name: "光男", kana: "ミツオ", gender: "adult" },
  { name: "秋子", kana: "アキコ", gender: "adult" },
  { name: "春子", kana: "ハルコ", gender: "adult" },
  { name: "夏子", kana: "ナツコニ", gender: "adult" },
  { name: "冬子", kana: "フユコ", gender: "adult" },
  { name: "昭", kana: "アキラ", gender: "adult" },
  { name: "武", kana: "タケシ", gender: "adult" },
  { name: "実", kana: "ミノル", gender: "adult" },
  { name: "勝", kana: "マサル", gender: "adult" },
  { name: "勇", kana: "イサム", gender: "adult" },
  { name: "正", kana: "タダシ", gender: "adult" },
  { name: "純", kana: "ジュン", gender: "adult" },
  { name: "亮子", kana: "リョウコ", gender: "adult" },
  { name: "恵理", kana: "エリニ", gender: "adult" },
  { name: "智美", kana: "トモミ", gender: "adult" },
  { name: "恵理子", kana: "エリコ", gender: "adult" },
  { name: "祥子", kana: "ショウコ", gender: "adult" },
  { name: "陽子", kana: "ヨウコニ", gender: "adult" },
  { name: "久美", kana: "クミ", gender: "adult" },
  { name: "直美", kana: "ナオミ", gender: "adult" },
  { name: "みどり", kana: "ミドリ", gender: "adult" },
  { name: "あゆみ", kana: "アユミ", gender: "adult" },
  { name: "かおり", kana: "カオリニ", gender: "adult" },
  { name: "ゆかり", kana: "ユカリ", gender: "adult" },
  { name: "みどり子", kana: "ミドリコ", gender: "adult" },
  { name: "剛志", kana: "ツヨシニ", gender: "adult" },
  { name: "大輔", kana: "ダイスケ", gender: "adult" },
  { name: "健太", kana: "ケンタ", gender: "adult" },
  { name: "翔太", kana: "ショウタ", gender: "adult" },
  { name: "美咲", kana: "ミサキニ", gender: "adult" },
];

// kana の重複を排除（表示カナが一意になるよう）
function assertUniqueKana(list, label) {
  const seen = new Set();
  for (const item of list) {
    if (seen.has(item.kana)) {
      throw new Error(`${label} のカナ重複: ${item.kana} (${item.name})`);
    }
    seen.add(item.kana);
  }
}
assertUniqueKana(SURNAMES, "SURNAMES");
assertUniqueKana(GIVEN_NAMES, "GIVEN_NAMES");

let idSeq = 0;
function nextId(prefix) {
  idSeq += 1;
  return `${prefix}${idSeq}`;
}

/** 名字・名前の一意割当 */
class NameAllocator {
  constructor() {
    this.surnameQueue = [...SURNAMES];
    this.givenByGender = {
      boy: GIVEN_NAMES.filter((g) => g.gender === "boy"),
      girl: GIVEN_NAMES.filter((g) => g.gender === "girl"),
      adult: GIVEN_NAMES.filter((g) => g.gender === "adult"),
      any: [...GIVEN_NAMES],
    };
    this.usedGivenNames = new Set();
    this.usedGivenKana = new Set();
  }

  takeSurname() {
    const surname = this.surnameQueue.shift();
    if (!surname) {
      throw new Error("名字プールが不足しています。SURNAMES を増やしてください。");
    }
    return surname;
  }

  takeGiven(preferredGender) {
    const order =
      preferredGender === "boy"
        ? ["boy", "any"]
        : preferredGender === "girl"
          ? ["girl", "any"]
          : preferredGender === "adult"
            ? ["adult", "any"]
            : ["any"];

    for (const key of order) {
      const pool = this.givenByGender[key];
      while (pool.length > 0) {
        const given = pool.shift();
        if (this.usedGivenNames.has(given.name) || this.usedGivenKana.has(given.kana)) {
          continue;
        }
        this.usedGivenNames.add(given.name);
        this.usedGivenKana.add(given.kana);
        // 他プールからも同名を除去
        for (const gKey of Object.keys(this.givenByGender)) {
          this.givenByGender[gKey] = this.givenByGender[gKey].filter(
            (g) => g.name !== given.name && g.kana !== given.kana,
          );
        }
        return given;
      }
    }
    throw new Error("名前プールが不足しています。GIVEN_NAMES を増やしてください。");
  }
}

const names = new NameAllocator();

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

/**
 * 世帯と児童を1件追加する。
 * surname を渡すと兄弟世帯用に共有名字を使う。未指定なら新規割当。
 */
function addHouseholdWithChildren(opts) {
  const surname = opts.surname ?? names.takeSurname();
  const guardianGiven = opts.guardianGiven ?? names.takeGiven("adult");
  const householdId = nextId("h");
  households.push({
    id: householdId,
    guardianName: `${surname.name} ${guardianGiven.name}`,
    membershipStatus: opts.membershipStatus ?? "member",
    officerExempt: opts.officerExempt ?? false,
    exemptReason: opts.exemptReason ?? "",
    officerHistory: opts.officerHistory ?? [],
    householdMemo: opts.householdMemo ?? "",
  });
  for (const child of opts.childrenSpecs) {
    const given = child.given ?? names.takeGiven(child.gender ?? "any");
    children.push({
      id: nextId("ch"),
      householdId,
      name: `${surname.name} ${given.name}`,
      studentKana: `${surname.kana} ${given.kana}`,
      grade: child.grade,
      classId: child.classId,
      ...(child.exchangeClass ? { exchangeClass: child.exchangeClass } : {}),
    });
  }
  return { surname, householdId };
}

// --- 意図的なバッジ・ビジネスルール用の世帯 ---

// 兄弟世帯（3人・学年がばらける）+ PTA 役員経験
addHouseholdWithChildren({
  householdMemo: "LINE で連絡可",
  officerHistory: [
    { fiscalYear: 2023, division: "PTA", role: "会長", note: "" },
  ],
  childrenSpecs: [
    { gender: "boy", grade: 4, classId: "c42" },
    { gender: "boy", grade: 1, classId: "c11" },
    { gender: "boy", grade: 1, classId: "c12" },
  ],
});

// 現役員世帯（表示年度 2025）
addHouseholdWithChildren({
  officerHistory: [
    {
      fiscalYear: 2025,
      division: "PTA",
      role: "会計",
      note: "今年度担当",
    },
  ],
  childrenSpecs: [{ gender: "girl", grade: 3, classId: "c31" }],
});

// 会員かつ役員免除（PTA本部 + 育成会地区会長）
addHouseholdWithChildren({
  officerExempt: true,
  exemptReason: "前年度本部役員のため",
  officerHistory: [
    {
      fiscalYear: 2024,
      division: "PTA",
      role: "本部役員（副会長）",
      note: "",
    },
    {
      fiscalYear: 2022,
      division: "育成会",
      role: "地区会長",
      note: "2年間担当",
    },
  ],
  childrenSpecs: [{ gender: "boy", grade: 2, classId: "c21" }],
});

// 非会員世帯
addHouseholdWithChildren({
  membershipStatus: "non_member",
  childrenSpecs: [{ gender: "boy", grade: 5, classId: "c53" }],
});

// 双子世帯（同クラス）
addHouseholdWithChildren({
  childrenSpecs: [
    { gender: "boy", grade: 2, classId: "c23" },
    { gender: "girl", grade: 2, classId: "c23" },
  ],
});

// 特別学級 + 交流学級 + 役員経験
addHouseholdWithChildren({
  officerHistory: [
    {
      fiscalYear: 2023,
      division: "PTA",
      role: "厚生委員長",
      note: "",
    },
  ],
  childrenSpecs: [
    {
      gender: "boy",
      grade: 3,
      classId: "cs1",
      exchangeClass: "3年2組（交流）",
    },
  ],
});

/** 通常学年の各クラスに 3〜4 人（既存の意図的世帯と重複しないようスキップ） */
const reservedSlots = new Set([
  "c42", // 兄弟の4年生
  "c11", // 兄弟
  "c12", // 兄弟
  "c31", // 現役員の子
  "c21", // 免除世帯の子
  "c53", // 非会員の子
  "c23", // 双子（2人分は後で枠を減らす）
]);

const reservedExtraCount = {
  c42: 1,
  c11: 1,
  c12: 1,
  c31: 1,
  c21: 1,
  c53: 1,
  c23: 2,
};

for (let g = 1; g <= 6; g += 1) {
  const classCount = g <= 3 ? 4 : 5;
  for (let c = 1; c <= classCount; c += 1) {
    const classId = `c${g}${c}`;
    const baseCount = (g + c) % 2 === 0 ? 4 : 3;
    const already = reservedExtraCount[classId] ?? 0;
    const count = Math.max(0, baseCount - already);
    for (let i = 0; i < count; i += 1) {
      const isBoy = (g + c + i) % 2 === 0;
      const history =
        households.length === 20
          ? [
              {
                fiscalYear: 2022,
                division: "PTA",
                role: "広報委員長",
                note: "",
              },
            ]
          : households.length === 35
            ? [
                {
                  fiscalYear: 2021,
                  division: "育成会",
                  role: "本部役員",
                  note: "2年間担当",
                },
              ]
            : households.length === 50
              ? [
                  {
                    fiscalYear: 2022,
                    division: "PTA",
                    role: "本部役員（会計）",
                    note: "",
                  },
                ]
              : households.length === 65
                ? [
                    {
                      fiscalYear: 2023,
                      division: "育成会",
                      role: "地区会長",
                      note: "",
                    },
                  ]
                : households.length === 80
                  ? [
                      {
                        fiscalYear: 2024,
                        division: "PTA",
                        role: "副会長",
                        note: "",
                      },
                      {
                        fiscalYear: 2023,
                        division: "PTA",
                        role: "本部役員（書記）",
                        note: "",
                      },
                    ]
                  : [];
      addHouseholdWithChildren({
        officerHistory: history,
        childrenSpecs: [
          {
            gender: isBoy ? "boy" : "girl",
            grade: g,
            classId,
          },
        ],
      });
    }
  }
}

/** 特別学級：5組 × 6人（cs1 は既に1人いるので埋める） */
for (let c = 1; c <= 5; c += 1) {
  const classId = `cs${c}`;
  const already = classId === "cs1" ? 1 : 0;
  for (let i = already; i < 6; i += 1) {
    const isBoy = (c + i) % 2 === 0;
    const nominalGrade = ((c + i - 1) % 6) + 1;
    const hasExchange = i === 0 || i === 3;
    addHouseholdWithChildren({
      membershipStatus: i === 5 && c === 5 ? "non_member" : "member",
      officerExempt: c === 2 && i === 1,
      exemptReason: c === 2 && i === 1 ? "家庭の事情" : "",
      childrenSpecs: [
        {
          gender: isBoy ? "boy" : "girl",
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

// 一意性の検証
const surnameCounts = new Map();
const givenCounts = new Map();
for (const h of households) {
  const [sur, given] = h.guardianName.split(" ");
  surnameCounts.set(sur, (surnameCounts.get(sur) ?? 0) + 1);
  givenCounts.set(given, (givenCounts.get(given) ?? 0) + 1);
}
for (const ch of children) {
  const [sur, given] = ch.name.split(" ");
  // 兄弟は同じ名字 OK。名字の世帯数は別途
  givenCounts.set(given, (givenCounts.get(given) ?? 0) + 1);
  void sur;
}
const dupGiven = [...givenCounts.entries()].filter(([, n]) => n > 1);
if (dupGiven.length > 0) {
  throw new Error(`下の名前が重複しています: ${dupGiven.map(([n]) => n).join(", ")}`);
}
if ([...surnameCounts.values()].some((n) => n > 1)) {
  throw new Error("名字が世帯間で重複しています");
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
console.log(
  `unused surnames: ${names.surnameQueue.length}, unused given names: ${names.givenByGender.any.length}`,
);
void reservedSlots;
