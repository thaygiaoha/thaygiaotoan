import React, { useState, useEffect } from 'react';
import { NEWS_DATA, IMAGES_CAROUSEL, DANHGIA_URL } from '../config';
import { AppUser, Student } from '../types';

const ADMIN_CONFIG = {
  quizPassword: "66668888",
  schools: ["THPT Yên Dũng số 2", "THPT Lạng Giang số 1", "Khác"],
  banks: ["Vietcombank", "Agribank", "MB Bank", "Khác"]
};

const OTHER_APPS = [
  { label: "Nhóm Zalo hỗ trợ", icon: "fab fa-comment", link: "https://zalo.me/0988948882" },
  { label: "Kênh Youtube Toán", icon: "fab fa-youtube", link: "https://youtube.com/..." },
  { label: "Máy tính Online", icon: "fas fa-calculator", link: "https://www.desmos.com/scientific" },
  { label: "Từ điển Toán học", icon: "fas fa-language", link: "https://..." }
];

const rankIcon = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
};

const formatPhoneHidden = (phone: string) => {
  if (!phone || phone.length < 7) return "09xxx****";
  return phone.slice(0, 2) + "xxx" + phone.slice(-4);
};

interface LandingPageProps {
  onSelectGrade: (grade: number) => void;
  onSelectQuiz: (num: number, pts: number, quizStudent: Partial<Student>) => void;
  user: AppUser | null;
  onOpenAuth: () => void;
  onOpenVip: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectGrade, onSelectQuiz, user, onOpenAuth, onOpenVip }) => {
  const [quizMode, setQuizMode] = useState<'free' | 'gift' | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [isOtherSchool, setIsOtherSchool] = useState(false);
  const [isOtherBank, setIsOtherBank] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState<{num: number, pts: number} | null>(null);
  const [quizInfo, setQuizInfo] = useState({ name: '', class: '', school: '', phone: '' });
  const [bankInfo, setBankInfo] = useState({ stk: '', bankName: '' });
  
  const [showRateModal, setShowRateModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingRate, setIsSubmittingRate] = useState(false);
  const [stats, setStats] = useState<{ratings: Record<number, number>, top10: any[]}>({
    ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    top10: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await fetch(`${DANHGIA_URL}?type=getStats&t=${Date.now()}`);
        const result = await resp.json();
        if (result.status === "success") setStats(result.data);
      } catch (e) { console.error(e); }
    };
    fetchStats();
    const interval = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % IMAGES_CAROUSEL.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizMode === 'gift' && inputPassword !== ADMIN_CONFIG.quizPassword) return alert("Mật khẩu Quà QuiZ không chính xác!");
    if (!quizInfo.name || !quizInfo.phone) return alert("Vui lòng nhập đầy đủ thông tin!");
    
    onSelectQuiz(showQuizModal!.num, showQuizModal!.pts, {
      ...quizInfo,
      phoneNumber: quizInfo.phone,
      stk: quizMode === 'gift' ? bankInfo.stk : "Tự do",
      bank: quizMode === 'gift' ? bankInfo.bankName : "Tự do"
    });
    setShowQuizModal(null);
    setQuizMode(null);
  };

  const totalRatings = (Object.values(stats.ratings) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans overflow-x-hidden px-2">
      <style>{`
        @keyframes marquee-slow { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee-slow { animation: marquee-slow 30s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* 1. HEADER BUTTONS */}
      <div className="flex justify-center mt-4">
        <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100 flex flex-nowrap overflow-x-auto gap-3 no-scrollbar items-center max-w-full">
          <div className="bg-red-600 text-white px-6 rounded-2xl shadow-lg flex items-center justify-center h-[60px] border-b-4 border-red-800 animate-pulse shrink-0">
            <span className="font-black text-sm uppercase">Kiểm tra Online →</span>
          </div>
          {[9, 10, 11, 12].map(g => (
            <button key={g} onClick={() => onSelectGrade(g)} className="px-6 bg-blue-600 text-white border-b-4 border-blue-800 rounded-2xl font-black text-sm shrink-0 hover:brightness-110 h-[60px] min-w-[120px]">
              LỚP {g}
            </button>
          ))}
          <button onClick={() => setShowQuizModal({num: 10, pts: 1})} className="px-6 bg-orange-500 text-white border-b-4 border-orange-700 rounded-2xl font-black text-sm shrink-0 h-[60px] min-w-[130px]">
            <i className="fas fa-bolt mr-2"></i> QUIZ 10
          </button>
          <button onClick={() => setShowQuizModal({num: 20, pts: 0.5})} className="px-6 bg-orange-500 text-white border-b-4 border-orange-700 rounded-2xl font-black text-sm shrink-0 h-[60px] min-w-[130px]">
            <i className="fas fa-brain mr-2"></i> QUIZ 20
          </button>
        </div>
      </div>

      {/* 2. MARQUEE */}
      <div className="flex justify-center">
        <div className="bg-indigo-700 py-3 rounded-2xl overflow-hidden shadow-inner border-b-4 border-indigo-900 w-full max-w-5xl">
          <div className="animate-marquee-slow whitespace-nowrap text-white font-black uppercase text-[11px] tracking-widest">
            ⭐ Chào mừng các bạn đến với Hệ thống học tập trực tuyến môn Toán ! &nbsp;&nbsp;&nbsp; ⭐ Luyện tập chăm chỉ mỗi ngày để bứt phá điểm số! &nbsp;&nbsp;&nbsp; ⭐ Liên hệ: 0988.948.882
          </div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT (3 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto w-full px-2">
        
        {/* CỘT TRÁI: TOP 10 */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-3 border border-slate-100 flex flex-col h-full">
          <h3 className="text-center font-black text-indigo-600 text-sm mb-3 uppercase italic">👑 TOP 10 QUIZ TUẦN</h3>
          <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1 no-scrollbar flex-grow">
            {stats.top10?.length > 0 ? stats.top10.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-[11px] truncate text-slate-800">{index + 1}. {item.name} {rankIcon(index + 1)}</span>
                  <span className="text-[9px] text-slate-400 font-bold">{formatPhoneHidden(item.phone || item.idPhone)}</span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="font-black text-red-600 text-[11px]">{item.score || item.tongdiem} đ</span>
                  <span className="text-[8px] text-slate-400 italic">{item.fulltime}</span>
                </div>
              </div>
            )) : <div className="text-center text-slate-400 text-xs py-10 font-bold">ĐANG CẬP NHẬT...</div>}
          </div>
        </div>

        {/* CỘT GIỮA: CAROUSEL */}
        <div className="lg:col-span-7">
          <div className="relative h-64 md:h-full min-h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            {IMAGES_CAROUSEL.map((img, idx) => (
              <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImg ? 'opacity-100' : 'opacity-0'}`} alt="Carousel" />
            ))}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-black text-sm uppercase tracking-widest text-center">Học tập chuyên nghiệp - Kết quả bứt phá</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: ACTIONS */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <button onClick={() => window.open("https://new-chat-bot-two.vercel.app/", '_blank')} className="w-full flex-1 flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-indigo-900 p-2">
            <i className="fas fa-headset text-lg"></i><span>Trợ lý học tập</span>
          </button>

          <button onClick={() => window.open("https://www.facebook.com/hoctoanthayha.bg", '_blank')} className="w-full flex-1 flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-indigo-900 p-2">
            <i className="fas fa-users text-lg"></i><span>Đăng ký học Toán</span>
          </button>

          {/* NÚT ỨNG DỤNG KHÁC (DROPDOWN) */}
          <div className="relative group w-full flex-1">
            <button className="w-full h-full flex flex-col items-center justify-center gap-1 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-teal-800 p-2">
              <i className="fas fa-th text-lg"></i><span>Ứng dụng khác <i className="fas fa-chevron-up ml-1 text-[8px]"></i></span>
            </button>
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 hidden group-hover:block z-[100] p-2 animate-bounce-short">
              {OTHER_APPS.map((app, idx) => (
                <a key={idx} href={app.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 hover:bg-teal-50 rounded-xl transition-colors">
                  <i className={`${app.icon} text-teal-600 w-5`}></i>
                  <span className="text-[10px] font-black text-slate-700 uppercase">{app.label}</span>
                </a>
              ))}
            </div>
          </div>

          <button onClick={onOpenAuth} className="w-full flex-1 flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-indigo-900 p-2">
            <i className="fas fa-sign-in-alt text-lg"></i><span>{user ? `SĐT: ${user.phoneNumber}` : "Đăng Nhập"}</span>
          </button>

          <button onClick={onOpenVip} className="w-full flex-1 flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-orange-700 p-2">
            <i className="fas fa-gem text-lg"></i><span>Nâng Cấp VIP</span>
          </button>
        </div>
      </div>

      {/* 4. NEWS SECTION */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 border-b-8 border-slate-200 max-w-7xl mx-auto w-full mt-4">
        <h4 className="font-black text-blue-700 uppercase text-xs tracking-widest border-l-4 border-blue-600 pl-4 mb-6">Thông báo hệ thống</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NEWS_DATA.slice(0, 6).map((news, i) => (
            <a key={i} href={news.link} target="_blank" rel="noreferrer" className="block p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-100 transition-all hover:shadow-md">
              <p className="text-[11px] font-bold text-slate-700 leading-snug line-clamp-2"> {news.title}</p>
            </a>
          ))}
        </div>
      </div>

      {/* 5. FOOTER & MODALS (Giữ nguyên logic của bạn) */}
      <footer className="mt-8 border-t border-slate-200 pt-10 pb-6 text-center space-y-4 bg-slate-50/50 rounded-t-[3rem]">
          <div className="max-w-xs mx-auto mb-4">
              <button onClick={() => setShowRateModal(true)} className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-black text-sm shadow-xl hover:scale-105 transition-all border-b-4 border-orange-600 uppercase">⭐ ĐÁNH GIÁ WEB</button>
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2025 KÊNH HỌC TOÁN TRỰC TUYẾN - ADMIN: THẦY HÀ</p>
      </footer>

      {/* MODAL QUIZ (Sửa lỗi step-by-step) */}
      {showQuizModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black text-orange-500 mb-6 uppercase text-center">
              {quizMode === 'gift' ? '🎁 Chế độ Quà QuiZ' : quizMode === 'free' ? '🎮 QuiZ Tự Do' : '🚀 Chọn chế độ chơi'}
            </h2>

            {!quizMode ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => setQuizMode('free')} className="py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-lg">
                  <i className="fas fa-gamepad text-xl"></i> Chơi Tự Do
                </button>
                <button onClick={() => setQuizMode('gift')} className="py-4 bg-orange-500 text-white rounded-2xl font-bold uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-orange-200">
                  <i className="fas fa-gift text-xl"></i> Săn Quà QuiZ
                </button>
                <button onClick={() => setShowQuizModal(null)} className="mt-2 text-slate-400 text-sm font-bold">Để sau</button>
              </div>
            ) : (
              <form onSubmit={handleStartQuiz} className="space-y-4 animate-fade-in">
                {quizMode === 'gift' && (
                  <input required type="password" placeholder="Nhập mật khẩu Admin cấp" className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-xl font-bold text-center" value={inputPassword} onChange={e => setInputPassword(e.target.value)} />
                )}
                <input required placeholder="Họ và tên học sinh" className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={quizInfo.name} onChange={e=>setQuizInfo({...quizInfo, name: e.target.value})} />
                <input required type="tel" placeholder="Số điện thoại" className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={quizInfo.phone} onChange={e=>setQuizInfo({...quizInfo, phone: e.target.value})} />
                
                <select required className="w-full p-3 bg-slate-100 rounded-xl font-bold" onChange={(e) => {
                  const val = e.target.value;
                  setIsOtherSchool(val === "Khác");
                  setQuizInfo({...quizInfo, school: val});
                }}>
                  <option value="">-- Chọn trường học --</option>
                  {ADMIN_CONFIG.schools.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {quizMode === 'gift' && (
                  <div className="p-4 bg-orange-50 rounded-2xl space-y-3 border border-orange-100">
                    <p className="text-[10px] font-black text-orange-400 uppercase text-center">Thông tin nhận thưởng</p>
                    <input required placeholder="Số tài khoản ngân hàng" className="w-full p-3 bg-white rounded-xl font-bold" value={bankInfo.stk} onChange={e=>setBankInfo({...bankInfo, stk: e.target.value})} />
                    <select required className="w-full p-3 bg-white rounded-xl font-bold" onChange={(e) => {
                      const val = e.target.value;
                      setIsOtherBank(val === "Khác");
                      setBankInfo({...bankInfo, bankName: val});
                    }}>
                      <option value="">-- Ngân hàng --</option>
                      {ADMIN_CONFIG.banks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}
                <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl uppercase tracking-widest mt-4">Vào Thi Ngay</button>
                <button type="button" onClick={() => setQuizMode(null)} className="w-full text-slate-400 text-xs font-bold uppercase">Quay lại chọn chế độ</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL ĐÁNH GIÁ (Giữ nguyên của bạn) */}
      {showRateModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
              <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center">
                  <h3 className="font-black mb-4 uppercase">Đánh giá hệ thống</h3>
                  <div className="flex justify-center gap-2 mb-4">
                      {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRating(s)} className={`text-3xl ${s <= rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</button>)}
                  </div>
                  <textarea className="w-full p-3 bg-slate-100 rounded-xl mb-4 h-24" placeholder="Cảm nhận của bạn..." onChange={e => setComment(e.target.value)}></textarea>
                  <div className="flex gap-2">
                      <button onClick={() => setShowRateModal(false)} className="flex-1 p-3 bg-slate-200 rounded-xl font-bold">ĐÓNG</button>
                      <button onClick={() => alert("Cảm ơn bạn!")} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">GỬI</button>
                  </div>
              </div>
          </div>
      )}

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
};

export default LandingPage;
