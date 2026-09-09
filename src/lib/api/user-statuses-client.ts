import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { UserStatus } from "@/lib/api/types";

export const listUserStatuses = makeLookupClient<UserStatus>("/api/user-statuses");
