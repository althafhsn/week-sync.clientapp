import type { IdRef } from "../id-ref";
import type { UserProjectRef } from "./user-project-ref";

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  projectStatus?: IdRef<number>;
  isActive?: boolean;
  userProjects?: UserProjectRef[]; // full replace of team membership when present
}
