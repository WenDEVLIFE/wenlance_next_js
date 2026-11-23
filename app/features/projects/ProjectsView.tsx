'use client';

import React, { useState, useEffect } from 'react';
import { 
  SuitcaseLinesIcon, 
  CalendarIcon, 
  ArrowRightIcon, 
  Pen2Icon, 
  TrashBinTrashIcon, 
  AddIcon 
} from '@solar-icons/react/linear';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddProjectDialog } from '@/components/AddProjectDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { ProjectModel } from '@/app/model/ProjectModel';
import { projectRepository } from '@/lib/repositories/ProjectRepository';

// ─── Helpers ────────────────────────────────────────────────
function formatDate(date: Date): string {
  if (!date) return '';
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function getStatusColorClass(status: string, isText: boolean = false) {
  switch (status) {
    case 'In Progress':
      return isText ? 'text-sky-600 dark:text-sky-400' : 'bg-sky-500/10 border-sky-500/30';
    case 'Planning':
      return isText ? 'text-amber-600 dark:text-amber-400' : 'bg-amber-500/10 border-amber-500/30';
    case 'Completed':
      return isText ? 'text-emerald-600 dark:text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/30';
    case 'On Hold':
      return isText ? 'text-orange-600 dark:text-orange-400' : 'bg-orange-500/10 border-orange-500/30';
    case 'Cancelled':
      return isText ? 'text-rose-600 dark:text-rose-400' : 'bg-rose-500/10 border-rose-500/30';
    default:
      return isText ? 'text-zinc-600 dark:text-zinc-400' : 'bg-zinc-500/10 border-zinc-500/30';
  }
}

// ─── ProjectCard ────────────────────────────────────────────
interface ProjectCardProps {
  project: ProjectModel;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const daysRemaining = Math.ceil((new Date(project.expectedEndDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  const statusColorContainer = getStatusColorClass(project.status, false);
  const statusColorText = getStatusColorClass(project.status, true);

  return (
    <AnimatedCard className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="p-5 flex flex-col items-start w-full">
        {/* Title + Status */}
        <div className="flex justify-between items-center w-full">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {project.projectName}
          </span>
          <div className={`px-2.5 py-0.5 border rounded-full ${statusColorContainer}`}>
            <span className={`text-xs font-semibold ${statusColorText}`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Tech Stacks */}
        {project.techStacks && project.techStacks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.techStacks.map((tech) => (
              <div
                key={tech}
                className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 rounded-md text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {tech}
              </div>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2 mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1 tabular-nums">
            <CalendarIcon size={14} className="opacity-70" />
            <span>{formatDate(project.startDate)}</span>
          </div>
          <ArrowRightIcon size={12} className="opacity-70 mx-1" />
          <span className="tabular-nums">{formatDate(project.expectedEndDate)}</span>
        </div>

        {/* Days Remaining Banner */}
        <div className={`mt-3 px-3 py-1.5 rounded-xl w-full text-xs font-semibold ${daysRemaining >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
          {daysRemaining >= 0 ? `${daysRemaining} days remaining` : `Overdue by ${Math.abs(daysRemaining)} days`}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 w-full mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-semibold"
          >
            <Pen2Icon size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-semibold"
          >
            <TrashBinTrashIcon size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </AnimatedCard>
  );
}

// ─── Main View ──────────────────────────────────────────────
export default function ProjectsView() {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const [showingAddDialog, setShowingAddDialog] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectModel | null>(null);

  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectModel | null>(null);

  // Subscribe to projects with proper cleanup
  useEffect(() => {
    const unsubscribe = projectRepository.listenToProjects((data) => {
      setProjects(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProject = async (project: ProjectModel) => {
    try {
      if (project.id) {
        await projectRepository.updateProject(project);
      } else {
        await projectRepository.addProject(project);
      }
    } catch (err: any) {
      console.error('Error saving project:', err);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete?.id) return;
    try {
      await projectRepository.deleteProject(projectToDelete.id);
      setShowingDeleteDialog(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Projects
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Track client contracts, deliverables, and timelines
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                <ThemeToggle iconSize={20} />
              </div>
              <AnimatedFAB
                onPressed={() => {
                  setProjectToEdit(null);
                  setShowingAddDialog(true);
                }}
                className="!h-10 !w-10 !bg-sky-600 hover:!bg-sky-500 text-white"
                tooltip="Add Project"
              >
                <AddIcon size={20} />
              </AnimatedFAB>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500 text-center flex-col px-4">
                <AnimatedCard className="bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-900/50 rounded-2xl">
                  <h3 className="text-base font-bold mb-1">Failed to load projects</h3>
                  <p className="text-xs opacity-80">{error}</p>
                </AnimatedCard>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center mt-12">
                <div className="bg-zinc-100 dark:bg-zinc-800/60 p-5 rounded-2xl mb-4 border border-zinc-200/60 dark:border-zinc-700/60">
                  <SuitcaseLinesIcon size={36} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  No Projects Yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[250px]">
                  Create your first project to get started tracking deliverables.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {projects.map((project, index) => (
                  <AnimatedListItem key={project.id || index} index={index}>
                    <ProjectCard
                      project={project}
                      onEdit={() => {
                        setProjectToEdit(project);
                        setShowingAddDialog(true);
                      }}
                      onDelete={() => {
                        setProjectToDelete(project);
                        setShowingDeleteDialog(true);
                      }}
                    />
                  </AnimatedListItem>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <AddProjectDialog
          isOpen={showingAddDialog}
          onClose={() => setShowingAddDialog(false)}
          projectToEdit={projectToEdit}
          onSave={handleSaveProject}
        />

        {/* Delete Confirmation Dialog */}
        <AnimatedDialog
          isOpen={showingDeleteDialog}
          onClose={() => {
            setShowingDeleteDialog(false);
            setProjectToDelete(null);
          }}
        >
          <div className="p-6 flex flex-col gap-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Delete Project
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete &ldquo;{projectToDelete?.projectName}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteDialog(false);
                  setProjectToDelete(null);
                }}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm transition-colors cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm transition-colors cursor-pointer bg-red-600 hover:bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </AnimatedDialog>
      </div>
    </PageTransition>
  );
}
