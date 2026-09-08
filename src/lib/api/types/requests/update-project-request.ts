import type { IdRef } from "../id-ref";
import type { UserProjectRef } from "./user-project-ref";
import type { TeamProjectRef } from "./team-project-ref";

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  projectStatus?: IdRef<number>;
  isActive?: boolean;
  userProjects?: UserProjectRef[]; // full replace of individually assigned members when present
  teamProjects?: TeamProjectRef[]; // full replace of assigned teams when present
}
