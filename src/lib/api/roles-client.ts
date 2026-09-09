import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { Role } from "@/lib/api/types";

export const listRoles = makeLookupClient<Role>("/api/roles");
