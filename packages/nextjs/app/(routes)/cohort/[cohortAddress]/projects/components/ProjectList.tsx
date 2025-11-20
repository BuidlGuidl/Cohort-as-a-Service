"use client";

import Link from "next/link";
import AddProject from "./AddProject";
import { ProjectActions } from "./ProjectActions";
import { Project } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { EmptyProjectsState } from "~~/components/EmptyStates";
import { useCohortData } from "~~/hooks/useCohortData";

interface ProjectListProps {
  projects: Project[] | undefined;
  cohortAddress: string;
}

export const ProjectList = ({ projects, cohortAddress }: ProjectListProps) => {
  const { isAdmin } = useCohortData(cohortAddress);

  const formatUpdatedTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown time ago";
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-base-100 rounded-lg shadow-md p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold font-share-tech-mono mb-2">No Projects Yet</h2>
        <EmptyProjectsState canAdd={isAdmin} />
        {isAdmin && <div className="mt-8"><AddProject cohortAddress={cohortAddress} /></div>}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {isAdmin && (
        <div className="mb-4 flex justify-end"><AddProject cohortAddress={cohortAddress} /></div>
      )}
      {projects.map(project => (
        <div key={project.id} className="bg-base-100 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-share-tech-mono text-primary-content">{project.name}</span>
              <span className="text-xs text-base-content/60">Updated {formatUpdatedTime(project.updatedAt)}</span>
            </div>
            {isAdmin && <div className="mt-2 md:mt-0"><ProjectActions project={project} cohortAddress={cohortAddress} /></div>}
          </div>
          <p className="text-base mt-2 mb-2 text-base-content/90">{project.description}</p>
          <div className="flex items-center gap-4 flex-wrap mt-2">
            {project.githubUrl && (
              <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-xs rounded bg-accent/20 text-accent font-mono px-4 mb-1 flex items-center gap-1">
                <svg aria-hidden="true" focusable="false" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.09 3.29 9.41 7.79 10.94.57.1.78-.25.78-.55v-2.07c-3.16.69-3.83-1.36-3.83-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.78 2.69 1.26 3.33.97.1-.75.4-1.26.73-1.55-2.52-.29-5.18-1.26-5.18-5.63 0-1.24.44-2.26 1.16-3.06-.11-.29-.5-1.48.11-3.1 0 0 .95-.32 3.11 1.17A10.7 10.7 0 0 1 12 7.7c.96.01 1.93.13 2.84.37 2.15-1.49 3.1-1.17 3.1-1.17.62 1.62.24 2.81.12 3.1.73.8 1.16 1.82 1.16 3.06 0 4.38-2.67 5.33-5.21 5.62.42.36.77 1.09.77 2.2v3.26c0 .31.21.66.79.55A11.53 11.53 0 0 0 23.5 12C23.5 5.93 18.07.5 12 .5z" /></svg>
                GitHub
              </Link>
            )}
            {project.websiteUrl && (
              <Link href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-xs rounded bg-primary/20 text-primary font-mono px-4 mb-1 flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
                Live URL
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
