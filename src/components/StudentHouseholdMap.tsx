import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { HouseholdRecord, SchoolProfile, Student } from '../types';
import {
  MapPin,
  Compass,
  Navigation,
  Search,
  Filter,
  Layers,
  Phone,
  GraduationCap,
  Users,
  ExternalLink,
  RotateCcw,
  Footprints,
  Bike,
  Car,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  Map as MapIcon,
  Tag,
  Crosshair,
  Route,
  Share2,
  Trash2
} from 'lucide-react';

interface StudentHouseholdMapProps {
  households: HouseholdRecord[];
  schoolProfile: SchoolProfile;
  students?: Student[];
  villages?: string[];
  onSelectHousehold?: (household: HouseholdRecord) => void;
  onDeleteHousehold?: (householdId: string, headName: string) => void;
  isDirector?: boolean;
  selectedHouseholdId?: string | null;
}

type TileLayerType = 'streets' | 'satellite' | 'topo' | 'light';

export const StudentHouseholdMap: React.FC<StudentHouseholdMapProps> = ({
  households,
  schoolProfile,
  students = [],
  villages = [],
  onSelectHousehold,
  onDeleteHousehold,
  isDirector = false,
  selectedHouseholdId
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // States
  const [activeTile, setActiveTile] = useState<TileLayerType>('streets');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedPoverty, setSelectedPoverty] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [showNamesAlways, setShowNamesAlways] = useState<boolean>(true);
  const [activeRouteHousehold, setActiveRouteHousehold] = useState<HouseholdRecord | null>(null);
  const [routeOrigin, setRouteOrigin] = useState<'school' | 'my_location'>('school');
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [hoveredHouseholdId, setHoveredHouseholdId] = useState<string | null>(null);

  // Default School Location (Phnom Pom Primary School)
  const schoolLat = 13.241567;
  const schoolLng = 102.342145;

  // Filtered Households
  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      const matchVillage = selectedVillage === 'all' || h.village === selectedVillage;
      const matchPoverty = selectedPoverty === 'all' || h.familyStatus === selectedPoverty;
      
      const matchGrade = selectedGrade === 'all' || h.members.some(m => 
        m.isStudentAtSchool && m.studentGrade !== undefined && m.studentGrade.toString() === selectedGrade
      );

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (h.houseNumber && h.houseNumber.toLowerCase().includes(q)) ||
        h.headName.toLowerCase().includes(q) ||
        (h.phoneNumber && h.phoneNumber.includes(q)) ||
        (h.equityCardNumber && h.equityCardNumber.toLowerCase().includes(q)) ||
        (h.spouseName && h.spouseName.toLowerCase().includes(q)) ||
        h.members.some(m => 
          m.name.toLowerCase().includes(q) || 
          (m.studentCode && m.studentCode.toLowerCase().includes(q))
        );

      return matchVillage && matchPoverty && matchGrade && matchSearch;
    });
  }, [households, selectedVillage, selectedPoverty, selectedGrade, searchQuery]);

  // Poverty Badge Color Mapping
  const getPovertyColor = (status: string) => {
    switch (status) {
      case 'ក្រ១':
        return {
          bg: '#ef4444', // Red-500
          border: '#b91c1c',
          text: '#ffffff',
          name: 'ក្រីក្រកម្រិត១ (IDPoor 1)',
          badgeClass: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'ក្រ២':
        return {
          bg: '#f97316', // Orange-500
          border: '#c2410c',
          text: '#ffffff',
          name: 'ក្រីក្រកម្រិត២ (IDPoor 2)',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'ងាយរងគ្រោះ':
        return {
          bg: '#8b5cf6', // Violet-500
          border: '#6d28d9',
          text: '#ffffff',
          name: 'ងាយរងគ្រោះ (Vulnerable)',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      default:
        return {
          bg: '#10b981', // Emerald-500
          border: '#047857',
          text: '#ffffff',
          name: 'ជីវភាពទូទៅ (Normal)',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
    }
  };

  // Create Custom HTML Marker Icon
  const createHouseholdIcon = (h: HouseholdRecord, isHighlighted: boolean) => {
    const poverty = getPovertyColor(h.familyStatus);
    const hasStudents = h.members.some(m => m.isStudentAtSchool);
    const studentCount = h.members.filter(m => m.isStudentAtSchool).length;

    const pulseEffect = isHighlighted ? 'animate-bounce' : '';
    const shadowClass = isHighlighted ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-110' : 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]';

    return L.divIcon({
      className: 'custom-household-marker',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer transition-transform duration-200 ${shadowClass} ${pulseEffect}" style="transform-origin: bottom center;">
          <!-- Pin Top Card -->
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-full text-white font-bold text-[11px] shadow-md border-2 border-white" style="background-color: ${poverty.bg};">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span class="whitespace-nowrap">${h.houseNumber ? 'ផ្ទះ ' + h.houseNumber : h.headName.split(' ')[0]}</span>
            ${hasStudents ? `<span class="bg-white/90 text-slate-800 text-[10px] px-1 py-0.2 rounded-full font-black ml-0.5">${studentCount}</span>` : ''}
          </div>
          
          <!-- Pin Pointer Arrow -->
          <div class="w-2.5 h-2.5 bg-white rotate-45 -mt-1 shadow-sm border-r-2 border-b-2" style="border-color: ${poverty.bg}; background-color: ${poverty.bg};"></div>
          
          <!-- Head Name Label Floating Below (if enabled) -->
          ${showNamesAlways ? `
            <div class="mt-1 px-2 py-0.5 bg-slate-900/90 text-white rounded-md text-[10px] font-semibold tracking-wide whitespace-nowrap shadow border border-slate-700/80 backdrop-blur-sm pointer-events-none">
              ${h.headName}
            </div>
          ` : ''}
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 26],
      popupAnchor: [0, -28]
    });
  };

  // Create School Icon
  const createSchoolIcon = () => {
    return L.divIcon({
      className: 'custom-school-marker',
      html: `
        <div class="relative flex flex-col items-center cursor-pointer drop-shadow-[0_8px_20px_rgba(37,99,235,0.4)]">
          <!-- Pulse animation ring -->
          <div class="absolute -top-1 w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></div>
          
          <!-- School Badge -->
          <div class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white font-black text-xs shadow-lg border-2 border-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span class="whitespace-nowrap font-moul text-[11px] text-amber-200">សាលាបឋមសិក្សាភ្នំពុំ</span>
          </div>
          
          <!-- Pointer -->
          <div class="w-3 h-3 bg-indigo-700 rotate-45 -mt-1.5 border-r-2 border-b-2 border-amber-300"></div>
        </div>
      `,
      iconSize: [160, 48],
      iconAnchor: [80, 24],
      popupAnchor: [0, -26]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [schoolLat, schoolLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom Control to Bottom Right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution Control
      L.control.attribution({ position: 'bottomleft', prefix: 'ផែនទីសាលាបឋមសិក្សាភ្នំពុំ' }).addTo(map);

      // Tile Layer Groups
      const tileLayers: Record<TileLayerType, L.TileLayer> = {
        streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '&copy; Esri & ArcGIS'
        }),
        topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '&copy; OpenTopoMap'
        }),
        light: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; CARTO'
        })
      };

      // Set initial tile
      tileLayers.streets.addTo(map);
      (map as any)._customTileLayers = tileLayers;
      (map as any)._currentTileKey = 'streets';

      // Layers for Markers and Routes
      markersLayerRef.current = L.layerGroup().addTo(map);
      routeMarkersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map instance if unmounted
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const customTileLayers = (map as any)._customTileLayers;
    const currentTileKey = (map as any)._currentTileKey;

    if (customTileLayers && currentTileKey !== activeTile) {
      if (customTileLayers[currentTileKey]) {
        map.removeLayer(customTileLayers[currentTileKey]);
      }
      if (customTileLayers[activeTile]) {
        customTileLayers[activeTile].addTo(map);
      }
      (map as any)._currentTileKey = activeTile;
    }
  }, [activeTile]);

  // Render Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Add School Marker
    const schoolMarker = L.marker([schoolLat, schoolLng], {
      icon: createSchoolIcon(),
      zIndexOffset: 1000
    });

    schoolMarker.bindPopup(`
      <div class="p-3 font-battambang text-slate-800 space-y-2 max-w-xs">
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
          <div class="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div>
            <h4 class="font-bold text-sm text-blue-900 font-moul">${schoolProfile.nameKhmer}</h4>
            <p class="text-[11px] text-slate-500">កូដសាលា៖ ${schoolProfile.schoolCode || '020401015'}</p>
          </div>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">${schoolProfile.village}, ${schoolProfile.commune}, ${schoolProfile.district}, ${schoolProfile.province}</p>
        <div class="text-[11px] text-slate-500 space-y-0.5 pt-1">
          <p>📞 នាយកសាលា៖ <strong class="text-slate-700">${schoolProfile.principalPhone || '087 99 19 77'}</strong></p>
          <p>📍 GPS: ${schoolLat.toFixed(6)}, ${schoolLng.toFixed(6)}</p>
        </div>
        <div class="pt-2">
          <a href="https://maps.app.goo.gl/ackTYSYsd7t54vGP6" target="_blank" rel="noreferrer" class="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
            <span>បើកលើ Google Maps</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
    `);

    markersLayer.addLayer(schoolMarker);

    // 2. Add Household Markers
    filteredHouseholds.forEach(h => {
      if (!h.lat || !h.lng) return;

      const isHighlighted = h.id === selectedHouseholdId || h.id === hoveredHouseholdId || h.id === activeRouteHousehold?.id;
      const marker = L.marker([h.lat, h.lng], {
        icon: createHouseholdIcon(h, isHighlighted),
        zIndexOffset: isHighlighted ? 500 : 10
      });

      const poverty = getPovertyColor(h.familyStatus);
      const studentMembers = h.members.filter(m => m.isStudentAtSchool);

      // Construct rich popup content
      const popupHtml = `
        <div class="p-3 font-battambang text-slate-800 space-y-2.5 max-w-[280px]">
          <!-- House Header -->
          <div class="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-sm text-slate-900">${h.headName}</span>
                <span class="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">${h.houseNumber ? 'ផ្ទះ ' + h.houseNumber : 'គ្មានលេខ'}</span>
              </div>
              <p class="text-[11px] text-slate-500">${h.village} • ${h.commune}</p>
            </div>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full border whitespace-nowrap ${poverty.badgeClass}">
              ${h.familyStatus}
            </span>
          </div>

          <!-- House Photo Preview (if available) -->
          ${h.housePhotoUrl ? `
            <div class="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
              <img src="${h.housePhotoUrl}" alt="ផ្ទះ ${h.headName}" class="w-full h-full object-cover" />
            </div>
          ` : ''}

          <!-- Details & Students -->
          <div class="space-y-1 text-xs">
            <p class="text-slate-600 flex items-center justify-between">
              <span>សមាជិកគ្រួសារសរុប៖</span>
              <strong class="text-slate-800">${h.members.length > 0 ? h.members.length : 2} នាក់</strong>
            </p>
            <p class="text-slate-600 flex items-center justify-between">
              <span>សិស្សរៀននៅសាលា៖</span>
              <strong class="text-emerald-600 font-bold">${studentMembers.length} នាក់</strong>
            </p>
            ${h.phoneNumber ? `
              <p class="text-slate-600 flex items-center justify-between">
                <span>លេខទូរស័ព្ទ៖</span>
                <a href="tel:${h.phoneNumber}" class="text-blue-600 font-bold hover:underline">${h.phoneNumber}</a>
              </p>
            ` : ''}
          </div>

          <!-- Students List In House -->
          ${studentMembers.length > 0 ? `
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">សិស្សក្នុងគ្រួសារនេះ</span>
              <div class="space-y-1">
                ${studentMembers.map(st => `
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-medium text-slate-800 truncate">• ${st.name}</span>
                    <span class="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold text-[10px]">ថ្នាក់ទី ${st.studentGrade || 'N/A'}${st.studentSection || ''}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="grid ${isDirector && onDeleteHousehold ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 pt-1">
            <button
              id="btn-route-${h.id}"
              class="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              <span>ផ្លូវ</span>
            </button>
            <button
              id="btn-view-${h.id}"
              class="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-slate-300 transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>លម្អិត</span>
            </button>
            ${isDirector && onDeleteHousehold ? `
              <button
                id="btn-del-${h.id}"
                class="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-rose-200 transition-all cursor-pointer"
                title="លុបទិន្នន័យខ្នងផ្ទះ (សិទ្ធិនាយកសាលា)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>លុប</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Attach DOM Event Listeners when popup opens
      marker.on('popupopen', () => {
        const routeBtn = document.getElementById(`btn-route-${h.id}`);
        if (routeBtn) {
          routeBtn.onclick = () => {
            handleCalculateRoute(h);
            marker.closePopup();
          };
        }

        const viewBtn = document.getElementById(`btn-view-${h.id}`);
        if (viewBtn && onSelectHousehold) {
          viewBtn.onclick = () => {
            onSelectHousehold(h);
          };
        }

        const delBtn = document.getElementById(`btn-del-${h.id}`);
        if (delBtn && onDeleteHousehold) {
          delBtn.onclick = () => {
            marker.closePopup();
            onDeleteHousehold(h.id, h.headName);
          };
        }
      });

      marker.on('click', () => {
        setHoveredHouseholdId(h.id);
      });

      markersLayer.addLayer(marker);
    });

  }, [filteredHouseholds, showNamesAlways, selectedHouseholdId, hoveredHouseholdId, activeRouteHousehold, isDirector, onDeleteHousehold]);

  // Pan to selected household when selectedHouseholdId changes
  useEffect(() => {
    if (!selectedHouseholdId || !mapInstanceRef.current) return;
    const target = households.find(h => h.id === selectedHouseholdId);
    if (target && target.lat && target.lng) {
      mapInstanceRef.current.setView([target.lat, target.lng], 17, { animate: true });
    }
  }, [selectedHouseholdId, households]);

  // Calculate Distance (Haversine Formula) in Meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Multiply by road curvature factor (~1.25 for rural Cambodian village roads)
    return Math.round(R * c * 1.25);
  };

  // Route Metrics Calculation
  const routeMetrics = useMemo(() => {
    if (!activeRouteHousehold) return null;

    const startLat = routeOrigin === 'my_location' && myLocation ? myLocation.lat : schoolLat;
    const startLng = routeOrigin === 'my_location' && myLocation ? myLocation.lng : schoolLng;
    const endLat = activeRouteHousehold.lat;
    const endLng = activeRouteHousehold.lng;

    const distanceMeters = calculateDistance(startLat, startLng, endLat, endLng);
    const distanceKm = (distanceMeters / 1000).toFixed(2);

    // Travel Speeds (average in km/h)
    const walkingSpeed = 4.5; // km/h
    const bicycleSpeed = 12.0; // km/h
    const motorbikeSpeed = 30.0; // km/h
    const carSpeed = 40.0; // km/h

    const walkingMinutes = Math.max(1, Math.round((distanceMeters / 1000 / walkingSpeed) * 60));
    const bicycleMinutes = Math.max(1, Math.round((distanceMeters / 1000 / bicycleSpeed) * 60));
    const motorbikeMinutes = Math.max(1, Math.round((distanceMeters / 1000 / motorbikeSpeed) * 60));
    const carMinutes = Math.max(1, Math.round((distanceMeters / 1000 / carSpeed) * 60));

    return {
      distanceMeters,
      distanceKm,
      walkingMinutes,
      bicycleMinutes,
      motorbikeMinutes,
      carMinutes,
      startLat,
      startLng,
      endLat,
      endLng
    };
  }, [activeRouteHousehold, routeOrigin, myLocation]);

  // Handle Route Calculation & Rendering
  const handleCalculateRoute = (household: HouseholdRecord) => {
    setActiveRouteHousehold(household);
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (routeMarkersLayerRef.current) {
      routeMarkersLayerRef.current.clearLayers();
    }

    const startLat = routeOrigin === 'my_location' && myLocation ? myLocation.lat : schoolLat;
    const startLng = routeOrigin === 'my_location' && myLocation ? myLocation.lng : schoolLng;
    const endLat = household.lat;
    const endLng = household.lng;

    // Realistic waypoint interpolation simulating village road path
    const midLat1 = startLat + (endLat - startLat) * 0.35 + (endLng - startLng) * 0.15;
    const midLng1 = startLng + (endLng - startLng) * 0.4 - (endLat - startLat) * 0.15;
    const midLat2 = startLat + (endLat - startLat) * 0.7 - (endLng - startLng) * 0.05;
    const midLng2 = startLng + (endLng - startLng) * 0.75 + (endLat - startLat) * 0.05;

    const latlngs: L.LatLngExpression[] = [
      [startLat, startLng],
      [midLat1, midLng1],
      [midLat2, midLng2],
      [endLat, endLng]
    ];

    // Glow background polyline
    const polylineBg = L.polyline(latlngs, {
      color: '#059669',
      weight: 8,
      opacity: 0.4,
      lineCap: 'round'
    });

    // Primary route polyline
    const polyline = L.polyline(latlngs, {
      color: '#10b981',
      weight: 5,
      opacity: 0.95,
      dashArray: '8, 8',
      lineCap: 'round'
    });

    const routeGroup = L.featureGroup([polylineBg, polyline]);
    routeGroup.addTo(map);
    routeLayerRef.current = polyline;

    // Fit map bounds to show full route comfortably
    map.fitBounds(polyline.getBounds(), { padding: [80, 80], maxZoom: 17 });
  };

  // Clear Active Route
  const handleClearRoute = () => {
    setActiveRouteHousehold(null);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (routeMarkersLayerRef.current) {
      routeMarkersLayerRef.current.clearLayers();
    }
    map.setView([schoolLat, schoolLng], 15, { animate: true });
  };

  // Get Current User GPS Location
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      alert('ឧបករណ៍របស់អ្នកមិនគាំទ្រប្រព័ន្ធ Geolocation ទេ');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(coords);
        setRouteOrigin('my_location');
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([coords.lat, coords.lng], 16, { animate: true });
        }

        if (activeRouteHousehold) {
          handleCalculateRoute(activeRouteHousehold);
        }
      },
      err => {
        console.error(err);
        setIsLocating(false);
        alert('មិនអាចកំណត់ទីតាំងបច្ចុប្បន្នបានទេ។ សូមពិនិត្យការអនុញ្ញាត GPS Location ក្នុង Browser។');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Reset Map View to Center
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([schoolLat, schoolLng], 15, { animate: true });
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-[750px]'}`}>
      {/* Top Header Control Bar */}
      <div className="bg-slate-950/95 border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white backdrop-blur-md z-10">
        {/* Title and Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-inner">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-moul text-sm text-emerald-300">ផែនទីខ្នងផ្ទះសិស្សក្នុងតំបន់សេវា</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {filteredHouseholds.length} / {households.length} ខ្នង
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {schoolProfile.nameKhmer} • {schoolProfile.village}, {schoolProfile.commune}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Names Button */}
          <button
            onClick={() => setShowNamesAlways(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${showNamesAlways ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
            title="បង្ហាញឈ្មោះមេគ្រួសារនៅជាប់រូបផ្ទះលើផែនទី"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ឈ្មោះមេគ្រួសារ៖</span>
            <span>{showNamesAlways ? 'បើក' : 'បិទ'}</span>
          </button>

          {/* Layer Selector */}
          <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setActiveTile('streets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${activeTile === 'streets' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="ផែនទីផ្លូវធម្មតា"
            >
              ផ្លូវ
            </button>
            <button
              onClick={() => setActiveTile('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${activeTile === 'satellite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="ផែនទីផ្កាយរណប"
            >
              ផ្កាយរណប
            </button>
            <button
              onClick={() => setActiveTile('light')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${activeTile === 'light' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="ផែនទីពណ៌ស្រាល"
            >
              ទំនើប
            </button>
          </div>

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all"
            title="កណ្តាលផែនទីលើសាលារៀន"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Current GPS location */}
          <button
            onClick={handleGetMyLocation}
            disabled={isLocating}
            className={`p-2 rounded-xl border transition-all ${myLocation ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}`}
            title="កំណត់ទីតាំង GPS របស់ខ្ញុំ"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${sidebarOpen ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-800/60 text-slate-400 border-slate-800'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">បញ្ជីខ្នងផ្ទះ</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all"
            title={isFullscreen ? 'បិទពេញអេក្រង់' : 'ពង្រីកពេញអេក្រង់'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area (Map + Sidebars) */}
      <div className="relative flex-1 w-full h-full flex overflow-hidden">
        {/* Left Side: Filter and Household List Drawer */}
        {sidebarOpen && (
          <div className="w-80 md:w-96 bg-slate-950/95 border-r border-slate-800/80 flex flex-col h-full z-10 backdrop-blur-md shrink-0">
            {/* Search & Filter Inputs */}
            <div className="p-3 border-b border-slate-800/80 space-y-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមលេខផ្ទះ, ឈ្មោះមេគ្រួសារ, សិស្ស..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Dropdowns Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Village Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">ភូមិ</label>
                  <select
                    value={selectedVillage}
                    onChange={e => setSelectedVillage(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">គ្រប់ភូមិទាំងអស់</option>
                    {villages.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Living Standard / Poverty Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">ស្ថានភាពជីវភាព</label>
                  <select
                    value={selectedPoverty}
                    onChange={e => setSelectedPoverty(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">គ្រប់កម្រិតជីវភាព</option>
                    <option value="ទូទៅ">🟢 ទូទៅ (Normal)</option>
                    <option value="ក្រ១">🔴 ក្រ១ (IDPoor 1)</option>
                    <option value="ក្រ២">🟠 ក្រ២ (IDPoor 2)</option>
                    <option value="ងាយរងគ្រោះ">🟣 ងាយរងគ្រោះ</option>
                  </select>
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800/60">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> ទូទៅ</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> ក្រ១</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> ក្រ២</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> ងាយរងគ្រោះ</span>
              </div>
            </div>

            {/* List of Households */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredHouseholds.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <MapPin className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs">រកមិនឃើញខ្នងផ្ទះតាមលក្ខខណ្ឌស្វែងរកនេះទេ</p>
                </div>
              ) : (
                filteredHouseholds.map(h => {
                  const poverty = getPovertyColor(h.familyStatus);
                  const isSelected = h.id === selectedHouseholdId || h.id === activeRouteHousehold?.id;
                  const studentMembers = h.members.filter(m => m.isStudentAtSchool);

                  return (
                    <div
                      key={h.id}
                      onClick={() => {
                        if (mapInstanceRef.current && h.lat && h.lng) {
                          mapInstanceRef.current.setView([h.lat, h.lng], 17, { animate: true });
                          setHoveredHouseholdId(h.id);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${isSelected ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg' : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800/80 hover:border-slate-700'}`}
                    >
                      {/* House Top Details */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-100">{h.headName}</h4>
                            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
                              {h.houseNumber ? 'ផ្ទះ ' + h.houseNumber : 'គ្មានលេខ'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{h.village} • {h.commune}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap" style={{ backgroundColor: `${poverty.bg}22`, color: poverty.bg, borderColor: `${poverty.bg}55` }}>
                          {h.familyStatus}
                        </span>
                      </div>

                      {/* Students enrolled */}
                      {studentMembers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-slate-400">សិស្ស៖</span>
                          {studentMembers.map(st => (
                            <span key={st.id || st.name} className="px-1.5 py-0.2 bg-blue-900/40 text-blue-300 border border-blue-800/60 rounded text-[10px]">
                              {st.name} ({st.studentGrade || 'N/A'}{st.studentSection || ''})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCalculateRoute(h);
                          }}
                          className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>បង្ហាញផ្លូវ</span>
                        </button>
                        {onSelectHousehold && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectHousehold(h);
                            }}
                            className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
                            title="មើលព័ត៌មានលម្អិតជំរឿន"
                          >
                            <Eye className="w-3 h-3" />
                            <span>លម្អិត</span>
                          </button>
                        )}
                        {isDirector && onDeleteHousehold && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteHousehold(h.id, h.headName);
                            }}
                            className="py-1 px-2 bg-red-900/30 hover:bg-red-800/60 text-red-400 border border-red-800/60 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
                            title="លុបខ្នងផ្ទះ (សិទ្ធិនាយកសាលា)"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>លុប</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Map Container */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full bg-slate-950 z-0" />

        {/* Active Route Floating Card Overlay */}
        {activeRouteHousehold && routeMetrics && (
          <div className="absolute top-4 right-4 max-w-sm w-full bg-slate-950/95 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white z-20 space-y-3.5 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Route Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-300 font-moul">ផ្លូវទៅផ្ទះសិស្ស</h4>
                  <p className="text-xs text-slate-300">{activeRouteHousehold.headName} (ផ្ទះ {activeRouteHousehold.houseNumber || 'N/A'})</p>
                </div>
              </div>
              <button
                onClick={handleClearRoute}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="បិទការបង្ហាញផ្លូវ"
              >
                ✕
              </button>
            </div>

            {/* Origin & Destination Summary */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                <span className="text-slate-400">ចេញដំណើរ៖</span>
                <span className="font-semibold text-slate-200 truncate">
                  {routeOrigin === 'my_location' ? 'ទីតាំងបច្ចុប្បន្នរបស់ខ្ញុំ' : 'សាលាបឋមសិក្សាភ្នំពុំ'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-400">គោលដៅ៖</span>
                <span className="font-semibold text-emerald-300 truncate">
                  {activeRouteHousehold.village} (ផ្ទះ {activeRouteHousehold.houseNumber || 'N/A'})
                </span>
              </div>
            </div>

            {/* Total Distance Big Badge */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ចម្ងាយផ្លូវសរុប</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-300">
                    {routeMetrics.distanceMeters >= 1000 ? routeMetrics.distanceKm : routeMetrics.distanceMeters}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {routeMetrics.distanceMeters >= 1000 ? 'គីឡូម៉ែត្រ (km)' : 'ម៉ែត្រ (m)'}
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                <Navigation className="w-6 h-6" />
              </div>
            </div>

            {/* Travel Duration by 4 Transport Modes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300">រយៈពេលធ្វើដំណើរតាមមធ្យោបាយ៖</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Motorbike */}
                <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">ជិះម៉ូតូ (~30km/h)</span>
                    <p className="font-bold text-amber-300">{routeMetrics.motorbikeMinutes} នាទី</p>
                  </div>
                </div>

                {/* Bicycle */}
                <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">ជិះកង់ (~12km/h)</span>
                    <p className="font-bold text-blue-300">{routeMetrics.bicycleMinutes} នាទី</p>
                  </div>
                </div>

                {/* Walking */}
                <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">ថ្មើរជើង (~4.5km/h)</span>
                    <p className="font-bold text-emerald-300">{routeMetrics.walkingMinutes} នាទី</p>
                  </div>
                </div>

                {/* Car */}
                <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">រថយន្ត (~40km/h)</span>
                    <p className="font-bold text-purple-300">{routeMetrics.carMinutes} នាទី</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Turn-by-Turn in Google Maps Button */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${routeMetrics.startLat},${routeMetrics.startLng}&destination=${routeMetrics.endLat},${routeMetrics.endLng}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>បើកការរុករកផ្ទាល់ក្នុង Google Maps App</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
