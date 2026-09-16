import React from 'react';
import { X, Mail, Hash, BookOpen, Calendar, User, Clock } from 'lucide-react';
import { Student } from '../types.js';

interface StudentDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  student,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div
      id="student-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="student-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-detail-title"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative">
          <button
            id="close-student-detail-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold text-white shadow-inner">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <h2 id="student-detail-title" className="text-xl font-bold">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-indigo-100 text-sm font-mono mt-0.5">
                Roll No: {student.rollNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Course
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {student.course}
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Age
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {student.age} years old
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                Email Address
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all font-mono">
                {student.email}
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Enrollment Date
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {student.enrollmentDate}
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                Firestore Document ID
              </div>
              <div className="mt-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate" title={student.id}>
                {student.id}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 px-6 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Direct Firestore sync via Cloud Functions
          </span>
          <div className="flex items-center gap-3">
            <button
              id="close-detail-modal-footer-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              id="edit-from-detail-modal-btn"
              type="button"
              onClick={() => {
                onClose();
                onEdit(student.id);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              Edit Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
