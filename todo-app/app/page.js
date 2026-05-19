import { Suspense } from "react";
import AuthGate from "@/components/AuthGate";
import SyncStripeAfterCheckout from "@/components/SyncStripeAfterCheckout";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h2>TODO アプリ</h2>
      <Suspense fallback={null}>
        <SyncStripeAfterCheckout />
      </Suspense>
      <AuthGate />
    </main>
  );
}
