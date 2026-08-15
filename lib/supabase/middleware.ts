import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseUrl || !supabaseAnonKey) return response;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
  }});
  const { data: { user } } = await supabase.auth.getUser();
  if (request.nextUrl.pathname.startsWith("/admin") && !user) { const url = request.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", request.nextUrl.pathname); return NextResponse.redirect(url); }
  return response;
}
