'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Calendar, ChevronDown } from 'lucide-react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
import { CustomText } from './CustomText';
import { ProjectModel } from '@/app/model/ProjectModel';

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: ProjectModel | null;
  onSave: (project: ProjectModel) => void;
}

const statusOptions = [
  'Planning',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
];

export const AddProjectDialog: React.FC<AddProjectDialogProps> = ({
  isOpen,
  onClose,
  projectToEdit = null,
  onSave,
}) => {
  const [projectName, setProjectName] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('Planning');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [errorMsg, setErrorMsg] = useState('');

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Populate data when editing
  useEffect(() => {
    if (projectToEdit) {
      setProjectName(projectToEdit.projectName);
      setSelectedStatus(projectToEdit.status);
      setTechStacks([...projectToEdit.techStacks]);
      setStartDate(new Date(projectToEdit.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(projectToEdit.expectedEndDate).toISOString().split('T')[0]);
    } else {
      setProjectName('');
      setTechStackInput('');
      setTechStacks([]);
      setSelectedStatus('Planning');
      const d = new Date();
      setStartDate(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 30);
      setEndDate(d.toISOString().split('T')[0]);
    }
  }, [projectToEdit, isOpen]);

  const handleAddTechStack = () => {
    const val = techStackInput.trim();
    if (val && !techStacks.includes(val)) {
      setTechStacks([...techStacks, val]);
      setTechStackInput('');
    }
  };

  const handleRemoveTechStack = (stack: string) => {
    setTechStacks(techStacks.filter((s) => s !== stack));
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const handleSave = () => {
    setErrorMsg('');
    if (!projectName.trim()) {
      setErrorMsg('Please enter a project name');
      return;
    }
    if (techStacks.length === 0) {
      setErrorMsg('Please add at least one tech stack');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setErrorMsg('End date must be after start date');
      return;
    }

    const project: ProjectModel = {
      id: projectToEdit?.id,
      projectName: projectName.trim(),
      techStacks,
      status: selectedStatus,
      startDate: start,
      expectedEndDate: end,
    };

    onSave(project);
    onClose();
  };

  return (
    <AnimatedDialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6 flex flex-col gap-5">
        <CustomText
          label={projectToEdit ? 'Edit Project' : 'Add New Project'}
          fontWeight={700}
          fontSize={20}
          className="transition-colors"
        />

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1">
          <CustomTextField
            label="Project Name"
            hint="e.g., Mobile Banking App"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />

          {/* Status Selection */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Status"
              fontWeight={600}
              fontSize={14}
              className="transition-colors"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="
                  w-full flex items-center justify-between px-4 py-4 rounded-xl
                  text-base transition-all duration-200 outline-none cursor-pointer
                  bg-white border border-zinc-300
                  hover:border-blue-400 hover:bg-blue-50
                  text-black
                "
              >
                <span>{selectedStatus}</span>
                <ChevronDown
                  size={16}
                  className={`text-black transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {isStatusOpen && (
                <div
                  className="
                    absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden
                    bg-white  border border-zinc-200 dark:border-zinc-700 text-black
                  "
                >
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsStatusOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 text-sm cursor-pointer
                        ${status === selectedStatus
                          ? 'bg-blue-50 bg-white text-black font-semibold hover:bg-blue-50'
                          : 'text-zinc-700 text-black hover:bg-blue-50'
                        }
                      `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tech Stacks */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Tech Stacks"
              fontWeight={600}
              fontSize={14}
              className="text-white"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <CustomTextField
                  hint="e.g., Flutter, Firebase"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechStack();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddTechStack}
                className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </div>
            {techStacks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {techStacks.map((stack) => (
                  <div
                    key={stack}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 dark:text-blue-300"
                  >
                    <span className="text-sm font-medium">{stack}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechStack(stack)}
                      className="text-blue-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-2 relative">
            <CustomText
              label="Start Date"
              fontWeight={600}
              fontSize={14}
              className="text-white"
            />
            <div 
              className="relative group cursor-pointer"
              onClick={() => startDateRef.current?.showPicker()}
            >
              <div className="
                w-full flex items-center justify-between px-4 py-4 rounded-xl
                bg-white border-1.5 border-zinc-200 dark:border-zinc-800 text-black
                group-hover:bg-blue-50 transition-colors
              ">
                <span className="text-base font-medium">{formatDateLabel(startDate)}</span>
                <Calendar size={20} className="text-zinc-600" />
              </div>
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="opacity-0 w-0 h-0 absolute overflow-hidden pointer-events-none"
              />
            </div>
          </div>

          {/* Expected End Date */}
          <div className="flex flex-col gap-2 relative">
            <CustomText
              label="Expected End Date"
              fontWeight={600}
              fontSize={14}
              className="text-white"
            />
            <div 
              className="relative group cursor-pointer"
              onClick={() => endDateRef.current?.showPicker()}
            >
              <div className="
                w-full flex items-center justify-between px-4 py-4 rounded-xl
                bg-white border-1.5 border-zinc-200 dark:border-zinc-800 text-black
                group-hover:bg-blue-50 transition-colors
              ">
                <span className="text-base font-medium">{formatDateLabel(endDate)}</span>
                <Calendar size={20} className="text-zinc-600" />
              </div>
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="opacity-0 w-0 h-0 absolute overflow-hidden pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
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
              text-white hover:bg-white/10
            "
          >
            {projectToEdit ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddProjectDialog;
