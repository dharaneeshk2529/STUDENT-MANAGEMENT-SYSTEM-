import React from 'react';
import { Users, GraduationCap, Clock, CalendarDays } from 'lucide-react';
import { Student } from '../types.js';

interface StatsBarProps {
  students: Student[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ students }) => {
  const totalStudents = students.length;
  const uniqueCourses = new Set(students.map((s) => s.course.trim().toLowerCase())).size;
  const averageAge =
    totalStudents > 0
      ? (students.reduce((acc, s) => acc + (Number(s.age) || 0), 0) / totalStudents).toFixed(1)
      : '0';

  const sortedByDate = [...students].sort(
    (a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
  );
  const latestEnrollment = sortedByDate.length > 0 ? sortedByDate[0].enrollmentDate : 'None';

  return (
    <div id="student-system-stats-bar" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Total Students</span>
          <span id="stat-total-students" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalStudents}
          </span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Courses Enrolled</span>
          <span id="stat-total-courses" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {uniqueCourses}
          </span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Average Age</span>
          <span id="stat-average-age" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {averageAge} <span className="text-xs font-normal text-zinc-500">yrs</span>
          </span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Latest Enrollee</span>
          <span id="stat-latest-date" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {latestEnrollment}
          </span>
        </div>
      </div>
    </div>
  );
};
