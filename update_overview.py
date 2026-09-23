import re

with open('src/components/HomeroomTeacherDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("{activeTabSub === 'overview' && (")
end_idx = content.find("{/* VIEW B: CLASS & STUDENT ROSTER (ថ្នាក់ និងសិស្ស) */}")

if start_idx != -1 and end_idx != -1:
    new_overview = """{activeTabSub === 'overview' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* 1. WELCOME BLOCK (ប្លុកស្វាគមន៍ខាងលើ) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">សួស្ដី លោកគ្រូ {currentTeacher?.nameKhmer || 'លីម សន'}</h2>
                <p className="text-xs md:text-sm text-emerald-400 font-medium mt-1">ថ្នាក់ទី{selectedGrade}{selectedSection} · សិស្ស {totalStudents} នាក់</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-center min-w-[120px]">
                  <p className="text-[10px] text-slate-400 uppercase mb-1">សិស្ស</p>
                  <p className="font-bold text-xl text-slate-100">{totalStudents}</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-1">ក្នុងថ្នាក់របស់អ្នក</p>
                </div>
                <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-center min-w-[120px]">
                  <p className="text-[10px] text-slate-400 uppercase mb-1">ថ្ងៃនេះ</p>
                  <p className="font-bold text-xl text-amber-400">រង់ចាំ</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-1">ត្រូវកត់វត្តមាន</p>
                </div>
              </div>
            </div>

            {/* 2. TODAY'S TASKS (ប្លុក «កិច្ចការថ្ងៃនេះ») */}
            <div>
              <div className="mb-4">
                <h3 className="text-slate-100 font-bold text-lg">កិច្ចការថ្ងៃនេះ</h3>
                <p className="text-slate-400 text-xs">រឿងសំខាន់ៗដែលគ្រូត្រូវពិនិត្យថ្ងៃនេះ</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task A: Attendance */}
                <div 
                  onClick={() => setActiveTabSub('attendance')}
                  className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl cursor-pointer hover:bg-[#10323a] transition-colors flex items-start gap-4 group"
                >
                  <div className="bg-amber-500 text-slate-950 p-3 rounded-xl shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-bold text-base mb-1">វត្តមានថ្ងៃនេះ</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">មិនទាន់កត់ · ចុចដើម្បីកត់</p>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Task B: Grades */}
                <div 
                  onClick={() => setActiveTabSub('grades')}
                  className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl cursor-pointer hover:bg-[#10323a] transition-colors flex items-start gap-4 group"
                >
                  <div className="bg-emerald-500 text-slate-950 p-3 rounded-xl shrink-0">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-bold text-base mb-1">ពិន្ទុខែនេះ</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm">0 / {totalStudents} នាក់បានបញ្ចូល</p>
                        <span className="bg-emerald-950/60 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/60 text-xs font-bold">0 %</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. QUICK SHORTCUTS GRID (ប្លុក «ផ្លូវកាត់») */}
            <div className="pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActiveTabSub('grades')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">📝 ពិន្ទុខែ</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => setActiveTabSub('attendance')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">📅 វត្តមាន</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => setActiveTabSub('ranking')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">📊 លទ្ធផល</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => setActiveTabSub('roster')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">👥 សិស្ស</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* 4. SCHOOL INFO BANNER (ប័ណ្ណណែនាំសាលា) */}
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center text-xs text-emerald-300 mt-8 gap-2 text-center md:text-left">
              <p>សាលាបឋមសិក្សាភ្នំពុំ · ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង · កូដ: {schoolProfile.schoolId || '02100108027'} · នាយក: លោក លីម សន</p>
            </div>
          </div>
        )}\n      """
    content = content[:start_idx] + new_overview + content[end_idx:]
    with open('src/components/HomeroomTeacherDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced overview block successfully!')
else:
    print('Failed to find start or end block!')
