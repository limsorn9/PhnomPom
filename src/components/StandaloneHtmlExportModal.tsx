import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { getDynamicAcademicYears, getCurrentAcademicYear } from '../data/initialData';
import {
  FileCode2,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code,
  ShieldCheck
} from 'lucide-react';

interface StandaloneHtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneHtmlExportModal: React.FC<StandaloneHtmlExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { schoolProfile, students, teachers, scores, appUsers, transfers, showToast } = useSchool();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateStandaloneHtml = () => {
    const rawData = JSON.stringify({
      schoolProfile,
      students,
      teachers,
      scores,
      appUsers,
      transfers
    }).replace(/</g, '\\u003c');

    const dynYears = getDynamicAcademicYears();
    const curYear = getCurrentAcademicYear();
    const yearOptionsHtml = [...dynYears].reverse().map(yr => `
      <option value="${yr}" ${yr === curYear ? 'selected' : ''}>${yr}</option>
    `).join('');

    return `<!DOCTYPE html>
<html lang="km" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schoolProfile.nameKhmer} - ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សារដ្ឋ</title>
  <!-- Google Fonts: Battambang, Moul, Kantumruy Pro -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Kantumruy+Pro:wght@400;600;700&family=Moul&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- QR Code & Excel Export Libraries -->
  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            battambang: ['Battambang', 'sans-serif'],
            moul: ['Moul', 'serif'],
            kantumruy: ['"Kantumruy Pro"', 'sans-serif'],
            sans: ['"Plus Jakarta Sans"', 'Battambang', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Battambang', 'Kantumruy Pro', sans-serif; }
    .font-moul { font-family: 'Moul', serif; }
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      body { background: white !important; color: black !important; }
      .print-page-break { page-break-after: always; break-after: page; }
    }
    .print-only { display: none; }
  </style>
</head>
<body class="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200">

  <!-- Main App Shell -->
  <div id="app-root" class="flex flex-col flex-1">
    <!-- Top Royal & School Bar -->
    <header class="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-white py-3 px-4 sm:px-6 shadow-md border-b border-indigo-900/60 no-print">
      <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 font-moul flex items-center justify-center text-xs shadow-md font-bold">
            អយក
          </div>
          <div>
            <h1 class="font-moul text-sm sm:text-base text-amber-300">${schoolProfile.nameKhmer}</h1>
            <p class="text-xs text-blue-200">ស្តង់ដារសាលាបឋមសិក្សាគំរូ • ឆ្នាំសិក្សា <span id="current-year-badge">${schoolProfile.academicYear}</span> • កូដ: ${schoolProfile.schoolCode}</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Role Switcher -->
          <div class="flex items-center gap-1.5 bg-blue-900/80 px-2.5 py-1 rounded-lg border border-blue-700/60 text-xs">
            <span class="text-slate-300">តួនាទី:</span>
            <select id="role-select" onchange="switchRole(this.value)" class="bg-blue-950 text-amber-300 font-bold rounded px-2 py-0.5 border border-blue-600 focus:outline-none">
              <option value="director">នាយកសាលា (Director / Superadmin)</option>
              <option value="secretary">លេខាធិការ (Secretary)</option>
              <option value="librarian">បណ្ណារក្ស (Librarian)</option>
              <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
              <option value="student">សិស្ស (Student)</option>
            </select>
          </div>

          <!-- Academic Year -->
          <select id="year-select" onchange="switchYear(this.value)" class="bg-blue-950 text-slate-200 text-xs font-bold rounded-lg px-2 py-1 border border-blue-700 focus:outline-none">
            ${yearOptionsHtml}
          </select>

          <!-- Language Switcher -->
          <button onclick="toggleLanguage()" class="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 rounded-lg text-xs font-bold border border-blue-700">
            <span id="lang-btn">KH / EN</span>
          </button>

          <!-- Dark Mode Toggle -->
          <button onclick="toggleDarkMode()" class="p-1.5 bg-blue-900 hover:bg-blue-800 rounded-lg text-amber-300 border border-blue-700">
            🌓
          </button>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 shadow-sm no-print sticky top-0 z-20">
      <div class="max-w-7xl mx-auto flex overflow-x-auto gap-2 py-2 text-xs font-bold">
        <button onclick="switchTab('dashboard')" id="tab-btn-dashboard" class="tab-nav px-3.5 py-2 rounded-xl bg-blue-700 text-white">📊 ផ្ទាំងព័ត៌មាន (Dashboard)</button>
        <button onclick="switchTab('students')" id="tab-btn-students" class="tab-nav px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">👨‍🎓 បញ្ជីសិស្ស (Students)</button>
        <button onclick="switchTab('scores')" id="tab-btn-scores" class="tab-nav px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">📝 ពិន្ទុ & និទ្ទេស (Scores)</button>
        <button onclick="switchTab('teachers')" id="tab-btn-teachers" class="tab-nav px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">👨‍🏫 គ្រូបង្រៀន (Teachers)</button>
        <button onclick="switchTab('transfers')" id="tab-btn-transfers" class="tab-nav px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">🔄 ផ្ទេរសិស្ស (Transfers)</button>
        <button onclick="switchTab('cards')" id="tab-btn-cards" class="tab-nav px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">🪪 ប័ណ្ណសិស្ស QR (ID Cards)</button>
        <button onclick="switchTab('gdrive')" id="tab-btn-gdrive" class="tab-nav px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">☁️ Google Drive (Cloud)</button>
      </div>
    </nav>

    <!-- Main Container Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
      
      <!-- TAB: DASHBOARD -->
      <section id="view-dashboard" class="tab-view space-y-6">
        <!-- Banner -->
        <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-800/60">
          <div class="flex flex-wrap items-center gap-2.5 mb-2">
            <span class="bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm">
              ✨ <span>ស្តង់ដារសាលាបឋមសិក្សាគំរូ</span>
            </span>
            <span class="text-blue-200 text-xs">ឆ្នាំសិក្សា <span class="current-year-txt">${schoolProfile.academicYear}</span></span>
          </div>
          <h2 class="font-moul text-xl sm:text-2xl text-amber-300">${schoolProfile.nameKhmer}</h2>
          <p class="text-slate-300 text-xs mt-1">នាយកសាលា៖ <strong>${schoolProfile.principalName}</strong> • ទូរស័ព្ទ៖ <strong>${schoolProfile.principalPhone}</strong> • ទីតាំង៖ ${schoolProfile.village} ${schoolProfile.commune} ${schoolProfile.district} ${schoolProfile.province}</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-xs font-bold text-slate-500">សិស្សសរុប</p>
            <p class="text-2xl font-bold text-blue-600 mt-1" id="stat-students-count">0 នាក់</p>
            <p class="text-[11px] text-slate-400" id="stat-girls-count">ស្រី 0 នាក់</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-xs font-bold text-slate-500">គ្រូបង្រៀន & បុគ្គលិក</p>
            <p class="text-2xl font-bold text-indigo-600 mt-1" id="stat-teachers-count">0 នាក់</p>
            <p class="text-[11px] text-slate-400" id="stat-teacher-girls-count">ស្រី 0 នាក់</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-xs font-bold text-slate-500">ថ្នាក់រៀន (កម្រិត ១-៦)</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">៦ បន្ទប់</p>
            <p class="text-[11px] text-slate-400">វេនព្រឹក & រសៀល</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-xs font-bold text-slate-500">ផ្ទេរសិស្ស (MoEYS)</p>
            <p class="text-2xl font-bold text-amber-600 mt-1" id="stat-transfers-count">0 ករណី</p>
            <p class="text-[11px] text-slate-400">ផ្ទេរចេញ/ផ្ទេរចូល</p>
          </div>
        </div>
      </section>

      <!-- TAB: STUDENTS -->
      <section id="view-students" class="tab-view hidden space-y-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 class="font-moul text-sm text-slate-800 dark:text-slate-100">បញ្ជីឈ្មោះសិស្សានុសិស្ស (MoEYS Registry)</h2>
              <p class="text-xs text-slate-500">ទិន្នន័យផ្លូវការតាមកម្រិតថ្នាក់</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="exportStudentsToExcel()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                📊 នាំចេញ Excel
              </button>
              <button onclick="openPrintModal('students')" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                🖨️ បោះពុម្ពបញ្ជី (Print)
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th class="px-3 py-2">#</th>
                  <th class="px-3 py-2">អត្តលេខ</th>
                  <th class="px-3 py-2">គោត្តនាម-នាម</th>
                  <th class="px-3 py-2">Name Latin</th>
                  <th class="px-3 py-2 text-center">ភេទ</th>
                  <th class="px-3 py-2 text-center">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th class="px-3 py-2 text-center">ថ្នាក់</th>
                  <th class="px-3 py-2">អាណាព្យាបាល</th>
                </tr>
              </thead>
              <tbody id="students-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB: SCORES -->
      <section id="view-scores" class="tab-view hidden space-y-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 class="font-moul text-sm text-slate-800 dark:text-slate-100">តារាងពិន្ទុ & ចំណាត់ថ្នាក់ (Dual Scoring & MoEYS Grading)</h2>
              <p class="text-xs text-slate-500">គណនាមធ្យមភាគ និងកម្រិតនិទ្ទេសផ្លូវការ (ល្អណាស់, ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ)</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="exportScoresToExcel()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                📊 នាំចេញ Excel
              </button>
              <button onclick="openPrintModal('scores')" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                🖨️ បោះពុម្ពពិន្ទុ (Print)
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th class="px-3 py-2">សិស្ស</th>
                  <th class="px-3 py-2">ខែ/ឆមាស</th>
                  <th class="px-2 py-2 text-center">អំណាន</th>
                  <th class="px-2 py-2 text-center">សំណេរ</th>
                  <th class="px-2 py-2 text-center font-bold text-blue-600">គណិត</th>
                  <th class="px-2 py-2 text-center">វិទ្យាសាស្ត្រ</th>
                  <th class="px-2 py-2 text-center">សីលធម៌</th>
                  <th class="px-2 py-2 text-center">សិល្បៈ</th>
                  <th class="px-3 py-2 text-center font-bold">មធ្យមភាគ</th>
                  <th class="px-2 py-2 text-center">និទ្ទេស</th>
                  <th class="px-2 py-2 text-center font-bold">ចំណាត់ថ្នាក់</th>
                </tr>
              </thead>
              <tbody id="scores-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB: TEACHERS -->
      <section id="view-teachers" class="tab-view hidden space-y-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 class="font-moul text-sm text-slate-800 dark:text-slate-100">បញ្ជីឈ្មោះលោកគ្រូ-អ្នកគ្រូ & បុគ្គលិក</h2>
            <button onclick="openPrintModal('teachers')" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold">
              🖨️ បោះពុម្ពបញ្ជីគ្រូ
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th class="px-3 py-2">#</th>
                  <th class="px-3 py-2">កូដគ្រូ</th>
                  <th class="px-3 py-2">ឈ្មោះ</th>
                  <th class="px-3 py-2">Name Latin</th>
                  <th class="px-3 py-2 text-center">ភេទ</th>
                  <th class="px-3 py-2">តួនាទី</th>
                  <th class="px-3 py-2 text-center">ថ្នាក់ទទួលបន្ទុក</th>
                  <th class="px-3 py-2">លេខទូរស័ព្ទ</th>
                </tr>
              </thead>
              <tbody id="teachers-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB: TRANSFERS -->
      <section id="view-transfers" class="tab-view hidden space-y-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 class="font-moul text-sm text-slate-800 dark:text-slate-100">កំណត់ត្រាផ្ទេរការសិក្សាសិស្ស (MoEYS Transfers)</h2>
            <button onclick="openPrintModal('transfers')" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold">
              🖨️ បោះពុម្ពកំណត់ត្រាផ្ទេរ
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th class="px-3 py-2">លេខលិខិត</th>
                  <th class="px-3 py-2">ប្រភេទ</th>
                  <th class="px-3 py-2">ឈ្មោះសិស្ស</th>
                  <th class="px-3 py-2">ថ្នាក់</th>
                  <th class="px-3 py-2">សាលាចាស់/ថ្មី</th>
                  <th class="px-3 py-2">កាលបរិច្ឆេទ</th>
                  <th class="px-3 py-2">មូលហេតុ</th>
                  <th class="px-3 py-2 text-center">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody id="transfers-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB: ID CARDS & QR -->
      <section id="view-cards" class="tab-view hidden space-y-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 class="font-moul text-sm text-slate-800 dark:text-slate-100">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស & QR Code (Batch A4 Sheet Layout)</h2>
              <p class="text-xs text-slate-500">គាំទ្រការបោះពុម្ព ៦, ៨ ឬ ១២ ប័ណ្ណក្នុងមួយសន្លឹក A4</p>
            </div>
            <div class="flex items-center gap-2">
              <select id="card-density-select" onchange="renderCards()" class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700">
                <option value="6">៦ ប័ណ្ណក្នុង ១សន្លឹក A4</option>
                <option value="8" selected>៨ ប័ណ្ណក្នុង ១សន្លឹក A4</option>
                <option value="12">១២ ប័ណ្ណក្នុង ១សន្លឹក A4</option>
              </select>
              <button onclick="window.print()" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold">
                🖨️ បោះពុម្ពប័ណ្ណ (Batch Print)
              </button>
            </div>
          </div>

          <!-- Cards Grid -->
          <div id="cards-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <!-- Cards rendered dynamically with QR codes -->
          </div>
        </div>
      </section>

      <!-- TAB: GOOGLE DRIVE CLOUD SYNC -->
      <section id="view-gdrive" class="tab-view hidden space-y-4">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
              ☁️
            </div>
            <div>
              <h2 class="font-moul text-base text-slate-800 dark:text-slate-100">ការភ្ជាប់ Google Drive & Cloud Synchronization</h2>
              <p class="text-xs text-slate-500">គណនីរក្សាទុកទិន្នន័យ៖ <strong class="text-blue-600 font-mono">limsorn9@gmail.com</strong></p>
            </div>
          </div>
          <div class="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-2">
            <p class="font-bold text-blue-950 dark:text-blue-200">✅ ព័ត៌មានស្តីពីការបម្រុងទុកទិន្នន័យស្វ័យប្រវត្តិ៖</p>
            <ul class="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
              <li>ទិន្នន័យសិស្ស គ្រូបង្រៀន ពិន្ទុ និងលិខិតផ្ទេរត្រូវបានរក្សាទុកក្នុង LocalStorage និងរៀបចំទម្រង់ Sync ទៅកាន់ Google Drive (Sheets & Drive API)។</li>
              <li>អ្នកប្រើប្រាស់អាចទាញយកឯកសារ Excel (UTF-8 BOM) និង PDF សម្រាប់ផ្ទុកផ្ទាល់ក្នុង Google Drive បានគ្រប់ពេលវេលា។</li>
            </ul>
          </div>
        </div>
      </section>

    </main>

    <!-- PRINT PREVIEW & OFFICIAL STAMP MODAL -->
    <div id="print-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="font-moul text-sm text-slate-800 dark:text-slate-100">ជម្រើសបោះពុម្ពផ្លូវការ (MoEYS Official Print)</h3>
          <button onclick="closePrintModal()" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div class="space-y-3 text-xs">
          <p class="text-slate-600 dark:text-slate-400 font-bold">ជ្រើសរើសព័ត៌មានដាក់បញ្ចូលក្នុងលិខិតបោះពុម្ព (ធីកដាក់ចូល ឬទទេរ)៖</p>
          
          <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer">
            <input type="checkbox" id="stamp-toggle" checked class="w-4 h-4 rounded text-blue-600">
            <div>
              <p class="font-bold text-slate-800 dark:text-slate-200">ត្រាមូលសាលា (Official School Round Stamp)</p>
              <p class="text-[11px] text-slate-500">បង្ហាញត្រាក្រហមផ្លូវការរបស់សាលាបឋមសិក្សា</p>
            </div>
          </label>

          <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer">
            <input type="checkbox" id="signature-toggle" checked class="w-4 h-4 rounded text-blue-600">
            <div>
              <p class="font-bold text-slate-800 dark:text-slate-200">ហត្ថលេខានាយក (Director Signature)</p>
              <p class="text-[11px] text-slate-500">បង្ហាញហត្ថលេខាបញ្ជាក់ដោយនាយកសាលា</p>
            </div>
          </label>

          <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer">
            <input type="checkbox" id="red-name-toggle" checked class="w-4 h-4 rounded text-blue-600">
            <div>
              <p class="font-bold text-rose-600 dark:text-rose-400">ឈ្មោះនាយកសរសេរជាទឹកថ្នាំក្រហម (Director Name in Red Ink)</p>
              <p class="text-[11px] text-slate-500">បង្ហាញឈ្មោះនាយកសាលាជាអក្សរពុម្ពក្រហមត្រឹមត្រូវ</p>
            </div>
          </label>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button onclick="closePrintModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold">បោះបង់</button>
          <button onclick="executeOfficialPrint()" class="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold">🖨️ បោះពុម្ពឥឡូវនេះ</button>
        </div>
      </div>
    </div>

    <!-- Official MoEYS Print Template (Hidden during screen viewing, shown when printing) -->
    <div id="official-print-container" class="print-only p-8 text-black text-xs space-y-6">
      <div class="flex justify-between items-start border-b border-black pb-4">
        <div>
          <p class="font-bold">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
          <p>មន្ទីរអប់រំ យុវជន និងកីឡា ${schoolProfile.province}</p>
          <p class="font-moul text-sm mt-1">${schoolProfile.nameKhmer}</p>
          <p class="text-[10px] font-mono">កូដសាលា៖ ${schoolProfile.schoolCode}</p>
        </div>
        <div class="text-right">
          <p class="font-bold">${schoolProfile.nameLatin}</p>
          <p>ឆ្នាំសិក្សា៖ <strong>${schoolProfile.academicYear}</strong></p>
          <p class="text-[10px]">កាលបរិច្ឆេទ៖ ${new Date().toLocaleDateString('km-KH')}</p>
        </div>
      </div>

      <div id="print-dynamic-content"></div>

      <!-- Stamp & Signature Block -->
      <div class="flex justify-between items-end pt-8">
        <div class="text-center w-48">
          <p class="font-bold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
          <p class="text-[11px]">ប្រធានការិយាល័យអប់រំ</p>
        </div>
        <div class="text-center w-64 space-y-1">
          <p class="text-[11px]">${schoolProfile.district}, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</p>
          <p class="font-bold">នាយកសាលាបឋមសិក្សា</p>
          <div class="h-20 flex items-center justify-center relative">
            <div id="print-stamp" class="w-16 h-16 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center text-[9px] font-bold rotate-[-12deg] opacity-90 absolute">
              ត្រាសាលា
            </div>
            <div id="print-signature" class="font-serif italic text-blue-900 text-sm font-bold z-10">
              [ហត្ថលេខា]
            </div>
          </div>
          <p id="print-director-name" class="font-bold text-red-600">${schoolProfile.principalName}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 px-6 text-center text-xs text-slate-500 no-print">
      <p>© ${schoolProfile.nameKhmer} • ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS Standard) • Google Cloud Sync: <span class="font-mono text-blue-600">limsorn9@gmail.com</span></p>
    </footer>
  </div>

  <!-- Inline App Engine Script -->
  <script>
    // Embedded initial data
    const DATA = ${rawData};
    let currentRole = 'director';
    let currentYear = '${schoolProfile.academicYear}';
    let currentLang = 'km';

    function initApp() {
      renderStats();
      renderStudents();
      renderScores();
      renderTeachers();
      renderTransfers();
      renderCards();
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-nav').forEach(el => {
        el.classList.remove('bg-blue-700', 'text-white');
        el.classList.add('text-slate-600', 'dark:text-slate-300');
      });

      const activeView = document.getElementById('view-' + tabId);
      const activeBtn = document.getElementById('tab-btn-' + tabId);
      if (activeView) activeView.classList.remove('hidden');
      if (activeBtn) {
        activeBtn.classList.add('bg-blue-700', 'text-white');
        activeBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
      }
    }

    function switchRole(role) {
      currentRole = role;
      alert('បានប្តូរទៅកាន់តួនាទី៖ ' + role);
    }

    function switchYear(year) {
      currentYear = year;
      document.getElementById('current-year-badge').innerText = year;
      document.querySelectorAll('.current-year-txt').forEach(el => el.innerText = year);
    }

    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
    }

    function toggleLanguage() {
      currentLang = currentLang === 'km' ? 'en' : 'km';
      document.getElementById('lang-btn').innerText = currentLang === 'km' ? 'KH / EN' : 'EN / KH';
    }

    function renderStats() {
      document.getElementById('stat-students-count').innerText = DATA.students.length + ' នាក់';
      document.getElementById('stat-girls-count').innerText = 'ស្រី ' + DATA.students.filter(s => s.gender === 'F').length + ' នាក់';
      document.getElementById('stat-teachers-count').innerText = DATA.teachers.length + ' នាក់';
      document.getElementById('stat-teacher-girls-count').innerText = 'ស្រី ' + DATA.teachers.filter(t => t.gender === 'F').length + ' នាក់';
      document.getElementById('stat-transfers-count').innerText = DATA.transfers.length + ' ករណី';
    }

    function renderStudents() {
      const tbody = document.getElementById('students-table-body');
      if (!tbody) return;
      tbody.innerHTML = DATA.students.map((s, idx) => \`
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="px-3 py-2 font-mono">\${idx + 1}</td>
          <td class="px-3 py-2 font-mono font-bold text-blue-600">\${s.code}</td>
          <td class="px-3 py-2 font-bold">\${s.nameKhmer}</td>
          <td class="px-3 py-2 font-mono">\${s.nameLatin}</td>
          <td class="px-3 py-2 text-center font-bold \${s.gender === 'F' ? 'text-rose-600' : 'text-blue-600'}">\${s.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</td>
          <td class="px-3 py-2 text-center font-mono">\${s.dob}</td>
          <td class="px-3 py-2 text-center font-bold text-purple-600">\${s.grade}\${s.section}</td>
          <td class="px-3 py-2">\${s.guardianName} (\${s.guardianPhone})</td>
        </tr>
      \`).join('');
    }

    function renderScores() {
      const tbody = document.getElementById('scores-table-body');
      if (!tbody) return;
      tbody.innerHTML = DATA.scores.map(sc => \`
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="px-3 py-2 font-bold">\${sc.studentNameKhmer}</td>
          <td class="px-3 py-2">\${sc.monthOrSemester}</td>
          <td class="px-2 py-2 text-center">\${sc.scores.khmerReading}</td>
          <td class="px-2 py-2 text-center">\${sc.scores.khmerWriting}</td>
          <td class="px-2 py-2 text-center font-bold text-blue-600">\${sc.scores.mathematics}</td>
          <td class="px-2 py-2 text-center">\${sc.scores.scienceSocial}</td>
          <td class="px-2 py-2 text-center">\${sc.scores.moralCivics}</td>
          <td class="px-2 py-2 text-center">\${sc.scores.artsPhysical}</td>
          <td class="px-3 py-2 text-center font-bold text-slate-900 dark:text-slate-100">\${sc.averageScore}</td>
          <td class="px-2 py-2 text-center"><span class="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-bold px-2 py-0.5 rounded">\${sc.gradeLetter}</span></td>
          <td class="px-2 py-2 text-center font-bold text-purple-600">លេខ \${sc.rank}</td>
        </tr>
      \`).join('');
    }

    function renderTeachers() {
      const tbody = document.getElementById('teachers-table-body');
      if (!tbody) return;
      tbody.innerHTML = DATA.teachers.map((t, idx) => \`
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="px-3 py-2 font-mono">\${idx + 1}</td>
          <td class="px-3 py-2 font-mono text-indigo-600 font-bold">\${t.teacherCode}</td>
          <td class="px-3 py-2 font-bold">\${t.nameKhmer}</td>
          <td class="px-3 py-2 font-mono">\${t.nameLatin}</td>
          <td class="px-3 py-2 text-center font-bold \${t.gender === 'F' ? 'text-rose-600' : 'text-blue-600'}">\${t.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</td>
          <td class="px-3 py-2">\${t.roleTitle}</td>
          <td class="px-3 py-2 text-center font-bold text-blue-600">\${t.homeroomGrade ? t.homeroomGrade + t.homeroomSection : '-'}</td>
          <td class="px-3 py-2 font-mono">\${t.phone}</td>
        </tr>
      \`).join('');
    }

    function renderTransfers() {
      const tbody = document.getElementById('transfers-table-body');
      if (!tbody) return;
      tbody.innerHTML = DATA.transfers.map(tr => \`
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="px-3 py-2 font-mono font-bold text-blue-600">\${tr.transferNumber}</td>
          <td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold \${tr.type === 'out' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">\${tr.type === 'out' ? 'ផ្ទេរចេញ' : 'ផ្ទេរចូល'}</span></td>
          <td class="px-3 py-2 font-bold">\${tr.studentNameKhmer}</td>
          <td class="px-3 py-2 font-mono">ថ្នាក់ទី \${tr.grade}\${tr.section}</td>
          <td class="px-3 py-2">\${tr.type === 'out' ? tr.destinationSchool : tr.previousSchool}</td>
          <td class="px-3 py-2 font-mono">\${tr.requestDate}</td>
          <td class="px-3 py-2">\${tr.reason}</td>
          <td class="px-3 py-2 text-center"><span class="px-2 py-0.5 rounded font-bold \${tr.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">\${tr.status === 'completed' ? 'អនុម័ត' : 'រង់ចាំ'}</span></td>
        </tr>
      \`).join('');
    }

    function renderCards() {
      const container = document.getElementById('cards-container');
      if (!container) return;
      container.innerHTML = '';

      DATA.students.slice(0, 12).forEach((s, idx) => {
        const card = document.createElement('div');
        card.className = "border-2 border-blue-900 dark:border-blue-700 rounded-2xl p-3.5 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-900 text-xs shadow-sm flex flex-col justify-between";
        card.innerHTML = \`
          <div class="text-center border-b border-blue-200 dark:border-blue-800 pb-1.5">
            <p class="font-moul text-[10px] text-blue-950 dark:text-blue-300">\${DATA.schoolProfile.nameKhmer}</p>
            <p class="text-[9px] text-slate-500">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស • Student Card</p>
          </div>
          <div class="flex gap-2.5 items-center my-2">
            <div class="w-12 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
              រូបថត
            </div>
            <div class="space-y-0.5">
              <p class="font-bold text-blue-900 dark:text-blue-200 text-xs">\${s.nameKhmer}</p>
              <p class="font-mono text-[10px] text-slate-500">\${s.nameLatin}</p>
              <p class="text-[10px]">អត្តលេខ៖ <span class="font-mono font-bold text-blue-700 dark:text-blue-300">\${s.code}</span></p>
              <p class="text-[10px]">ថ្នាក់៖ <strong class="text-purple-600">\${s.grade}\${s.section}</strong> • ភេទ៖ \${s.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</p>
            </div>
          </div>
          <div class="flex items-center justify-between border-t border-blue-100 dark:border-blue-900 pt-1.5">
            <div id="qrcode-\${idx}" class="w-9 h-9 flex items-center justify-center"></div>
            <div class="text-right text-[9px] text-slate-400">
              <p>ឆ្នាំសិក្សា \${DATA.schoolProfile.academicYear}</p>
              <p class="font-mono text-emerald-600 font-bold">QR Verified</p>
            </div>
          </div>
        \`;
        container.appendChild(card);

        // Generate QR Code
        setTimeout(() => {
          const qrElem = document.getElementById('qrcode-' + idx);
          if (qrElem && window.QRCode) {
            qrElem.innerHTML = '';
            new QRCode(qrElem, {
              text: 'STUDENT:' + s.code + '|' + s.nameKhmer,
              width: 36,
              height: 36,
              colorDark: '#0f172a',
              colorLight: '#ffffff'
            });
          }
        }, 100);
      });
    }

    function openPrintModal(type) {
      const modal = document.getElementById('print-modal');
      if (modal) modal.classList.remove('hidden');
      if (modal) modal.classList.add('flex');
    }

    function closePrintModal() {
      const modal = document.getElementById('print-modal');
      if (modal) modal.classList.add('hidden');
      if (modal) modal.classList.remove('flex');
    }

    function executeOfficialPrint() {
      const stampChecked = document.getElementById('stamp-toggle').checked;
      const sigChecked = document.getElementById('signature-toggle').checked;
      const redNameChecked = document.getElementById('red-name-toggle').checked;

      document.getElementById('print-stamp').style.display = stampChecked ? 'flex' : 'none';
      document.getElementById('print-signature').style.display = sigChecked ? 'block' : 'none';
      
      const dirNameElem = document.getElementById('print-director-name');
      if (redNameChecked) {
        dirNameElem.className = 'font-bold text-red-600';
      } else {
        dirNameElem.className = 'font-bold text-black';
      }

      // Copy current student table into print content
      const contentElem = document.getElementById('print-dynamic-content');
      contentElem.innerHTML = document.getElementById('view-students').innerHTML;

      closePrintModal();
      window.print();
    }

    function exportStudentsToExcel() {
      const rows = [
        ['ក្រសួងអប់រំ យុវជន និងកីឡា', '', '', '', DATA.schoolProfile.nameKhmer],
        ['សាលាបឋមសិក្សា៖ ' + DATA.schoolProfile.nameKhmer, '', '', 'ឆ្នាំសិក្សា៖ ' + DATA.schoolProfile.academicYear],
        [],
        ['ល.រ', 'អត្តលេខ', 'គោត្តនាម-នាម', 'Name Latin', 'ភេទ', 'ថ្ងៃខែឆ្នាំកំណើត', 'ថ្នាក់', 'អាណាព្យាបាល', 'ទូរស័ព្ទ']
      ];
      DATA.students.forEach((s, idx) => {
        rows.push([idx + 1, s.code, s.nameKhmer, s.nameLatin, s.gender === 'F' ? 'ស្រី' : 'ប្រុស', s.dob, s.grade + s.section, s.guardianName, s.guardianPhone]);
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "បញ្ជីសិស្ស");
      XLSX.writeFile(wb, "Student_Registry_" + DATA.schoolProfile.schoolCode + ".xlsx");
    }

    function exportScoresToExcel() {
      const rows = [
        ['ក្រសួងអប់រំ យុវជន និងកីឡា', '', '', '', DATA.schoolProfile.nameKhmer],
        ['តារាងពិន្ទុ & ចំណាត់ថ្នាក់', '', '', 'ឆ្នាំសិក្សា៖ ' + DATA.schoolProfile.academicYear],
        [],
        ['សិស្ស', 'ខែ/ឆមាស', 'អំណាន', 'សំណេរ', 'គណិត', 'វិទ្យាសាស្ត្រ', 'សីលធម៌', 'សិល្បៈ', 'មធ្យមភាគ', 'និទ្ទេស', 'ចំណាត់ថ្នាក់']
      ];
      DATA.scores.forEach(sc => {
        rows.push([sc.studentNameKhmer, sc.monthOrSemester, sc.scores.khmerReading, sc.scores.khmerWriting, sc.scores.mathematics, sc.scores.scienceSocial, sc.scores.moralCivics, sc.scores.artsPhysical, sc.averageScore, sc.gradeLetter, sc.rank]);
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "តារាងពិន្ទុ");
      XLSX.writeFile(wb, "Scores_Report_" + DATA.schoolProfile.schoolCode + ".xlsx");
    }

    // Auto initialize on load
    window.addEventListener('DOMContentLoaded', initApp);
  </script>
</body>
</html>`;
  };

  const handleDownload = () => {
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moeys_school_management_${schoolProfile.schoolCode}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('បានទាញយកឯកសារ Single-File HTML ដោយជោគជ័យ!');
  };

  const handleCopyCode = () => {
    const htmlContent = generateStandaloneHtml();
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    showToast('បានចម្លងកូដ HTML ទៅ Clipboard រួចរាល់!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-battambang">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-sm text-slate-800">
                ទាញយកជា Single-File HTML / Standalone Web App
              </h3>
              <p className="text-[11px] text-slate-500 font-battambang">
                Cambodian Public Primary School Management System (Standalone Package)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-700">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-blue-950">
                លក្ខណៈពិសេសនៃឯកសារ Single-File Standalone HTML៖
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11.5px]">
                <li>រចនាសម្ព័ន្ធឯករាជ្យ Single-File អាចដំណើរការដោយផ្ទាល់ក្នុង Browser គ្រប់ប្រភេទដោយមិនបាច់ដំឡើង Server</li>
                <li>ភ្ជាប់មកជាមួយ Font ខ្មែរ (Moul, Battambang, Kantumruy Pro) និងពុម្ពអក្សរ Times New Roman</li>
                <li>មានទិន្នន័យស្រង់ពិន្ទុ ៦មុខវិជ្ជាស្នូល និងបញ្ជីសិស្សតាមកម្រិតថ្នាក់ MoEYS</li>
                <li>គាំទ្រការបោះពុម្ព Print Friendly (របាយការណ៍សាលា និងប័ណ្ណសិស្ស)</li>
              </ul>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-slate-200 font-mono text-[11px] max-h-48 overflow-y-auto">
            <p className="text-slate-500">// Previewing Standalone Single-File HTML Code Structure...</p>
            <p className="text-emerald-400">&lt;!DOCTYPE html&gt;</p>
            <p className="text-blue-300">&lt;html lang="km"&gt;</p>
            <p className="pl-2 text-slate-400">&lt;head&gt; ... &lt;title&gt;${schoolProfile.nameKhmer}&lt;/title&gt; ... &lt;/head&gt;</p>
            <p className="pl-2 text-amber-300">&lt;body class="bg-slate-100 font-battambang"&gt;</p>
            <p className="pl-4 text-slate-300">&lt;!-- MoEYS Primary School Management Dashboard --&gt;</p>
            <p className="pl-4 text-slate-400">&lt;!-- Student Directory, Scores & RBAC Structure --&gt;</p>
            <p className="pl-2 text-amber-300">&lt;/body&gt;</p>
            <p className="text-blue-300">&lt;/html&gt;</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'បានចម្លងរួចរាល់!' : 'ចម្លងកូដ HTML'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              បិទ
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយកឯកសារ (.html)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
