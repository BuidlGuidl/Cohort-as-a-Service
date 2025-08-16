"use client";

import Link from "next/link";
import AddProject from "./AddProject";
import { ProjectActions } from "./ProjectActions";
import { Project } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { EmptyProjectsState } from "~~/components/Empty-states";
import { ProjectSkeleton } from "~~/components/Skeletons";
import { useCohortData } from "~~/hooks/useCohortData";

interface ProjectListProps {
  projects: Project[] | undefined;
  cohortAddress: string;
}

export const ProjectList = ({ projects, cohortAddress }: ProjectListProps) => {
  const { isAdmin, isLoading } = useCohortData(cohortAddress);

  const formatUpdatedTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown time ago";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-3xl mb-6 inline-block px-4 py-2 bg-primary text-secondary">Projects</h2>
        <ProjectSkeleton items={3} />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-3xl mb-6 inline-block px-4 py-2 bg-primary text-secondary">Projects</h2>
        <EmptyProjectsState canAdd={isAdmin} />
        {isAdmin && <AddProject cohortAddress={cohortAddress} />}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl mb-6 inline-block px-4 py-2 bg-primary text-secondary">Projects</h2>
      {isAdmin && <AddProject cohortAddress={cohortAddress} />}
      <div className="space-y-10 mt-6">
        {projects.map(project => (
          <div key={project.id} className="w-full">
            <div className="flex items-center gap-2">
              <span className="text-secondary  ">{project.name}</span>
              <span className="text-gray-400 text-xs ">- Updated {formatUpdatedTime(project.updatedAt)}</span>
              {isAdmin && <ProjectActions project={project} cohortAddress={cohortAddress} />}
            </div>
            <p className="text-white mt-1">{project.description}</p>
            <div className="flex -mt-3 gap-2">
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent  text-xs underline"
                >
                  GitHub
                </Link>
              )}
              {project.websiteUrl && (
                <Link
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent  text-xs underline"
                >
                  Live URL
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
