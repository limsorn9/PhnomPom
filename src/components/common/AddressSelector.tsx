import React, { useState, useEffect } from 'react';
import {
  getProvinces,
  getDistricts,
  getCommunes,
  getVillages,
  getPrimarySchoolsWithDetails,
  getSchoolCode,
  searchLocations,
  PrimarySchoolInfo
} from '../../data/cambodiaLocations';
import { MapPin, School, Search, Hash, Check, Sparkles, Edit3, ListFilter, X } from 'lucide-react';

export interface AddressSelectorProps {
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  primarySchool?: string;
  schoolCode?: string;
  prefix?: string;
  label?: string;
  required?: boolean;
  showSchoolSelector?: boolean;
  showQuickSearch?: boolean;
  allowCustomInput?: boolean;

  // Single batch callback
  onChange?: (address: {
    province: string;
    district: string;
    commune: string;
    village: string;
    primarySchool?: string;
    schoolCode?: string;
    fullAddressString?: string;
  }) => void;

  // Individual callbacks for legacy / direct prop binding
  onProvinceChange?: (province: string) => void;
  onDistrictChange?: (district: string) => void;
  onCommuneChange?: (commune: string) => void;
  onVillageChange?: (village: string) => void;
  onSchoolChange?: (school: string, schoolCode?: string) => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  province = '',
  district = '',
  commune = '',
  village = '',
  primarySchool = '',
  schoolCode = '',
  prefix = 'addr',
  label = 'អាសយដ្ឋាន (ខេត្ត ➔ ស្រុក ➔ ឃុំ ➔ ភូមិ ➔ សាលារៀន)',
  required = false,
  showSchoolSelector = true,
  showQuickSearch = true,
  allowCustomInput = true,
  onChange,
  onProvinceChange,
  onDistrictChange,
  onCommuneChange,
  onVillageChange,
  onSchoolChange
}) => {
  const [currentProvince, setCurrentProvince] = useState<string>(province || '');
  const [currentDistrict, setCurrentDistrict] = useState<string>(district || '');
  const [currentCommune, setCurrentCommune] = useState<string>(commune || '');
  const [currentVillage, setCurrentVillage] = useState<string>(village || '');
  const [currentSchool, setCurrentSchool] = useState<string>(primarySchool || '');
  const [currentSchoolCode, setCurrentSchoolCode] = useState<string>(schoolCode || '');

  // Custom text mode toggles
  const [customVillageMode, setCustomVillageMode] = useState<boolean>(false);
  const [customSchoolMode, setCustomSchoolMode] = useState<boolean>(false);

  // Quick search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchLocations>>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync props to state if props change from outside
  useEffect(() => {
    if (province !== undefined && province !== currentProvince) setCurrentProvince(province);
  }, [province]);

  useEffect(() => {
    if (district !== undefined && district !== currentDistrict) setCurrentDistrict(district);
  }, [district]);

  useEffect(() => {
    if (commune !== undefined && commune !== currentCommune) setCurrentCommune(commune);
  }, [commune]);

  useEffect(() => {
    if (village !== undefined && village !== currentVillage) setCurrentVillage(village);
  }, [village]);

  useEffect(() => {
    if (primarySchool !== undefined && primarySchool !== currentSchool) {
      setCurrentSchool(primarySchool);
    }
  }, [primarySchool]);

  useEffect(() => {
    if (schoolCode !== undefined && schoolCode !== currentSchoolCode) {
      setCurrentSchoolCode(schoolCode);
    }
  }, [schoolCode]);

  // Derived location lists
  const provinces = getProvinces();
  const districts = currentProvince ? getDistricts(currentProvince) : [];
  const communes = (currentProvince && currentDistrict) ? getCommunes(currentProvince, currentDistrict) : [];
  const villages = (currentProvince && currentDistrict && currentCommune) ? getVillages(currentProvince, currentDistrict, currentCommune) : [];
  const schoolsWithDetails: PrimarySchoolInfo[] = (currentProvince && currentDistrict && currentCommune)
    ? getPrimarySchoolsWithDetails(currentProvince, currentDistrict, currentCommune)
    : [];

  // Search handler
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const results = searchLocations(q, 8);
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const selectSearchResult = (item: ReturnType<typeof searchLocations>[0]) => {
    const prov = item.province;
    const dist = item.district || '';
    const comm = item.commune || '';
    const vill = item.village || '';
    const sch = item.type === 'school' ? item.name : '';
    const code = item.code || (sch ? getSchoolCode(sch, prov, dist, comm) : '');

    updateAllFields({
      province: prov,
      district: dist,
      commune: comm,
      village: vill,
      primarySchool: sch,
      schoolCode: code
    });

    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const updateAllFields = (updates: {
    province: string;
    district: string;
    commune: string;
    village: string;
    primarySchool?: string;
    schoolCode?: string;
  }) => {
    setCurrentProvince(updates.province);
    setCurrentDistrict(updates.district);
    setCurrentCommune(updates.commune);
    setCurrentVillage(updates.village);
    if (updates.primarySchool !== undefined) setCurrentSchool(updates.primarySchool);
    if (updates.schoolCode !== undefined) setCurrentSchoolCode(updates.schoolCode);

    // Call individual listeners
    if (onProvinceChange) onProvinceChange(updates.province);
    if (onDistrictChange) onDistrictChange(updates.district);
    if (onCommuneChange) onCommuneChange(updates.commune);
    if (onVillageChange) onVillageChange(updates.village);
    if (onSchoolChange) onSchoolChange(updates.primarySchool || '', updates.schoolCode);

    // Call unified listener
    if (onChange) {
      const parts = [updates.village, updates.commune, updates.district, updates.province].filter(Boolean);
      if (updates.primarySchool && showSchoolSelector) {
        parts.push(`(សាលារៀន: ${updates.primarySchool}${updates.schoolCode ? ` - កូដ: ${updates.schoolCode}` : ''})`);
      }
      const fullAddressString = parts.join(', ');

      onChange({
        province: updates.province,
        district: updates.district,
        commune: updates.commune,
        village: updates.village,
        primarySchool: updates.primarySchool,
        schoolCode: updates.schoolCode,
        fullAddressString
      });
    }
  };

  const handleProvinceSelect = (newProv: string) => {
    const dists = getDistricts(newProv);
    const firstDist = dists[0] || '';
    const comms = firstDist ? getCommunes(newProv, firstDist) : [];
    const firstComm = comms[0] || '';
    const vills = (firstDist && firstComm) ? getVillages(newProv, firstDist, firstComm) : [];
    const firstVill = vills[0] || '';
    const schs = (firstDist && firstComm) ? getPrimarySchoolsWithDetails(newProv, firstDist, firstComm) : [];
    const firstSch = schs[0]?.name || '';
    const firstCode = schs[0]?.code || '';

    updateAllFields({
      province: newProv,
      district: firstDist,
      commune: firstComm,
      village: firstVill,
      primarySchool: firstSch,
      schoolCode: firstCode
    });
  };

  const handleDistrictSelect = (newDist: string) => {
    const comms = (currentProvince && newDist) ? getCommunes(currentProvince, newDist) : [];
    const firstComm = comms[0] || '';
    const vills = (currentProvince && newDist && firstComm) ? getVillages(currentProvince, newDist, firstComm) : [];
    const firstVill = vills[0] || '';
    const schs = (currentProvince && newDist && firstComm) ? getPrimarySchoolsWithDetails(currentProvince, newDist, firstComm) : [];
    const firstSch = schs[0]?.name || '';
    const firstCode = schs[0]?.code || '';

    updateAllFields({
      province: currentProvince,
      district: newDist,
      commune: firstComm,
      village: firstVill,
      primarySchool: firstSch,
      schoolCode: firstCode
    });
  };

  const handleCommuneSelect = (newComm: string) => {
    const vills = (currentProvince && currentDistrict && newComm) ? getVillages(currentProvince, currentDistrict, newComm) : [];
    const firstVill = vills[0] || '';
    const schs = (currentProvince && currentDistrict && newComm) ? getPrimarySchoolsWithDetails(currentProvince, currentDistrict, newComm) : [];
    const firstSch = schs[0]?.name || '';
    const firstCode = schs[0]?.code || '';

    updateAllFields({
      province: currentProvince,
      district: currentDistrict,
      commune: newComm,
      village: firstVill,
      primarySchool: firstSch,
      schoolCode: firstCode
    });
  };

  const handleVillageSelect = (newVill: string) => {
    updateAllFields({
      province: currentProvince,
      district: currentDistrict,
      commune: currentCommune,
      village: newVill,
      primarySchool: currentSchool,
      schoolCode: currentSchoolCode
    });
  };

  const handleSchoolSelect = (newSch: string) => {
    const found = schoolsWithDetails.find(s => s.name === newSch);
    const code = found?.code || getSchoolCode(newSch, currentProvince, currentDistrict, currentCommune);

    updateAllFields({
      province: currentProvince,
      district: currentDistrict,
      commune: currentCommune,
      village: currentVillage,
      primarySchool: newSch,
      schoolCode: code
    });
  };

  return (
    <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 via-white to-blue-50/40 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-blue-950/20 border border-slate-200 dark:border-slate-700 shadow-xs relative">
      {/* Header & Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700/80 pb-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm">
          <div className="w-6 h-6 rounded-lg bg-blue-600/10 dark:bg-blue-400/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </div>

        {/* Quick Instant Search Across Cambodia */}
        {showQuickSearch && (
          <div className="relative min-w-[240px] sm:w-72">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery.trim().length > 1 && setIsSearchOpen(true)}
                placeholder="ស្វែងរកសាលា ឬភូមិ/ឃុំទូទាំងប្រទេស..."
                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute right-0 mt-1 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSearchResult(item)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-start gap-2 transition-colors cursor-pointer text-xs"
                  >
                    {item.type === 'school' ? (
                      <School className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate font-kantumruy">
                          {item.name}
                        </span>
                        {item.code && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold ml-1">
                            {item.code}
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                        {item.commune ? `${item.commune}, ` : ''}{item.district ? `${item.district}, ` : ''}{item.province}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid: 4 Administrative Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. ខេត្ត / រាជធានី (Provinces) */}
        <div>
          <label
            htmlFor={`${prefix}-province`}
            className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            ១. ខេត្ត / រាជធានី (២៥ រាជធានី-ខេត្ត)
          </label>
          <select
            id={`${prefix}-province`}
            value={currentProvince}
            onChange={e => handleProvinceSelect(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 font-kantumruy cursor-pointer shadow-2xs"
          >
            <option value="">-- ជ្រើសរើសខេត្ត/រាជធានី --</option>
            {provinces.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* 2. ស្រុក / ក្រុង / ខណ្ឌ (Districts) */}
        <div>
          <label
            htmlFor={`${prefix}-district`}
            className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            ២. ស្រុក / ក្រុង / ខណ្ឌ
          </label>
          <select
            id={`${prefix}-district`}
            value={currentDistrict}
            onChange={e => handleDistrictSelect(e.target.value)}
            disabled={!currentProvince}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-kantumruy cursor-pointer shadow-2xs"
          >
            <option value="">-- ជ្រើសរើសស្រុក/ក្រុង/ខណ្ឌ --</option>
            {districts.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 3. ឃុំ / សង្កាត់ (Communes) */}
        <div>
          <label
            htmlFor={`${prefix}-commune`}
            className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            ៣. ឃុំ / សង្កាត់
          </label>
          <select
            id={`${prefix}-commune`}
            value={currentCommune}
            onChange={e => handleCommuneSelect(e.target.value)}
            disabled={!currentDistrict}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-kantumruy cursor-pointer shadow-2xs"
          >
            <option value="">-- ជ្រើសរើសឃុំ/សង្កាត់ --</option>
            {communes.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 4. ភូមិ (Villages) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={`${prefix}-village`}
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300"
            >
              ៤. ភូមិ
            </label>
            {allowCustomInput && (
              <button
                type="button"
                onClick={() => setCustomVillageMode(!customVillageMode)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                title="ប្តូររវាងបញ្ជីជ្រើសរើស និងវាយបញ្ចូលផ្ទាល់"
              >
                <Edit3 className="w-3 h-3" />
                <span>{customVillageMode ? 'ជ្រើសបញ្ជី' : 'វាយផ្ទាល់'}</span>
              </button>
            )}
          </div>

          {customVillageMode ? (
            <input
              id={`${prefix}-village-custom`}
              type="text"
              value={currentVillage}
              onChange={e => handleVillageSelect(e.target.value)}
              placeholder="វាយបញ្ចូលឈ្មោះភូមិ..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 font-kantumruy shadow-2xs"
            />
          ) : (
            <select
              id={`${prefix}-village`}
              value={currentVillage}
              onChange={e => handleVillageSelect(e.target.value)}
              disabled={!currentCommune}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-kantumruy cursor-pointer shadow-2xs"
            >
              <option value="">-- ជ្រើសរើសភូមិ --</option>
              {villages.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Primary School & School Code Section */}
      {showSchoolSelector && (
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-kantumruy">
              <School className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>សាលាបឋមសិក្សាក្នុងឃុំ/ស្រុក & លេខកូដសាលារៀន (MoEYS Primary School & Code)</span>
            </div>

            {allowCustomInput && (
              <button
                type="button"
                onClick={() => setCustomSchoolMode(!customSchoolMode)}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Edit3 className="w-3 h-3" />
                <span>{customSchoolMode ? 'ជ្រើសរើសពីបញ្ជីសាលា' : 'វាយបញ្ចូលឈ្មោះសាលាថ្មី'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Primary School Dropdown / Input */}
            <div className="sm:col-span-8">
              {customSchoolMode ? (
                <input
                  id={`${prefix}-school-custom`}
                  type="text"
                  value={currentSchool}
                  onChange={e => handleSchoolSelect(e.target.value)}
                  placeholder="វាយបញ្ចូលឈ្មោះសាលាបឋមសិក្សា..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-kantumruy"
                />
              ) : (
                <select
                  id={`${prefix}-school`}
                  value={currentSchool}
                  onChange={e => handleSchoolSelect(e.target.value)}
                  disabled={!currentCommune}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-kantumruy cursor-pointer shadow-2xs"
                >
                  <option value="">-- ជ្រើសរើសសាលាបឋមសិក្សា --</option>
                  {schoolsWithDetails.map(sch => (
                    <option key={sch.name} value={sch.name}>
                      {sch.name} {sch.code ? `(កូដ: ${sch.code})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* School Code Badge & Display */}
            <div className="sm:col-span-4 flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <Hash className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-[11px]">លេខកូដសាលា៖</span>
                </div>
                <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300 tracking-wider">
                  {currentSchoolCode || (currentSchool ? getSchoolCode(currentSchool, currentProvince, currentDistrict, currentCommune) : '---------')}
                </span>
              </div>
            </div>
          </div>

          {/* Full Location Breadcrumb Preview */}
          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 pt-1 flex-wrap font-kantumruy">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="font-bold text-slate-700 dark:text-slate-300">រចនាសម្ព័ន្ធទីតាំង៖</span>
            <span>
              {currentProvince || '...'} ➔ {currentDistrict || '...'} ➔ {currentCommune || '...'} ➔ {currentVillage || '...'} {currentSchool ? `➔ 🏫 ${currentSchool}` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
