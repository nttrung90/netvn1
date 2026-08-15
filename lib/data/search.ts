export function buildPostSearchClauses(query: string, categoryIds: string[] = [], postIdsFromTags: string[] = []) {
  const term = query.trim().replace(/[%_]/g, "\\$&");
  const search = `%${term}%`;
  const clauses = [`title.ilike.${search}`, `excerpt.ilike.${search}`, `content.ilike.${search}`];
  if (categoryIds.length) clauses.push(`category_id.in.(${categoryIds.join(",")})`);
  if (postIdsFromTags.length) clauses.push(`id.in.(${postIdsFromTags.join(",")})`);
  return { search, clauses };
}

type MatchByNameQuery = { select: (columns: string) => { ilike: (field: string, value: string) => PromiseLike<{ data: Array<{ id: string }> | null }> } };
type PostTagQuery = { select: (columns: string) => { in: (field: string, values: string[]) => PromiseLike<{ data: Array<{ post_id: string }> | null }> } };
export type SearchRelationClient = { from(table: "categories" | "tags"): MatchByNameQuery; from(table: "post_tags"): PostTagQuery };

export async function collectSearchRelationIds(supabase: SearchRelationClient, query: string) {
  const [{ data: matchedCategory }, { data: matchedTags }] = await Promise.all([
    supabase.from("categories").select("id").ilike("name", `%${query.trim()}%`),
    supabase.from("tags").select("id").ilike("name", `%${query.trim()}%`),
  ]);
  const categoryIds = (matchedCategory ?? []).map((category: { id: string }) => category.id);
  const tagIds = (matchedTags ?? []).map((tag: { id: string }) => tag.id);
  const { data: postTagRows } = tagIds.length ? await supabase.from("post_tags").select("post_id").in("tag_id", tagIds) : { data: [] };
  return { categoryIds, postIdsFromTags: (postTagRows ?? []).map((row: { post_id: string }) => row.post_id) };
}
