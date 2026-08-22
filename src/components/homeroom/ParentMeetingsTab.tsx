import React, { useState } from 'react';
import { ParentMeeting, ParentRepresentative } from '../../types';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Plus,
  Printer,
  Phone,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  X,
  Send,
  Building2
} from 'lucide-react';

interface ParentMeetingsTabProps {
  parentMeetings: ParentMeeting[];
  selectedGrade: number;
  selectedSection: string;
  onAddMeeting: (meeting: Omit<ParentMeeting, 'id' | 'createdAt'>) => void;
  onUpdateMeeting: (id: string, updated: Partial<ParentMeeting>) => void;
  onDeleteMeeting: (id: string) => void;
}

export const ParentMeetingsTab: React.FC<ParentMeetingsTabProps> = ({
  parentMeetings,
  selectedGrade,
  selectedSection,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting
}) => {
  const [selectedMeeting, setSelectedMeeting] = useState<ParentMeeting | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filter meetings for current class
  const classMeetings = parentMeetings.filter(
    m => m.grade === selectedGrade && m.section === selectedSection
  );

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00 ព្រឹក');
  const [location, setLocation] = useState(`បន្ទប់រៀនថ្នាក់ទី ${selectedGrade} «${selectedSection}»`);
  const [agendas, setAgendas] = useState('១. របាយការណ៍លទ្ធផលសិក្សា និងវិន័យប្រចាំឆមាស\n២. ពិភាក្សាលើការជួយសិស្សរៀនយឺត\n៣. គម្រោងលម្អបន្ទប់រៀន និងជ្រុងអាន');
  const [attendeesCount, setAttendeesCount] = useState(25);
  const [resolutions, setResolutions] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddMeeting({
      grade: selectedGrade,
      section: selectedSection,
      academicYear: '២០២៤ - ២០២៥',
      meetingTitle: title,
      meetingDate: date,
      meetingTime: time,
      location,
      agenda: agendas.split('\n').filter(Boolean),
      attendeesCount: Number(attendeesCount),
      totalParentsInClass: 30,
      resolutions: resolutions ? resolutions.split('\n').filter(Boolean) : [
        'មាតាបិតាឯកភាពជួយតាមដានកិច្ចការផ្ទះកូនរៀងរាល់ល្ងាច',
        'គាំទ្រការរៀបចំតុសិក្សាជាក្រុម និងជួយជួសជុលកង្ហារបន្ទប់រៀន'
      ],
      minutesNotes: 'កិច្ចប្រជុំបានប្រព្រឹត្តទៅដោយរលូន និងទទួលបានការគាំទ្រយ៉ាងកក់ក្តៅពីសំណាក់មាតាបិតាសិស្ស។',
      parentCommittee: [
        {
          parentName: 'លោក សុខ គង់',
          studentName: 'សុខ វិបុល',
          role: 'ប្រធានគណៈកម្មការទ្រទ្រង់ថ្នាក់',
          phone: '012 334 455'
        },
        {
          parentName: 'អ្នកស្រី កែវ ស៊ីណា',
          studentName: 'ចាន់ រស្មី',
          role: 'អនុប្រធានគណៈកម្មការ',
          phone: '098 776 554'
        },
        {
          parentName: 'លោក ហេង ម៉ៅ',
          studentName: 'ហេង ពិសិដ្ឋ',
          role: 'បេឡាធិកា',
          phone: '088 554 332'
        }
      ]
    });

    setShowCreateModal(false);
    setTitle('');
  };

  const handlePrintLetter = (m: ParentMeeting) => {
    setSelectedMeeting(m);
    setShowInviteModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 font-moul flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            ការប្រជុំមាតាបិតាសិស្ស & គណៈកម្មការទ្រទ្រង់ថ្នាក់ (គ.គ.ថ.)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ពង្រឹងទំនាក់ទំនងរវាងសាលារៀន គ្រូបង្រៀន និងគ្រួសារសិស្ស
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>រៀបចំកិច្ចប្រជុំមាតាបិតាថ្មី</span>
        </button>
      </div>

      {/* Parent Committee Showcase */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 rounded-xl p-4 border border-blue-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-blue-600" />
          តំណាងគណៈកម្មការមាតាបិតាទ្រទ្រង់ថ្នាក់ទី {selectedGrade} «{selectedSection}»
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { role: 'ប្រធានគណៈកម្មការ', name: 'លោក សុខ គង់', child: 'អាណាព្យាបាល សុខ វិបុល', phone: '012 334 455' },
            { role: 'អនុប្រធានគណៈកម្មការ', name: 'អ្នកស្រី កែវ ស៊ីណា', child: 'អាណាព្យាបាល ចាន់ រស្មី', phone: '098 776 554' },
            { role: 'បេឡាធិកា', name: 'លោក ហេង ម៉ៅ', child: 'អាណាព្យាបាល ហេង ពិសិដ្ឋ', phone: '088 554 332' }
          ].map((rep, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs text-xs space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                {rep.role}
              </span>
              <p className="font-bold text-slate-800 pt-1 text-sm">{rep.name}</p>
              <p className="text-slate-500">{rep.child}</p>
              <p className="text-blue-700 font-times font-semibold flex items-center gap-1 pt-0.5">
                <Phone className="w-3 h-3 text-blue-500" />
                {rep.phone}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Meetings History & Minutes */}
      <div className="space-y-3">
        {classMeetings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
            មិនទាន់មានទិន្នន័យកិច្ចប្រជុំមាតាបិតានៅឡើយទេ
          </div>
        ) : (
          classMeetings.map(m => (
            <div
              key={m.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{m.meetingTitle}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-times">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {m.meetingDate} ({m.meetingTime})
                    </span>
                    <span className="flex items-center gap-1 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {m.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    វត្តមាន៖ {m.attendeesCount}/{m.totalParentsInClass} នាក់
                  </span>
                  <button
                    onClick={() => handlePrintLetter(m)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    លិខិតអញ្ជើញ
                  </button>
                </div>
              </div>

              {/* Agenda & Resolutions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-800">របៀបវារៈនៃកិច្ចប្រជុំ៖</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {m.agenda.map((ag, i) => (
                      <li key={i}>{ag}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 space-y-1.5">
                  <p className="font-bold text-emerald-900">សេចក្តីសម្រេចចិត្តរួម (Resolutions)៖</p>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800">
                    {m.resolutions.map((res, i) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INVITATION LETTER PRINT PREVIEW MODAL */}
      {showInviteModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 font-moul text-sm">
                លិខិតអញ្ជើញមាតាបិតា / អាណាព្យាបាលសិស្ស
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  បោះពុម្ពលិខិត
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Khmer Invitation Letter Template */}
            <div className="border border-slate-300 p-5 rounded-lg space-y-3 text-xs text-slate-800 bg-white">
              <div className="text-center space-y-1">
                <p className="font-moul text-xs text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-[11px] text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <p className="font-moul text-xs text-blue-900 pt-2">លិខិតអញ្ជើញ</p>
              </div>

              <p className="text-right font-times text-slate-500">
                ថ្ងៃទី {new Date().toLocaleDateString('km-KH')}
              </p>

              <div className="space-y-1">
                <p><strong>សូមគោរពអញ្ជើញ៖</strong> មាតាបិតា / អាណាព្យាបាលសិស្ស ថ្នាក់ទី {selectedMeeting.grade} «{selectedMeeting.section}»</p>
                <p><strong>កម្មវត្ថុ៖</strong> {selectedMeeting.meetingTitle}</p>
              </div>

              <p className="leading-relaxed indent-6 text-slate-700">
                សាលាបឋមសិក្សាភ្នំកំបោរ សូមគោរពអញ្ជើញលោក-លោកស្រី ជាមាតាបិតា ឬអាណាព្យាបាលសិស្សានុសិស្សទាំងអស់ ចូលរួមក្នុងកិច្ចប្រជុំពិភាក្សាការងារអប់រំ និងតាមដានលទ្ធផលសិក្សារបស់កូនៗ។
              </p>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <p><strong>• កាលបរិច្ឆេទ៖</strong> {selectedMeeting.meetingDate} វេលាម៉ោង {selectedMeeting.meetingTime}</p>
                <p><strong>• ទីកន្លែង៖</strong> {selectedMeeting.location}</p>
                <p><strong>• របៀបវារៈ៖</strong> {selectedMeeting.agenda.join(' , ')}</p>
              </div>

              <p className="leading-relaxed text-slate-700">
                វត្តមានរបស់លោក-លោកស្រី ជាកត្តាសំខាន់បំផុតក្នុងការជំរុញ និងគាំទ្រដល់ការសិក្សារបស់សិស្សានុសិស្សឱ្យកាន់តែប្រសើរឡើង។
              </p>

              <div className="grid grid-cols-2 pt-4 text-center">
                <div>
                  <p className="font-bold">បានឃើញ និងឯកភាព</p>
                  <p className="text-slate-500 text-[11px]">នាយកសាលា</p>
                  <div className="h-12"></div>
                  <p className="font-bold font-moul">លោក លីម សន</p>
                </div>
                <div>
                  <p className="font-bold">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-12"></div>
                  <p className="font-bold font-moul">លោក ចាន់ វុទ្ធី</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MEETING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 font-moul text-sm">
                រៀបចំកិច្ចប្រជុំមាតាបិតាថ្មី
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ប្រធានបទកិច្ចប្រជុំ៖</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ឧ. កិច្ចប្រជុំមាតាបិតាដើមឆ្នាំសិក្សា..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">កាលបរិច្ឆេទ៖</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ម៉ោង៖</label>
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ទីកន្លែង៖</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">របៀបវារៈ (ចុះបន្ទាត់តាមចំណុច)៖</label>
                <textarea
                  rows={3}
                  value={agendas}
                  onChange={e => setAgendas(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  បង្កើតកិច្ចប្រជុំ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
