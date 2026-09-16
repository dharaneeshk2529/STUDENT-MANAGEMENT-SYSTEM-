import React, { useState } from 'react';
import { X, Code2, Download, Copy, Check, FileJson, Server } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPostman = () => {
    fetch('/postman_collection.json')
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student-management-postman-collection.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => {
        alert('Downloading collection...');
      });
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/students',
      status: '201 Created / 400 Bad Request',
      description: 'Create a new student with server-side validation & duplicate check',
      sampleCurl: `curl -X POST http://localhost:3000/api/students \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"Maya","lastName":"Lin","email":"maya.lin@university.edu","rollNumber":"CS-2024-900","course":"Computer Science","age":21,"enrollmentDate":"2024-09-01"}'`,
    },
    {
      method: 'GET',
      path: '/api/students?search=...',
      status: '200 OK',
      description: 'List all students with optional search filtering by name or rollNumber',
      sampleCurl: `curl http://localhost:3000/api/students?search=Alexander`,
    },
    {
      method: 'GET',
      path: '/api/students/:id',
      status: '200 OK / 404 Not Found',
      description: 'Retrieve a single student record by Firestore document ID',
      sampleCurl: `curl http://localhost:3000/api/students/std-seed-101`,
    },
    {
      method: 'PUT',
      path: '/api/students/:id',
      status: '200 OK / 400 Bad Request / 404 Not Found',
      description: 'Full update of an existing student with server-side validation & duplicate check',
      sampleCurl: `curl -X PUT http://localhost:3000/api/students/std-seed-101 \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"Alexander","lastName":"Wright","email":"alex.wright@university.edu","rollNumber":"CS-2024-001","course":"Data Science","age":22,"enrollmentDate":"2024-09-01"}'`,
    },
    {
      method: 'DELETE',
      path: '/api/students/:id',
      status: '204 No Content / 404 Not Found',
      description: 'Permanently delete a student record by Firestore document ID',
      sampleCurl: `curl -X DELETE http://localhost:3000/api/students/std-seed-101`,
    },
  ];

  return (
    <div
      id="api-docs-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="api-docs-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-docs-title"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 id="api-docs-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                REST API &amp; Postman Collection
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Firebase Cloud Functions backend specifications &amp; endpoints
              </p>
            </div>
          </div>

          <button
            id="close-api-docs-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close API docs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Postman Collection Download Banner */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  Ready-to-Use Postman Collection
                </h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Includes all 12 test cases with automated assertions &amp; error validation
                </p>
              </div>
            </div>
            <button
              id="download-postman-collection-btn"
              type="button"
              onClick={handleDownloadPostman}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Endpoints List */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Cloud Functions REST Endpoints
            </h3>

            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md font-mono ${
                        ep.method === 'POST'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : ep.method === 'GET'
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                          : ep.method === 'PUT'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {ep.path}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {ep.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400">{ep.description}</p>

                <div className="relative group">
                  <pre className="p-3 bg-zinc-900 text-zinc-200 rounded-lg text-xs font-mono overflow-x-auto">
                    {ep.sampleCurl}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ep.sampleCurl, idx)}
                    className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
                    title="Copy curl"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 px-6 bg-zinc-50 dark:bg-zinc-850 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            id="close-api-docs-footer-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
