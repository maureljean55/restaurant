import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Espace du personnel : rafraîchit la session Supabase (cookies) à chaque requête.
 * Le contrôle d'accès réel est fait dans les pages et par la base (RLS).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const db = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (aEcrire, headers) => {
        for (const { name, value } of aEcrire) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of aEcrire) response.cookies.set(name, value, options);
        for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
      },
    },
  });
  await db.auth.getUser();
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
