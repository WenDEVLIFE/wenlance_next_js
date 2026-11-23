'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@solar-icons/react/linear';
import { notificationService } from '@/lib/services/NotificationService';
import { TaskModel } from '@/app/model/TaskModel';

export default function AlarmOverlay() {
  const [activeTask, setActiveTask] = useState<TaskModel | null>(null);

  const handleAlarm = useCallback((task: TaskModel) => {
    setActiveTask(task);
  }, []);

  useEffect(() => {
    const unsub = notificationService.onAlarm(handleAlarm);
    return unsub;
  }, [handleAlarm]);

  const dismiss = () => setActiveTask(null);

  return (
    <AnimatePresence>
      {activeTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={dismiss}
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="flex flex-col items-center p-7 text-center">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5"
              >
                <BellIcon size={32} className="text-sky-600 dark:text-sky-400" />
              </motion.div>

              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Task Reminder
              </h2>
              <p className="text-base font-semibold text-sky-600 dark:text-sky-400 mb-1">
                {activeTask.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeTask.frequency === 'everyday'
                  ? 'Daily schedule'
                  : activeTask.frequency === 'one-time'
                  ? 'One-time alert'
                  : `Custom schedule`}
              </p>
            </div>

            <button
              onClick={dismiss}
              className="
                w-full py-3.5 font-semibold text-sm text-white
                bg-sky-600 hover:bg-sky-500
                transition-colors cursor-pointer border-t border-sky-700/20
              "
            >
              Dismiss
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
