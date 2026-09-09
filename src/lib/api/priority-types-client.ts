import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { PriorityType } from "@/lib/api/types";

export const listPriorityTypes = makeLookupClient<PriorityType>("/api/priority-types");
