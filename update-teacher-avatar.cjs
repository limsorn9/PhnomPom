const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherManagement.tsx', 'utf-8');

// Update validation
content = content.replace(
  /avatarUrl: formData.gender === 'F'/g,
  `avatarUrl: formData.avatarUrl && formData.avatarUrl.trim() !== '' ? formData.avatarUrl : formData.gender === 'F'`
);

// Add Avatar URL field to teacher form
content = content.replace(
  /<div>\s*<label className="block font-bold text-slate-700 mb-1">មុខជំនាញ<\/label>\s*<input\s*type="text"\s*name="specialty"/,
  `<div>
                            <label className="block font-bold text-slate-700 mb-1">
                              តំណរូបថត (Image URL) <span className="text-slate-400 font-normal">(ជាជម្រើស)</span>
                            </label>
                            <input
                              type="url"
                              name="avatarUrl"
                              value={formData.avatarUrl || ''}
                              onChange={handleInputChange}
                              placeholder="https://example.com/photo.jpg"
                              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">មុខជំនាញ</label>
                            <input
                              type="text"
                              name="specialty"`
);

fs.writeFileSync('src/components/TeacherManagement.tsx', content);
