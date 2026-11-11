// Offset pagination shared by the list endpoints. `page`/`limit` arrive
// already validated from validatePagination (validation.ts); a page beyond
// the last one is not an error: findMany returns [] and the meta still
// reports the real total.
export interface Pagination {
  page: number;
  limit: number;
}

export function paginationArgs({ page, limit }: Pagination) {
  return { skip: (page - 1) * limit, take: limit };
}

export function paginationMeta(total: number, { page, limit }: Pagination) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
