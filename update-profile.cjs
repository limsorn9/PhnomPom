const fs = require('fs');
let content = fs.readFileSync('src/components/UserProfileSettingsModal.tsx', 'utf-8');

// Update validation
content = content.replace(
  /\{!isStudent && \([\s\S]*?អ្នកអាចដាក់ URL រូបថតផ្ទាល់ខ្លួនរបស់អ្នកនៅទីនេះ។<\/p>\s*<\/div>\s*\)\}/,
  `{(!isStudent && currentUser.role === 'director') && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    តំណរូបថត (Avatar Image URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center gap-1">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">នាយកសាលាអាចដាក់ URL រូបថតបាន។</p>
                </div>
              )}
              {isStudent && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>ចំពោះគណនីសិស្ស មិនអាចប្តូររូបថតបានតាមចិត្តទេ។ រូបថតត្រូវបានគ្រប់គ្រងដោយគ្រូបន្ទុកថ្នាក់។</span>
                </div>
              )}
              {(!isStudent && currentUser.role !== 'director') && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>ការប្តូររូបថតផ្ទាល់ខ្លួនត្រូវបានកម្រិត។ សូមទាក់ទងនាយកសាលា។</span>
                </div>
              )}`
);

fs.writeFileSync('src/components/UserProfileSettingsModal.tsx', content);
