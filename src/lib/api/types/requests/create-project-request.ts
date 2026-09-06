import type { IdRef } from "../id-ref";
import type { UserProjectRef } from "./user-project-ref";

export interface CreateProjectRequest {
  name: string;
  description?: string;
  projectStatus: IdRef<number>;
  isActive?: boolean;
  userProjects?: UserProjectRef[]; // team members at creation
}
