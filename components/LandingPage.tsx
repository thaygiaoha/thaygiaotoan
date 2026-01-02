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
    if (quizMode === 'gift' && inputPassword !== ADMIN_CONFIG.quizPassword) return alert("Sai mật khẩu!");
    if (!quizInfo.name || !quizInfo.phone) return alert("Thiếu thông tin!");
    
    onSelectQuiz(showQuizModal!.num, showQuizModal!.pts, {
      ...quizInfo,
      phoneNumber: quizInfo.phone,
      stk: quizMode === 'gift' ? bankInfo.stk : "Tự do",
      bank: quizMode === 'gift' ? bankInfo.bankName : "Tự do"
    });
    setShowQuizModal(null);
  };

  const totalRatings = (Object.values(stats.ratings) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans overflow-x-hidden px-2 md:px-4">
      {/* Nhúng CSS Animation */}
      <style>{`
        @keyframes marquee-slow {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 25s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* 1. Header Buttons */}
      <div className="flex justify-center mt-4">
        <div className="bg-white p-2 rounded-3xl shadow-lg border flex flex-nowrap overflow-x-auto gap-3 no-scrollbar w-full max-w-6xl">
          <div className="bg-red-600 text-white px-6 rounded-2xl flex items-center justify-center h-[60px] animate-pulse shrink-0 font-black text-sm uppercase">
            Kiểm tra Online →
          </div>
          {[9, 10, 11, 12].map(g => (
            <button key={g} onClick={() => onSelectGrade(g)} className="px-6 bg-blue-600 text-white border-b-4 border-blue-800 rounded-2xl font-black h-[60px] shrink-0 min-w-[120px]">
              LỚP {g}
            </button>
          ))}
          <button onClick={() => setShowQuizModal({num: 10, pts: 1})} className="px-6 bg-orange-500 text-white border-b-4 border-orange-700 rounded-2xl font-black h-[60px] shrink-0 min-w-[130px]">
            QUIZ 10
          </button>
        </div>
      </div>

      {/* 2. Marquee */}
      <div className="flex justify-center">
        <div className="bg-indigo-700 py-3 rounded-2xl overflow-hidden shadow-inner border-b-4 border-indigo-900 w-full max-w-5xl">
          <div className="animate-marquee-slow whitespace-nowrap text-white font-black uppercase text-[11px] tracking-widest">
            ⭐ Chào mừng các bạn đến với Hệ thống học tập trực tuyến môn Toán ! &nbsp;&nbsp;&nbsp; ⭐ Luyện tập chăm chỉ để bứt phá điểm số! &nbsp;&nbsp;&nbsp; ⭐ Admin: 0988.948.882
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-7xl mx-auto w-full">
        
        {/* CỘT TRÁI: TOP 10 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2rem] shadow-xl border-b-4 border-blue-200 h-full flex flex-col overflow-hidden">
            <div className="bg-blue-600 p-4 text-white font-black text-xs uppercase text-center">
              👑 TOP 10 QUIZ TUẦN
            </div>
            <div className="p-2 space-y-2 bg-slate-50 flex-grow overflow-y-auto max-h-[450px]">
              {stats.top10?.length > 0 ? stats.top10.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white rounded-xl p-3 border shadow-sm">
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-[11px] truncate text-slate-800">
                      {index + 1}. {item.name} {rankIcon(index + 1)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">{formatPhoneHidden(item.phone || item.idPhone)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-red-600 text-[11px]">{item.score || item.tongdiem}đ</span>
                  </div>
                </div>
              )) : <div className="text-center py-10 text-slate-400 text-xs font-bold">ĐANG CẬP NHẬT...</div>}
            </div>
          </div>
        </div>

        {/* CỘT GIỮA: CAROUSEL */}
        <div className="lg:col-span-7">
          <div className="relative h-64 md:h-full min-h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            {IMAGES_CAROUSEL.map((img, idx) => (
              <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImg ? 'opacity-100' : 'opacity-0'}`} alt="Carousel" />
            ))}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center">
              <p className="text-white font-black text-sm uppercase tracking-widest">Học tập chuyên nghiệp - Kết quả bứt phá</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: ACTIONS */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <button onClick={() => window.open("https://new-chat-bot-two.vercel.app/", '_blank')} className="flex-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-indigo-900 p-2 flex flex-col items-center justify-center">
            <i className="fas fa-headset text-lg mb-1"></i> Trợ lý học tập
          </button>
          <button onClick={() => window.open("https://www.facebook.com/hoctoanthayha.bg", '_blank')} className="flex-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-indigo-900 p-2 flex flex-col items-center justify-center">
            <i className="fas fa-users text-lg mb-1"></i> Đăng ký học toán
          </button>
          <button onClick={onOpenAuth} className="flex-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-indigo-900 p-2 flex flex-col items-center justify-center">
            <i className="fas fa-sign-in-alt text-lg mb-1"></i> {user ? user.phoneNumber : "Đăng Nhập"}
          </button>
          <button onClick={onOpenVip} className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-orange-700 p-2 flex flex-col items-center justify-center">
            <i className="fas fa-gem text-lg mb-1"></i> Nâng Cấp VIP
          </button>
        </div>
      </div>

      {/* 4. News Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-b-8 border-slate-200 max-w-7xl mx-auto w-full">
        <h4 className="font-black text-blue-700 uppercase text-xs border-l-4 border-blue-600 pl-4 mb-6">Thông báo hệ thống</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NEWS_DATA.slice(0, 6).map((news, i) => (
            <a key={i} href={news.link} target="_blank" rel="noreferrer" className="p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border transition-all">
              <p className="text-[11px] font-bold text-slate-700 line-clamp-2">{news.title}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Footer & Modals... (Giữ nguyên phần Modal của bạn vì cấu trúc Logic đã ổn) */}
      <footer className="text-center py-10 bg-slate-100 rounded-t-[3rem]">
         <p className="text-[10px] font-black text-slate-500 uppercase">© 2026 HỆ THỐNG HỌC TOÁN THẦY HÀ - YÊN DŨNG 2</p>
      </footer>

      {/* Copy phần ShowQuizModal từ bản trước của bạn vào đây */}
      {showQuizModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
              {/* Form nhập liệu của bạn */}
              <div className="bg-white p-8 rounded-[2rem] w-full max-w-md">
                  <h2 className="text-center font-black text-orange-500 mb-4">THÔNG TIN QUIZ</h2>
                  <form onSubmit={handleStartQuiz} className="flex flex-col gap-3">
                      <input required placeholder="Họ tên" className="p-3 bg-slate-100 rounded-xl" onChange={e => setQuizInfo({...quizInfo, name: e.target.value})} />
                      <input required placeholder="Số điện thoại" className="p-3 bg-slate-100 rounded-xl" onChange={e => setQuizInfo({...quizInfo, phone: e.target.value})} />
                      <button className="bg-orange-500 text-white p-4 rounded-xl font-black">BẮT ĐẦU</button>
                      <button type="button" onClick={() => setShowQuizModal(null)} className="text-slate-400 text-xs">HỦY BỎ</button>
                  </form>
              </div>
          </div>
      )}

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
};

export default LandingPage;
