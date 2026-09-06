import type { ProjectStatus } from "../lookups/project-status";
import type { UserProject } from "./user-project";
import type { Report } from "./report";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  projectStatusId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // present only when requested via ?include=
  projectStatus?: ProjectStatus;
  userProjects?: UserProject[];
  reports?: Report[];
}
