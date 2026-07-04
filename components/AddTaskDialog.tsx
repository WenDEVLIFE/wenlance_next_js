'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
import { CustomText } from './CustomText';
import { TaskModel, TaskFrequency, DayOfWeek, DAYS_OF_WEEK } from '@/app/model/TaskModel';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskModel | null;
  onSave: (task: TaskModel) => void;
}

const frequencyOptions: { label: string; value: TaskFrequency }[] = [
  { label: 'Everyday', value: 'everyday' },
  { label: 'One Time', value: 'one-time' },
  { label: 'Custom', value: 'custom' },
];

export const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isOpen,
  onClose,
  taskToEdit = null,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [alarmTime, setAlarmTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [frequency, setFrequency] = useState<TaskFrequency>('everyday');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setAlarmTime(taskToEdit.alarmTime);
      setFrequency(taskToEdit.frequency);
      setSelectedDays(taskToEdit.customDays ?? []);
    } else {
      setName('');
      const d = new Date();
      setAlarmTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      setFrequency('everyday');
      setSelectedDays([]);
    }
  }, [taskToEdit, isOpen]);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter a task name');
      return;
    }

    if (!alarmTime) {
      setErrorMsg('Please select an alarm time');
      return;
    }

    if (frequency === 'custom' && selectedDays.length === 0) {
      setErrorMsg('Please select at least one day');
      return;
    }

    const task: TaskModel = {
      id: taskToEdit?.id,
      name: name.trim(),
      alarmTime,
      frequency,
      enabled: taskToEdit?.enabled ?? true,
      lastTriggeredDate: taskToEdit?.lastTriggeredDate,
      customDays: frequency === 'custom' ? selectedDays : undefined,
      createdAt: taskToEdit?.createdAt ?? new Date(),
    };

    onSave(task);
    onClose();
  };

  return (
    <AnimatedDialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6 flex flex-col gap-5">
        <CustomText
          label={taskToEdit ? 'Edit Task' : 'Add New Task'}
          fontWeight={700}
          fontSize={20}
          className="transition-colors"
        />

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <CustomTextField
            label="Task Name"
            hint="e.g., Morning standup meeting"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <CustomText
              label="Alarm Time"
              fontWeight={600}
              fontSize={14}
              className="transition-colors"
            />
            <div className="relative">
              <div className="
                w-full flex items-center justify-between px-4 py-4 rounded-xl
                bg-white border border-zinc-300
                text-black
              ">
                <input
                  type="time"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-base font-medium"
                />
                <Clock size={20} className="text-zinc-600 flex-shrink-0" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <CustomText
              label="Alert Frequency"
              fontWeight={600}
              fontSize={14}
              className="transition-colors"
            />
            <div className="flex gap-2">
              {frequencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value)}
                  className={`
                    flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border
                    ${frequency === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {frequency === 'custom' && (
            <div className="flex flex-col gap-2">
              <CustomText
                label="Repeat On"
                fontWeight={600}
                fontSize={14}
                className="transition-colors"
              />
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`
                      w-10 h-10 rounded-full text-xs font-bold transition-all cursor-pointer
                      ${selectedDays.includes(day)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="
              flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
              bg-[#0096C7] hover:bg-[#0077B6] text-white
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="
              flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
              text-white hover:bg-white/10 border border-white/20
            "
          >
            {taskToEdit ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddTaskDialog;
