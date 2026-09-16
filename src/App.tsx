import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Student, ToastMessage } from './types.js';
import api from './services/api.js';
import { Header } from './components/Header.js';
import { StatsBar } from './components/StatsBar.js';
import { StudentList } from './components/StudentList.js';
import { StudentForm } from './components/StudentForm.js';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.js';
import { StudentDetailModal } from './components/StudentDetailModal.js';
import { ApiDocsModal } from './components/ApiDocsModal.js';
import { ToastContainer } from './components/Toast.js';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Modals & Drawers state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = 'toast-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, message, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch students from GET /api/students(?search=...)
  const fetchStudents = useCallback(async (search = '') => {
    setIsLoading(true);
    try {
      const response = await api.getStudents(search);
      if (response && response.data) {
        setStudents(response.data);
        setServerOnline(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch students:', err);
      const errInfo = api.extractErrorMessage(err);
      addToast('error', `Failed to load students: ${errInfo.message}`);
      setServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    fetchStudents('');
  }, [fetchStudents]);

  // Debounced search handling
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchStudents(query);
    }, 280);
  };

  // Open Form for Create
  const handleOpenAdd = () => {
    setEditingStudentId(null);
    setIsFormOpen(true);
  };

  // Open Form for Edit (pre-fills from GET /api/students/:id)
  const handleOpenEdit = (id: string) => {
    setEditingStudentId(id);
    setIsFormOpen(true);
  };

  // Open Confirmation Modal for Delete
  const handleOpenDelete = (student: Student) => {
    setDeletingStudent(student);
  };

  // Execute DELETE /api/students/:id
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);

    try {
      await api.deleteStudent(deletingStudent.id);
      addToast('success', `Student '${deletingStudent.firstName} ${deletingStudent.lastName}' was deleted.`);
      setDeletingStudent(null);
      fetchStudents(searchQuery);
    } catch (err: any) {
      const errInfo = api.extractErrorMessage(err);
      addToast('error', `Failed to delete student: ${errInfo.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form submission success
  const handleFormSuccess = (message: string) => {
    addToast('success', message);
    fetchStudents(searchQuery);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar Header */}
      <Header
        onAddNew={handleOpenAdd}
        onOpenDocs={() => setIsDocsOpen(true)}
        serverOnline={serverOnline}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Stats Overview */}
        <StatsBar students={students} />

        {/* Primary Student Directory List */}
        <StudentList
          students={students}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={() => fetchStudents(searchQuery)}
          onAddNew={handleOpenAdd}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onViewDetails={(student) => setViewingStudent(student)}
        />
      </main>

      {/* Create / Edit Student Modal */}
      <StudentForm
        isOpen={isFormOpen}
        studentId={editingStudentId}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudentId(null);
        }}
        onSuccess={handleFormSuccess}
        onError={(msg) => addToast('error', msg)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingStudent)}
        student={deletingStudent}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingStudent(null)}
      />

      {/* View Student Profile Modal */}
      <StudentDetailModal
        isOpen={Boolean(viewingStudent)}
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(id) => {
          setViewingStudent(null);
          handleOpenEdit(id);
        }}
      />

      {/* API Documentation & Postman Collection Modal */}
      <ApiDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
