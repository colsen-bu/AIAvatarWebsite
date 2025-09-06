// Deprecated: Supabase auth provider removed. Kept as passthrough to avoid refactor churn.
export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}