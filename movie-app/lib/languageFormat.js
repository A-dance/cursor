export function formatOriginalLanguageName(code) {
  const c = String(code || "").toLowerCase().trim();
  if (!c) return "不明";

  const map = {
    en: "英語",
    ko: "韓国語",
    zh: "中国語",
    ja: "日本語",
    fr: "フランス語",
    de: "ドイツ語",
    es: "スペイン語",
    it: "イタリア語",
    pt: "ポルトガル語",
    ru: "ロシア語",
    vi: "ベトナム語",
    th: "タイ語",
    id: "インドネシア語",
    hi: "ヒンディー語",
  };

  return map[c] ?? "その他";
}

/**
 * 学習用途: TMDBのコード（例: ko）と、日本語の言語名を併記
 * @param {string} code
 */
export function formatOriginalLanguageForStudy(code) {
  const c = String(code || "").toLowerCase().trim();
  if (!c) return "不明";

  const name = formatOriginalLanguageName(code);
  if (name === "その他") return `その他（${c}）`;
  return `${name}（${c}）`;
}
