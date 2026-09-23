import React from 'react';
import { X, User, Briefcase, Package, Users, MapPin, School, FileText, Fingerprint } from 'lucide-react';
import { Teacher } from '../../types';

interface TeacherDetailModalProps {
  teacher: any; // Using any or expanding Teacher type for the mock data
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({ teacher, onClose }) => {
  if (!teacher) return null;

  // Split name for display
  const nameParts = teacher.name.split(' ');
  const lastName = nameParts[0] || '';
  const firstName = nameParts.slice(1).join(' ') || '';

  const DataField = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-400 mb-0.5">{label}</span>
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-medium">
        {value || 'មិនមាន'}
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
      <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans font-kantumruy"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h2 className="font-bold text-lg text-slate-800">ព័ត៌មានលម្អិតគ្រូបង្រៀន</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white space-y-8 flex-1">
          
          {/* 1. ព័ត៌មានផ្ទាល់ខ្លួន */}
          <section>
            <SectionHeader icon={User} title="ព័ត៌មានផ្ទាល់ខ្លួន" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="នាមខ្លួន" value={firstName || 'ស្រីភ័ក្ត្រ'} />
              <DataField label="នាមត្រកូល" value={lastName || 'ពេន'} />
              <DataField label="ថ្ងៃកំណើត" value="2 មីនា 1988" />
              <DataField label="ភេទ" value={teacher.gender || 'ស្រី'} />
              <DataField label="សញ្ជាតិ" value="ខ្មែរ" />
              <DataField label="ជនជាតិ" value="ខ្មែរ" />
              <DataField label="លេខអត្តសញ្ញាណប័ណ្ណ" value="170739663" />
              <DataField label="ប្រភេទ" value="មានសុពលភាព" />
              <DataField label="ថ្ងៃផុតកំណត់" value="23 កុម្ភៈ 2033" />
              <DataField label="ពិការភាព" value="មិនមាន" />
            </div>
          </section>

          {/* 2. ព័ត៌មានគណនី */}
          <section>
            <SectionHeader icon={Fingerprint} title="ព័ត៌មានគណនី" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="ឈ្មោះអ្នកប្រើប្រាស់" value={teacher.username?.replace('@', '') || 'pptc1'} />
              <DataField label="អ៊ីមែល" value="1a08027pp@school.edu" />
              <DataField label="ទូរស័ព្ទ" value="0966737171" />
            </div>
          </section>

          {/* 3. ព័ត៌មានការងារ */}
          <section>
            <SectionHeader icon={Briefcase} title="ព័ត៌មានការងារ" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="អត្តលេខមន្ត្រីរាជការ" value="មិនមាន" />
              <DataField label="កម្រិតថ្នាក់" value={teacher.gradeLevel || 'ថ្នាក់ទី1'} />
              <DataField label="តួនាទី" value={teacher.role || 'មិនមាន'} />
              <DataField label="ប្រភេទក្របខ័ណ្ឌ" value={teacher.framework || 'កិច្ចសន្យា'} />
              <DataField label="កម្រិតវប្បធម៌" value="មធ្យមសិក្សាទុតិយភូមិ" />
              <DataField label="បណ្ដុះបណ្ដាល" value="មិនមាន" />
              <DataField label="ស្ថានភាព" value="ផ្សេងៗ" />
              <DataField label="ប្រភេទបង្រៀន" value="1 វេន" />
              <DataField label="ថ្ងៃចូលបម្រើការ" value="1 វិច្ឆិកា 2025" />
              <DataField label="កាំប្រាក់" value="មិនមាន" />
              <DataField label="បទពិសោធន៍" value="១០ ខែ" />
              <DataField label="ចម្ងាយទៅសាលា" value="< 100ម" />
            </div>
          </section>

          {/* 4. កញ្ចប់សម្ភារៈសម្រាប់ជួយសិស្ស */}
          <section>
            <SectionHeader icon={Package} title="កញ្ចប់សម្ភារៈសម្រាប់ជួយសិស្ស" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="គណិតវិទ្យាថ្នាក់ដំបូង" value="មាន" />
              <DataField label="សម្ភារឧបទេស (គណិត)" value="មិនមាន" />
              <DataField label="កញ្ចប់សម្ភារៈអំណាន" value="មាន" />
              <DataField label="ប័ណ្ឌរូបភាព" value="មិនមាន" />
            </div>
          </section>

          {/* 5. ព័ត៌មានគ្រួសារ */}
          <section>
            <SectionHeader icon={Users} title="ព័ត៌មានគ្រួសារ" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="ស្ថានភាព" value="រៀបការ" />
              <DataField label="ឈ្មោះប្ដី/ប្រពន្ធ" value="ដេន ហ៊ាត" />
              <DataField label="មុខរបរប្ដី/ប្រពន្ធ" value="កសិករ" />
              <DataField label="ទីកន្លែងកំណើតប្ដី/ប្រពន្ធ" value="ភូមិ អង្គស្វាយ ឃុំ នរាយរណ៍ ស្រុកឈូក ខេត្តកំពត" />
              <DataField label="ទូរស័ព្ទប្ដី/ប្រពន្ធ" value="086454598" />
              <DataField label="ចំនួនកូន" value="2" />
              <DataField label="កូន ១" value="ហួច សៀវហុង (កំពុងរៀន)" />
              <DataField label="កូន ២" value="ហួច លីហ្សា (កំពុងរៀន)" />
            </div>
          </section>

          {/* 6. ទីលំនៅ & ទីកន្លែងកំណើត */}
          <section>
            <SectionHeader icon={MapPin} title="ទីលំនៅ & ទីកន្លែងកំណើត" />
            <div className="grid grid-cols-1 gap-4">
              <DataField label="ទីលំនៅបច្ចុប្បន្ន" value="ខេត្តបាត់ដំបង · ភ្នំព្រឹក · បារាំងធ្លាក់ · អូរគល់សំយ៉ុង" />
              <DataField label="ទីកន្លែងកំណើត" value="ខេត្តតាកែវ · ត្រាំកក់ · អូរសារាយ · ត្នោតជុំ" />
            </div>
          </section>

          {/* 7. ថ្នាក់ដែលកំពុងបង្រៀន */}
          <section>
            <SectionHeader icon={School} title="ថ្នាក់ដែលកំពុងបង្រៀន" />
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              {teacher.class && teacher.class !== 'មិនមានថ្នាក់' ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 font-bold text-xl px-4 py-2 rounded-lg inline-block">
                    {teacher.class.replace('ថ្នាក់ទី ', '')}
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>កម្រិតថ្នាក់: <span className="font-semibold text-slate-800">{teacher.gradeLevel}</span></p>
                    <p>ថ្នាក់ទី: <span className="font-semibold text-slate-800">{teacher.class.replace('ថ្នាក់ទី ', '')}</span></p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm italic">
                  មិនមានថ្នាក់បង្រៀនទេ
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition font-medium shadow-sm">
            <FileText className="w-3.5 h-3.5" />
            View Profile PDF
          </button>
          <button 
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs px-5 py-2 rounded-xl font-bold transition shadow-sm"
          >
            បិទ
          </button>
        </div>

      </div>
    </div>
  );
};
