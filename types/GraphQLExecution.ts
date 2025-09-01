// Stub types for GraphQLExecution
export type QueryProfile = { traces: ResolverTrace[]; summary: string };
export type ResolverTrace = { path: string[]; startTime: number; duration: number; isBatched?: boolean; isNPlusOneCandidate?: boolean };
export type DataLoaderPatch = { patch: string };
