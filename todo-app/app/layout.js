import "./globals.css";

export const metadata = {
  title: "Todo App",
  description: "Supabase + Next.js Todo App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
