import React from 'react';
import { getProvinces, getDistricts, getCommunes, getVillages, getPrimarySchools } from '../../data/cambodiaLocations';
import { MapPin } from 'lucide-react';

interface AddressSelectorProps {
  province: string;
  district: string;
  commune: string;
  village: string;
  primarySchool?: string;
  onChange: (address: {
    province: string;
    district: string;
    commune: string;
    village: string;
    primarySchool?: string;
    fullAddressString?: string;
  }) => void;
  showSchoolSelector?: boolean;
  label?: string;
  required?: boolean;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  province,
  district,
  commune,
  village,
  primarySchool,
  onChange,
  showSchoolSelector = true,
  label = 'អាសយដ្ឋាន (ខេត្ត ➔ ស្រុក ➔ ឃុំ ➔ ភូមិ)',
  required = false
}) => {
  const provinces = getProvinces();
  const districts = province ? getDistricts(province) : [];
  const communes = (province && district) ? getCommunes(province, district) : [];
  const villages = (province && district && commune) ? getVillages(province, district, commune) : [];
  const primarySchools = (province && district && commune) ? getPrimarySchools(province, district, commune, village) : [];

  const updateFields = (updates: Partial<{ province: string; district: string; commune: string; village: string; primarySchool: string }>) => {
    const newProv = updates.province !== undefined ? updates.province : province;
    const newDist = updates.district !== undefined ? updates.district : district;
    const newComm = updates.commune !== undefined ? updates.commune : commune;
    const newVill = updates.village !== undefined ? updates.village : village;
    const newSch = updates.primarySchool !== undefined ? updates.primarySchool : primarySchool;

    const parts = [newVill, newComm, newDist, newProv].filter(Boolean);
    if (newSch && showSchoolSelector) {
      parts.push(`(សាលារៀន: ${newSch})`);
    }
    const fullAddressString = parts.join(', ');

    onChange({
      province: newProv,
      district: newDist,
      commune: newComm,
      village: newVill,
      primarySchool: newSch,
      fullAddressString
    });
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
        <MapPin className="w-4 h-4 text-emerald-600" />
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* ខេត្ត / រាជធានី */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">១. ខេត្ត / រាជធានី</label>
          <select
            value={province}
            onChange={e => {
              const val = e.target.value;
              const firstDist = getDistricts(val)[0] || '';
              const firstComm = firstDist ? getCommunes(val, firstDist)[0] || '' : '';
              const firstVill = (val && firstDist && firstComm) ? getVillages(val, firstDist, firstComm)[0] || '' : '';
              updateFields({ province: val, district: firstDist, commune: firstComm, village: firstVill, primarySchool: '' });
            }}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- ជ្រើសរើសខេត្ត --</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* ស្រុក / ក្រុង / ខណ្ឌ */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">២. ស្រុក / ក្រុង / ខណ្ឌ</label>
          <select
            value={district}
            onChange={e => {
              const val = e.target.value;
              const firstComm = (province && val) ? getCommunes(province, val)[0] || '' : '';
              const firstVill = (province && val && firstComm) ? getVillages(province, val, firstComm)[0] || '' : '';
              updateFields({ district: val, commune: firstComm, village: firstVill, primarySchool: '' });
            }}
            disabled={!province}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <option value="">-- ជ្រើសរើសស្រុក --</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* ឃុំ / សង្កាត់ */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">៣. ឃុំ / សង្កាត់</label>
          <select
            value={commune}
            onChange={e => {
              const val = e.target.value;
              const firstVill = (province && district && val) ? getVillages(province, district, val)[0] || '' : '';
              updateFields({ commune: val, village: firstVill, primarySchool: '' });
            }}
            disabled={!district}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <option value="">-- ជ្រើសរើសឃុំ --</option>
            {communes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* ភូមិ */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">៤. ភូមិ</label>
          <select
            value={village}
            onChange={e => updateFields({ village: e.target.value })}
            disabled={!commune}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <option value="">-- ជ្រើសរើសភូមិ --</option>
            {villages.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {showSchoolSelector && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              🏫 សាលារៀនបឋមសិក្សាក្នុងឃុំ / ភូមិ
            </label>
            <select
              value={primarySchool || ''}
              onChange={e => updateFields({ primarySchool: e.target.value })}
              disabled={!commune}
              className="w-full px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="">-- ជ្រើសរើសសាលាបឋមសិក្សាក្នុងឃុំ/ភូមិ --</option>
              {primarySchools.map(sch => (
                <option key={sch} value={sch}>{sch}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pb-1">
              📍 <b>ទីតាំងបច្ចុប្បន្ន:</b> {village ? `${village}, ` : ''}{commune ? `${commune}, ` : ''}{district ? `${district}, ` : ''}{province || 'មិនទាន់ជ្រើសរើស'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
