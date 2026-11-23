'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  BellOffIcon, 
  Pen2Icon, 
  TrashBinTrashIcon, 
  AddIcon, 
  ClockCircleIcon, 
  RestartIcon 
} from '@solar-icons/react/linear';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { TaskModel, getRepeatIntervalMinutes } from '@/app/model/TaskModel';
import { taskRepository } from '@/lib/repositories/TaskRepository';

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatRepeatInterval(task: TaskModel): string {
  const minutes = getRepeatIntervalMinutes(task);
  if (minutes <= 0) return '';
  if (minutes < 60) return `Every ${minutes}m`;
  const hrs = minutes / 60;
  return hrs === 1 ? 'Every 1hr' : `Every ${hrs}hrs`;
}

export default function TasksView() {
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const [showingAddDialog, setShowingAddDialog] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskModel | null>(null);

  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskModel | null>(null);

  useEffect(() => {
    const unsubscribe = taskRepository.listenToTasks((data) => {
      setTasks(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveTask = async (task: TaskModel) => {
    try {
      if (task.id) {
        await taskRepository.updateTask(task);
      } else {
        await taskRepository.addTask(task);
      }
    } catch (err: any) {
      console.error('Error saving task:', err);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleToggleEnabled = async (task: TaskModel) => {
    try {
      await taskRepository.updateTask({ ...task, enabled: !task.enabled });
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete?.id) return;
    try {
      await taskRepository.deleteTask(taskToDelete.id);
      setShowingDeleteDialog(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  const enabledCount = tasks.filter(t => t.enabled).length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Tasks & Reminders
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Configure alarms and schedule recurring freelance work
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                <ThemeToggle iconSize={20} />
              </div>
              <AnimatedFAB
                onPressed={() => {
                  setTaskToEdit(null);
                  setShowingAddDialog(true);
                }}
                className="!h-10 !w-10 !bg-sky-600 hover:!bg-sky-500 text-white"
                tooltip="Add Task"
              >
                <AddIcon size={20} />
              </AnimatedFAB>
            </div>
          </div>

          {enabledCount > 0 && (
            <div className="mb-5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <BellIcon size={14} />
                {enabledCount} active reminder{enabledCount > 1 ? 's' : ''} scheduled
              </p>
            </div>
          )}

          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500 text-center flex-col px-4">
                <AnimatedCard className="bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-900/50 rounded-2xl">
                  <h3 className="text-base font-bold mb-1">Failed to load tasks</h3>
                  <p className="text-xs opacity-80">{error}</p>
                </AnimatedCard>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center mt-12">
                <div className="bg-zinc-100 dark:bg-zinc-800/60 p-5 rounded-2xl mb-4 border border-zinc-200/60 dark:border-zinc-700/60">
                  <BellIcon size={36} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  No Tasks Yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[250px]">
                  Create tasks with alarms to get on-screen alerts.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.map((task, index) => (
                  <AnimatedListItem key={task.id || index} index={index}>
                    <AnimatedCard className={`bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all ${!task.enabled ? 'opacity-60' : ''}`}>
                      <div className="p-5 flex flex-col items-start w-full">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleEnabled(task)}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                                task.enabled
                                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60'
                              }`}
                            >
                              {task.enabled ? <BellIcon size={18} /> : <BellOffIcon size={18} />}
                            </button>
                            <div className="flex flex-col">
                              <span className={`text-base font-bold text-zinc-900 dark:text-zinc-100 transition-colors ${!task.enabled ? 'line-through text-zinc-400' : ''}`}>
                                {task.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-xs tabular-nums font-medium text-zinc-500 dark:text-zinc-400">
                                  <ClockCircleIcon size={12} />
                                  {formatTime(task.alarmTime)}
                                </div>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                  task.frequency === 'everyday'
                                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                    : task.frequency === 'custom'
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {task.frequency === 'everyday' ? (
                                    <span className="flex items-center gap-1">
                                      <RestartIcon size={10} />
                                      Daily
                                    </span>
                                  ) : task.frequency === 'custom' ? (
                                    <span className="flex items-center gap-1">
                                      {task.customDays?.join(', ')}
                                    </span>
                                  ) : 'Once'}
                                </span>
                                {formatRepeatInterval(task) && (
                                  <span className="text-[11px] tabular-nums font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    {formatRepeatInterval(task)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 w-full mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                          <button
                            onClick={() => {
                              setTaskToEdit(task);
                              setShowingAddDialog(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-semibold"
                          >
                            <Pen2Icon size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowingDeleteDialog(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-semibold"
                          >
                            <TrashBinTrashIcon size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </AnimatedCard>
                  </AnimatedListItem>
                ))}
              </div>
            )}
          </div>
        </div>

        <AddTaskDialog
          isOpen={showingAddDialog}
          onClose={() => setShowingAddDialog(false)}
          taskToEdit={taskToEdit}
          onSave={handleSaveTask}
        />

        <AnimatedDialog
          isOpen={showingDeleteDialog}
          onClose={() => {
            setShowingDeleteDialog(false);
            setTaskToDelete(null);
          }}
        >
          <div className="p-6 flex flex-col gap-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Delete Task
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete &ldquo;{taskToDelete?.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteDialog(false);
                  setTaskToDelete(null);
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
