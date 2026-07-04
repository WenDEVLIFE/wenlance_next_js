'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="relative z-10 w-full max-w-sm bg-white dark:bg-[#023E8A] rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center p-8 text-center">
              <motion.div
                animate={{
                  rotate: [0, 15, -15, 15, -15, 0],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6"
              >
                <Bell size={40} className="text-blue-600 dark:text-[#48CAE4]" />
              </motion.div>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Task Reminder
              </h2>
              <p className="text-lg font-semibold text-blue-600 dark:text-[#48CAE4] mb-1">
                {activeTask.name}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-300">
                {activeTask.frequency === 'everyday'
                  ? 'Daily task'
                  : activeTask.frequency === 'one-time'
                  ? 'One-time task'
                  : `Custom schedule`}
              </p>
            </div>

            <button
              onClick={dismiss}
              className="
                w-full py-5 font-bold text-lg text-white
                bg-blue-600 hover:bg-blue-700
                dark:bg-[#0096C7] dark:hover:bg-[#0077B6]
                transition-colors cursor-pointer
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
