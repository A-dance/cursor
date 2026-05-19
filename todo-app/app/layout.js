import AppNav from "@/components/AppNav";
import "./globals.css";

export const metadata = {
  title: "Todo App",
  description: "Supabase + Next.js Todo App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
