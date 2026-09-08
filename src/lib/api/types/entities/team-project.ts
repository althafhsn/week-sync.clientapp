import type { Team } from "./team";
import type { Project } from "./project";

export interface TeamProject {
  id: string;
  teamId: string;
  projectId: string;
  team?: Pick<Team, "id" | "name">;
  project?: Pick<Project, "id" | "name">;
}
