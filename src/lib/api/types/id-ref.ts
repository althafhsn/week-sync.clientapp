// Generic so it can wrap either a UUID entity id (default, e.g. a user) or
// a numeric lookup-table id (e.g. a project status) — the lookup tables
// migrated to integer primary keys while transactional entities kept UUIDs.
export interface IdRef<T = string> {
  id: T;
}
