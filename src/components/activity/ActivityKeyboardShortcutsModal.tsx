import React from 'react';
import { Keyboard, X, ArrowUp, ArrowDown, CornerDownLeft, Space, Trash2, CheckSquare, Layers, Eye, GitCompare } from 'lucide-react';

interface ActivityKeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityKeyboardShortcutsModal: React.FC<ActivityKeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      keys: ['↓', 'j'],
      description: 'រំកិលទៅកាន់កំណត់ត្រាបន្ទាប់ (Navigate Down)',
      icon: <ArrowDown className="w-4 h-4 text-blue-500" />
    },
    {
      keys: ['↑', 'k'],
      description: 'រំកិលទៅកាន់កំណត់ត្រាមុន (Navigate Up)',
      icon: <ArrowUp className="w-4 h-4 text-blue-500" />
    },
    {
      keys: ['Enter'],
      description: 'បើកទិដ្ឋភាពប្រៀបធៀបកំណែទិន្នន័យ (Open Diff View)',
      icon: <GitCompare className="w-4 h-4 text-indigo-500" />
    },
    {
      keys: ['Space'],
      description: 'គូសធីក ឬដកធីក Checkbox លើជួរដែលកំពុងជ្រើស (Toggle Checkbox)',
      icon: <CheckSquare className="w-4 h-4 text-emerald-500" />
    },
    {
      keys: ['v'],
      description: 'បើកផ្ទាំងព័ត៌មានលម្អិតនៃសកម្មភាព (View Details)',
      icon: <Eye className="w-4 h-4 text-cyan-500" />
    },
    {
      keys: ['Ctrl', 'A'],
      description: 'ជ្រើសរើសកំណត់ត្រាទាំងអស់ (Select All Rows)',
      icon: <Layers className="w-4 h-4 text-purple-500" />
    },
    {
      keys: ['Delete'],
      description: 'លុបកំណត់ត្រាដែលបានជ្រើសរើស (Delete Selected)',
      icon: <Trash2 className="w-4 h-4 text-rose-500" />
    },
    {
      keys: ['Escape'],
      description: 'បោះបង់ការជ្រើសរើស / បិទផ្ទាំង Dialog (Clear / Close)',
      icon: <X className="w-4 h-4 text-slate-500" />
    },
    {
      keys: ['?'],
      description: 'បង្ហាញផ្ទាំងជំនួយគ្រាប់ចុចកាត់នេះ (Show Shortcuts Guide)',
      icon: <Keyboard className="w-4 h-4 text-amber-500" />
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-moul text-white">
                គ្រាប់ចុចកាត់រហ័ស (Keyboard Shortcuts)
              </h3>
              <p className="text-[11px] text-slate-300">
                ជួយសម្រួលដល់ការងារសវនកម្មទិន្នន័យឱ្យកាន់តែលឿន
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-slate-700 font-kantumruy">
                  {item.description}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {item.keys.map((k, kIdx) => (
                  <React.Fragment key={kIdx}>
                    <kbd className="px-2.5 py-1 text-[11px] font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded-md shadow-2xs">
                      {k}
                    </kbd>
                    {kIdx < item.keys.length - 1 && (
                      <span className="text-xs text-slate-400 font-bold">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>ចុច <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-[10px]">Esc</kbd> ដើម្បីបិទ</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            យល់ព្រម
          </button>
        </div>
      </div>
    </div>
  );
};
