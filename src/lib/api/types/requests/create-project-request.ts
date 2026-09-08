import type { IdRef } from "../id-ref";
import type { UserProjectRef } from "./user-project-ref";
import type { TeamProjectRef } from "./team-project-ref";

export interface CreateProjectRequest {
  name: string;
  description?: string;
  projectStatus: IdRef<number>;
  isActive?: boolean;
  userProjects?: UserProjectRef[]; // individually assigned members at creation
  teamProjects?: TeamProjectRef[]; // teams assigned at creation
}
