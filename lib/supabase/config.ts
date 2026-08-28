export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isValidSupabaseUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname) && ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = Boolean(
  isValidSupabaseUrl(supabaseUrl) && supabaseAnonKey,
);

export function getSupabaseConfigurationMessage() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trên môi trường đang chạy.";
  }

  if (!isValidSupabaseUrl(supabaseUrl)) {
    return "NEXT_PUBLIC_SUPABASE_URL không phải URL hợp lệ.";
  }

  return null;
}

export function requireSupabaseConfig() {
  const message = getSupabaseConfigurationMessage();
  if (message) {
    throw new Error(
      `Supabase chưa được cấu hình đúng. ${message}`,
    );
  }

  return { supabaseUrl: supabaseUrl!, supabaseAnonKey: supabaseAnonKey! };
}
