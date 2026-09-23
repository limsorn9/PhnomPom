import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, GraduationCap, Send, Smartphone, ChevronDown } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export const LoginPage: React.FC = () => {
  const { login, showToast } = useSchool();
  const [username, setUsername] = useState('limsorn');
  const [password, setPassword] = useState('Ls12122012@');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);

  // Auto-slide tablet mockup
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => prev >= 7 ? 1 : prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ និងលេខសម្ងាត់', 'error');
      return;
    }
    // Hardcode Lim Sorn login to guarantee instantaneous redirect to teacher dashboard as requested
    const success = await login('limsorn', 'Ls12122012@');
    if (!success) {
      showToast('ឈ្មោះអ្នកប្រើប្រាស់ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#06171b] text-slate-100 font-kantumruy selection:bg-cyan-900 selection:text-white flex flex-col relative overflow-hidden">
      
      {/* 1. Top Navigation Bar */}
      <header className="px-4 md:px-8 py-4 flex items-center justify-between border-b border-[#164049]/40 z-10 sticky top-0 bg-[#06171b]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-[#06171b] shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg hidden sm:block tracking-wide">KrouDigital<span className="text-emerald-400">4.0</span></span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-emerald-400 transition">តម្លើងកម្មវិធី</a>
          <a href="#" className="hover:text-emerald-400 transition">តម្លៃ</a>
          <a href="#" className="hover:text-emerald-400 transition">អំពីកម្មវិធី</a>
          <a href="#" className="hover:text-emerald-400 transition">អ្នកបង្កើត</a>
          <a href="#" className="hover:text-emerald-400 transition">ទំនាក់ទំនង</a>
          <a href="#" className="hover:text-emerald-400 transition">ឯកជនភាព</a>
          <a href="#" className="hover:text-emerald-400 transition">លក្ខខណ្ឌ</a>
        </nav>
        
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-full text-sm font-bold transition shadow-lg shadow-cyan-600/30">
          ចូលប្រើ
        </button>
      </header>

      {/* 2. Main Split Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 md:p-8 lg:p-12 gap-12 lg:gap-24 z-10 w-full max-w-7xl mx-auto">
        
        {/* Left Column: Showcase & Mockup */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
          <div className="mb-8 max-w-xl">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-sm">ប្រព័ន្ធគ្រប់គ្រងសាលា</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              គ្រប់គ្រងពិន្ទុសិស្ស<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ងាយស្រួលសម្រាប់លោកគ្រូ អ្នកគ្រូ</span>
            </h1>
            <p className="text-emerald-400 font-medium text-lg mb-8 tracking-wide">
              ពិន្ទុ · វត្តមាន · របាយការណ៍
            </p>
          </div>

          {/* Tablet Mockup Carousel */}
          <div className="relative w-full max-w-lg aspect-[4/3] bg-[#0a2126] border-8 border-[#0d282e] rounded-3xl shadow-2xl overflow-hidden shadow-emerald-900/20 hidden sm:block">
            {/* Tablet Camera Hole */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full mt-2 z-20"></div>
            
            {/* Screen Content */}
            <div className="absolute inset-0 bg-[#07191d] flex flex-col items-center justify-center border border-[#164049]">
              <div className="text-[#164049] mb-4">
                <GraduationCap className="w-24 h-24 opacity-50" />
              </div>
              <p className="text-emerald-400/50 font-bold text-xl">មើលគំរូទំព័រទី {currentSlide}</p>
              <p className="text-slate-500 text-sm mt-2">កំពុងផ្ទុកទិន្នន័យ...</p>
            </div>
            
            {/* Carousel Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-20">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div 
                  key={num} 
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === num ? 'bg-emerald-400 w-4' : 'bg-[#164049]'}`}
                />
              ))}
            </div>
            <div className="absolute top-4 right-4 bg-[#0a2126]/80 backdrop-blur text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-[#164049]">
              {currentSlide} / 7
            </div>
          </div>
        </div>

        {/* Right Column: Login Box */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-[#0a2126]/90 border border-[#164049] rounded-2xl p-6 sm:p-8 relative shadow-2xl backdrop-blur-md">
            {/* Corner Bracket Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-xl translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-xl -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl translate-x-1 translate-y-1"></div>

            <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-8">ចូលប្រើ</h2>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  USERNAME ឬ អ៊ីមែល
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#07191d] border border-[#164049] text-slate-100 rounded-xl pl-4 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="username ឬ you@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  លេខសម្ងាត់
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#07191d] border border-[#164049] text-slate-100 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors tracking-widest"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20 mt-2"
              >
                ចូលប្រព័ន្ធ
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-[#164049] flex-1"></div>
              <span className="text-slate-500 text-xs font-medium">ឬ</span>
              <div className="h-px bg-[#164049] flex-1"></div>
            </div>

            <div className="space-y-3">
              <button className="bg-[#0e2c33] hover:bg-[#143e48] border border-[#1d525e] text-slate-100 w-full py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-3">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                ចូលដោយប្រើ Google
              </button>
              
              <button className="bg-[#0e2c33] hover:bg-[#143e48] border border-[#1d525e] text-cyan-300 w-full py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-3">
                <Send className="w-4 h-4" />
                ចូលដោយប្រើ Telegram
              </button>
            </div>

            <div className="mt-6 text-center">
              <a href="#" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition cursor-pointer">
                <Smartphone className="w-3 h-3" />
                Scan QR ចូលប្រើប្រាស់
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-[#164049]/50 flex justify-center">
              <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition">
                ចូលក្នុងនាម សិស្ស · មាតាបិតា · នាយក <ChevronDown className="w-3 h-3 ml-1" />
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* 3. Footer Info */}
      <footer className="py-6 border-t border-[#164049]/40 mt-auto text-center z-10 bg-[#06171b]/80 backdrop-blur-md">
        <p className="text-slate-500 text-xs mb-1">© 2026 KrouDigital4.0 · បឋមសិក្សា · មធ្យមសិក្សា</p>
        <p className="text-slate-600 text-[10px]">បង្កើតដោយ រដ្ឋ ឆាយ · គ្រូបឋមសិក្សា</p>
      </footer>
      
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
};
