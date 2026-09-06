import type { User } from "./user";
import type { Project } from "./project";

export interface UserProject {
  id: string;
  userId: string;
  projectId: string;
  user?: Pick<User, "id" | "name" | "email">;
  project?: Pick<Project, "id" | "name">;
}
