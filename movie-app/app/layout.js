import "./globals.css";

export const metadata = {
  title: "My Movie App",
  description: "TMDBの人気映画をカード形式で表示する映画情報アプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
