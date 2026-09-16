import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  UserX,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Mail,
  Hash,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { Student } from '../types.js';

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onAddNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (student: Student) => void;
  onViewDetails: (student: Student) => void;
}

type SortField = 'name' | 'rollNumber' | 'course' | 'age' | 'date';

export const StudentList: React.FC<StudentListProps> = ({
  students,
  isLoading,
  searchQuery,
  onSearchChange,
  onRefresh,
  onAddNew,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Sorting
  const sortedStudents = [...students].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      cmp = nameA.localeCompare(nameB);
    } else if (sortField === 'rollNumber') {
      cmp = a.rollNumber.localeCompare(b.rollNumber);
    } else if (sortField === 'course') {
      cmp = a.course.localeCompare(b.course);
    } else if (sortField === 'age') {
      cmp = Number(a.age) - Number(b.age);
    } else if (sortField === 'date') {
      cmp = new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime();
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const isSearchActive = searchQuery.trim().length > 0;
  const isNoResults = isSearchActive && students.length === 0 && !isLoading;
  const isEmptyDatabase = !isSearchActive && students.length === 0 && !isLoading;

  return (
    <div id="student-list-container" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Controls Bar: Search, View Toggle, Refresh, Add */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input with live API query trigger */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="student-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, roll number, course, or email..."
            className="w-full pl-10 pr-10 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-colors"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* View toggles and actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Refresh button */}
          <button
            id="refresh-students-btn"
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Reload from API"
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              id="view-mode-table-btn"
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              aria-label="Table view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              id="view-mode-grid-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Add Student CTA */}
          <button
            id="add-student-header-btn"
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div id="students-loading-state" className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Fetching student records from Cloud Functions...
          </p>
        </div>
      ) : isEmptyDatabase ? (
        <div id="students-empty-database-state" className="py-20 px-6 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Students Registered
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            The Firestore database currently has no student records. Enroll your first student to get started.
          </p>
          <button
            id="empty-state-add-student-btn"
            type="button"
            onClick={onAddNew}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll First Student</span>
          </button>
        </div>
      ) : isNoResults ? (
        <div id="students-no-results-state" className="py-16 px-6 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Matching Students
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            No students found matching &ldquo;<span className="font-semibold text-zinc-700 dark:text-zinc-300">{searchQuery}</span>&rdquo;.
          </p>
          <button
            id="reset-search-btn"
            type="button"
            onClick={() => onSearchChange('')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto">
          <table id="students-data-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th scope="col" className="py-3.5 pl-6 pr-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('rollNumber')}
                    className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <span>Roll No</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('course')}
                    className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <span>Course</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('age')}
                    className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-4 hidden md:table-cell">
                  Email Address
                </th>
                <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">
                  <button
                    type="button"
                    onClick={() => toggleSort('date')}
                    className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <span>Enrolled</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-6 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              {sortedStudents.map((student) => (
                <tr
                  key={student.id}
                  id={`student-row-${student.id}`}
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono md:hidden">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">
                      {student.rollNumber}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-zinc-700 dark:text-zinc-300">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/40">
                      {student.course}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-zinc-700 dark:text-zinc-300">
                    {student.age} yrs
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 hidden md:table-cell truncate max-w-[200px]" title={student.email}>
                    {student.email}
                  </td>
                  <td className="py-4 px-4 text-xs text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">
                    {student.enrollmentDate}
                  </td>
                  <td className="py-4 pl-4 pr-6 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        id={`view-student-${student.id}`}
                        type="button"
                        onClick={() => onViewDetails(student)}
                        title="View Full Profile"
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        aria-label="View student details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        id={`edit-student-${student.id}`}
                        type="button"
                        onClick={() => onEdit(student.id)}
                        title="Edit Student"
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                        aria-label="Edit student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-student-${student.id}`}
                        type="button"
                        onClick={() => onDelete(student)}
                        title="Delete Student"
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                        aria-label="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div id="students-grid-cards" className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStudents.map((student) => (
            <div
              key={student.id}
              id={`student-card-${student.id}`}
              className="p-5 bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {student.firstName} {student.lastName}
                      </h4>
                      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {student.rollNumber}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                    {student.age} yrs
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{student.course}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-mono truncate">
                    <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Enrolled: {student.enrollmentDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <button
                  id={`card-view-student-${student.id}`}
                  type="button"
                  onClick={() => onViewDetails(student)}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <div className="flex items-center gap-2">
                  <button
                    id={`card-edit-student-${student.id}`}
                    type="button"
                    onClick={() => onEdit(student.id)}
                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                    aria-label="Edit student"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`card-delete-student-${student.id}`}
                    type="button"
                    onClick={() => onDelete(student)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                    aria-label="Delete student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer info showing record counts */}
      {!isLoading && students.length > 0 && (
        <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>
            Showing <strong className="text-zinc-700 dark:text-zinc-300">{sortedStudents.length}</strong> of{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">{students.length}</strong> students
          </span>
          <span className="hidden sm:inline">
            REST API &bull; Firestore Database &bull; Cloud Functions
          </span>
        </div>
      )}
    </div>
  );
};
