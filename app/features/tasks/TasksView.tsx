'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Edit, Trash2, Plus, Clock, RotateCcw } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { TaskModel, getRepeatIntervalMinutes } from '@/app/model/TaskModel';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import AppColors from '@/lib/utils/colors';

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
  const [error, setError] = useState<string | null>(null);

  const [showingAddDialog, setShowingAddDialog] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskModel | null>(null);

  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskModel | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = taskRepository.listenToTasks((data) => {
        setTasks(data);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
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
      <div className="min-h-screen bg-zinc-50 dark:bg-[#03045E] transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative px-6 py-6 pb-24">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white transition-colors">
              Tasks
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1 rounded-full shadow-lg border border-white/20">
                <ThemeToggle iconSize={22} />
              </div>
              <AnimatedFAB
                backgroundColor={AppColors.primary}
                onPressed={() => {
                  setTaskToEdit(null);
                  setShowingAddDialog(true);
                }}
                className="!h-11 !w-11"
                tooltip="Add Task"
              >
                <Plus size={20} />
              </AnimatedFAB>
            </div>
          </div>

          {enabledCount > 0 && (
            <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <Bell size={14} />
                {enabledCount} active alarm{enabledCount > 1 ? 's' : ''} — alerts will show on-screen when due
              </p>
            </div>
          )}

          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-zinc-500 dark:text-zinc-400">
                Loading tasks...
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500 text-center flex-col px-4">
                <AnimatedCard className="bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-900/50">
                  <h3 className="text-lg font-bold mb-2">Failed to load tasks</h3>
                  <p className="text-sm opacity-80">{error}</p>
                </AnimatedCard>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center mt-20">
                <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-full mb-4">
                  <Bell size={40} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 transition-colors">
                  No Tasks Yet
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[250px]">
                  Create tasks with alarms to get reminded
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.map((task, index) => (
                  <AnimatedListItem key={task.id || index} index={index}>
                    <AnimatedCard className={`bg-white dark:bg-[#023E8A] border border-zinc-100 dark:border-transparent transition-opacity ${!task.enabled ? 'opacity-60' : ''}`}>
                      <div className="p-4 flex flex-col items-start w-full">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleEnabled(task)}
                              className={`p-2 rounded-lg cursor-pointer transition-all ${
                                task.enabled
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-[#48CAE4]'
                                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'
                              }`}
                            >
                              {task.enabled ? <Bell size={18} /> : <BellOff size={18} />}
                            </button>
                            <div className="flex flex-col">
                              <span className={`text-lg font-bold text-zinc-900 dark:text-white transition-colors ${!task.enabled ? 'line-through' : ''}`}>
                                {task.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-300">
                                  <Clock size={12} />
                                  {formatTime(task.alarmTime)}
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  task.frequency === 'everyday'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : task.frequency === 'custom'
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {task.frequency === 'everyday' ? (
                                    <span className="flex items-center gap-1">
                                      <RotateCcw size={10} />
                                      Daily
                                    </span>
                                  ) : task.frequency === 'custom' ? (
                                    <span className="flex items-center gap-1">
                                      {task.customDays?.join(', ')}
                                    </span>
                                  ) : 'Once'}
                                </span>
                                {formatRepeatInterval(task) && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    {formatRepeatInterval(task)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 w-full mt-4 border-t border-zinc-100 dark:border-white/10 pt-3">
                          <button
                            onClick={() => {
                              setTaskToEdit(task);
                              setShowingAddDialog(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 dark:text-[#48CAE4] hover:bg-blue-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-semibold"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowingDeleteDialog(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-semibold"
                          >
                            <Trash2 size={16} />
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
          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white transition-colors">
              Delete Task
            </h2>
            <p className="text-base text-zinc-600 dark:text-white/70 transition-colors">
              Are you sure you want to delete the task &ldquo;{taskToDelete?.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteDialog(false);
                  setTaskToDelete(null);
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
