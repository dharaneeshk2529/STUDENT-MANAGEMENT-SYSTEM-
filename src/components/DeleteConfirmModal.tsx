import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Student } from '../types.js';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  student: Student | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  student,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div
      id="delete-confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onCancel}
    >
      <div
        id="delete-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 id="delete-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Delete Student Record?
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to permanently delete this student? This will remove the record from Firestore and cannot be undone.
            </p>

            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-1">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {student.firstName} {student.lastName}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-2">
                <span>Roll: <strong className="text-zinc-700 dark:text-zinc-300">{student.rollNumber}</strong></span>
                <span>•</span>
                <span>Course: <strong className="text-zinc-700 dark:text-zinc-300">{student.course}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            id="cancel-delete-student-btn"
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-student-btn"
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
