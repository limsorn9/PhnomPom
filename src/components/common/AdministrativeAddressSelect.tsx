import React, { useState, useEffect } from 'react';
import { cambodiaGeoData, GeoLevel } from '../../data/cambodiaGeoData';

export interface AddressState {
  province: string;
  district: string;
  commune: string;
  village: string;
}

interface AdministrativeAddressSelectProps {
  label?: string;
  value?: AddressState;
  onChange?: (address: AddressState) => void;
  defaultAddress?: AddressState;
}

export const AdministrativeAddressSelect: React.FC<AdministrativeAddressSelectProps> = ({
  label,
  value,
  onChange,
  defaultAddress
}) => {
  const [address, setAddress] = useState<AddressState>(
    value || defaultAddress || { province: '', district: '', commune: '', village: '' }
  );

  // Sync prop changes to internal state if controlled
  useEffect(() => {
    if (value) {
      setAddress(value);
    }
  }, [value]);

  const [provinces, setProvinces] = useState<GeoLevel[]>(cambodiaGeoData);
  const [districts, setDistricts] = useState<GeoLevel[]>([]);
  const [communes, setCommunes] = useState<GeoLevel[]>([]);
  const [villages, setVillages] = useState<GeoLevel[]>([]);
  const [isCustomVillage, setIsCustomVillage] = useState(false);

  // Update dropdown lists based on current selection
  useEffect(() => {
    const selectedProv = provinces.find(p => p.name === address.province);
    setDistricts(selectedProv?.children || []);

    const selectedDist = selectedProv?.children?.find(d => d.name === address.district);
    setCommunes(selectedDist?.children || []);

    const selectedComm = selectedDist?.children?.find(c => c.name === address.commune);
    setVillages(selectedComm?.children || []);
  }, [address.province, address.district, address.commune, provinces]);

  const handleChange = (field: keyof AddressState, newValue: string) => {
    let newAddress = { ...address, [field]: newValue };

    // Reset children if parent changes
    if (field === 'province') {
      newAddress = { ...newAddress, district: '', commune: '', village: '' };
    } else if (field === 'district') {
      newAddress = { ...newAddress, commune: '', village: '' };
    } else if (field === 'commune') {
      newAddress = { ...newAddress, village: '' };
    }

    setAddress(newAddress);
    if (onChange) {
      onChange(newAddress);
    }
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomVillage(true);
      handleChange('village', '');
    } else {
      handleChange('village', val);
    }
  };

  return (
    <div className="space-y-3 font-kantumruy">
      {label && <label className="block text-sm font-bold text-slate-700">{label}</label>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Province */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">ខេត្ត/រាជធានី</label>
          <select 
            value={address.province}
            onChange={(e) => handleChange('province', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">-- ជ្រើសរើស --</option>
            {provinces.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">ស្រុក/ខណ្ឌ/ក្រុង</label>
          <select 
            value={address.district}
            onChange={(e) => handleChange('district', e.target.value)}
            disabled={!address.province}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-100"
          >
            <option value="">-- ជ្រើសរើស --</option>
            {districts.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Commune */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">ឃុំ/សង្កាត់</label>
          <select 
            value={address.commune}
            onChange={(e) => handleChange('commune', e.target.value)}
            disabled={!address.district}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-100"
          >
            <option value="">-- ជ្រើសរើស --</option>
            {communes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Village */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">ភូមិ</label>
          {!isCustomVillage ? (
            <select 
              value={villages.some(v => v.name === address.village) ? address.village : (address.village ? '__custom__' : '')}
              onChange={handleVillageChange}
              disabled={!address.commune}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-100"
            >
              <option value="">-- ជ្រើសរើស --</option>
              {villages.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
              <option value="__custom__">+ បញ្ចូលដោយដៃ</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="វាយឈ្មោះភូមិ..."
                value={address.village}
                onChange={(e) => handleChange('village', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                autoFocus
              />
              <button 
                type="button"
                onClick={() => setIsCustomVillage(false)}
                className="px-2 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
