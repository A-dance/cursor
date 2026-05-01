import { redirect } from "next/navigation";

/**
 * ハイフンなしの誤URL `/tmdbtest` から正規の `/tmdb-test` へ寄せる
 */
export default function TmdbTestTypoRedirectPage() {
  redirect("/tmdb-test");
}
