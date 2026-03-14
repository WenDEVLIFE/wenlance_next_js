'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, ArrowRight, Edit, Trash2, Plus } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddProjectDialog } from '@/components/AddProjectDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { ProjectModel } from '@/app/model/ProjectModel';
import { projectRepository } from '@/lib/repositories/ProjectRepository';
import AppColors from '@/lib/utils/colors';

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
      return isText ? 'text-blue-500' : 'bg-blue-500/10 border-blue-500';
    case 'Planning':
      return isText ? 'text-amber-500' : 'bg-amber-500/10 border-amber-500';
    case 'Completed':
      return isText ? 'text-emerald-500' : 'bg-emerald-500/10 border-emerald-500';
    case 'On Hold':
      return isText ? 'text-orange-500' : 'bg-orange-500/10 border-orange-500';
    case 'Cancelled':
      return isText ? 'text-red-500' : 'bg-red-500/10 border-red-500';
    default:
      return isText ? 'text-zinc-500' : 'bg-zinc-500/10 border-zinc-500';
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
    <AnimatedCard className="bg-white dark:bg-[#023E8A] border border-zinc-100 dark:border-transparent">
      <div className="p-4 flex flex-col items-start w-full">
        {/* Title + Status */}
        <div className="flex justify-between items-center w-full">
          <span className="text-lg font-bold text-zinc-900 dark:text-white transition-colors">
            {project.projectName}
          </span>
          <div className={`px-3 py-1 border rounded-full ${statusColorContainer}`}>
            <span className={`text-xs font-semibold ${statusColorText}`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Tech Stacks */}
        {project.techStacks && project.techStacks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {project.techStacks.map((tech) => (
              <div
                key={tech}
                className="px-2.5 py-1 bg-blue-50 dark:bg-[#0096C7]/20 border border-blue-200 dark:border-[#0096C7]/50 rounded text-xs font-semibold text-blue-700 dark:text-[#48CAE4]"
              >
                {tech}
              </div>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2 mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="opacity-70" />
            <span>{formatDate(project.startDate)}</span>
          </div>
          <ArrowRight size={14} className="opacity-70 mx-1" />
          <span>{formatDate(project.expectedEndDate)}</span>
        </div>

        {/* Days Remaining Banner */}
        <div className={`mt-3 px-3 py-2 rounded-lg w-full text-sm font-semibold ${daysRemaining >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
          {daysRemaining >= 0 ? `${daysRemaining} days remaining` : `Overdue by ${Math.abs(daysRemaining)} days`}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 w-full mt-4 border-t border-zinc-100 dark:border-white/10 pt-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 dark:text-[#48CAE4] hover:bg-blue-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-semibold"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-semibold"
          >
            <Trash2 size={16} />
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
  const [error, setError] = useState<string | null>(null);

  const [showingAddDialog, setShowingAddDialog] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectModel | null>(null);

  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectModel | null>(null);

  // Subscribe to projects
  useEffect(() => {
    try {
      const unsubscribe = projectRepository.listenToProjects((data) => {
        setProjects(data);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
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
      <div className="min-h-screen bg-zinc-50 dark:bg-[#03045E] transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative px-6 py-6 pb-24">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white transition-colors">
              Your Projects
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1 rounded-full shadow-lg border border-white/20">
                <ThemeToggle iconSize={22} />
              </div>
              <AnimatedFAB
                backgroundColor={AppColors.primary}
                onPressed={() => {
                  setProjectToEdit(null);
                  setShowingAddDialog(true);
                }}
                className="!h-11 !w-11"
                tooltip="Add Project"
              >
                <Plus size={20} />
              </AnimatedFAB>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-zinc-500 dark:text-zinc-400">
                Loading projects...
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500 text-center flex-col px-4">
                <AnimatedCard className="bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-900/50">
                  <h3 className="text-lg font-bold mb-2">Failed to load projects</h3>
                  <p className="text-sm opacity-80">{error}</p>
                </AnimatedCard>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center mt-20">
                <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-full mb-4">
                  <Briefcase size={40} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 transition-colors">
                  No Projects Yet
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[250px]">
                  Create your first project to get started tracking your work
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
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
          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white transition-colors">
              Delete Project
            </h2>
            <p className="text-base text-zinc-600 dark:text-white/70 transition-colors">
              Are you sure you want to delete &ldquo;{projectToDelete?.projectName}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteDialog(false);
                  setProjectToDelete(null);
                }}
                className="
                  flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
                  bg-zinc-100 dark:bg-[#0096C7] text-zinc-700 dark:text-white
                  hover:bg-zinc-200 dark:hover:bg-[#0077B6]
                "
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="
                  flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
                  bg-red-500 text-white hover:bg-red-600
                "
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
