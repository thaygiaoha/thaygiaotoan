
import React, { useState, useEffect } from 'react';
import { NEWS_DATA, IMAGES_CAROUSEL, DANHGIA_URL } from '../config';
import { AppUser, Student } from '../types';
const ADMIN_CONFIG = {
  quizPassword: "66668888", // Thay bằng mật khẩu bạn muốn
  schools: ["THPT Yên Dũng số 2", "THPT Yên Dũng số 2", "THPT Lạng Giang số 1", "Khác"],
  banks: ["Vietcombank", "Agribank", "MB Bank", "Khác"] };

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
        if (result.status === "success") {
          setStats(result.data);
        }
      } catch (e) {
        console.error("Lỗi lấy thống kê:", e);
      }
    };
    fetchStats();
    
    const interval = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % IMAGES_CAROUSEL.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

 const handleStartQuiz = (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. Kiểm tra mật khẩu nếu ở chế độ Quà
  if (quizMode === 'gift' && inputPassword !== ADMIN_CONFIG.quizPassword) {
    return alert("Mật khẩu Quà QuiZ không chính xác!");
  }

  // 2. Kiểm tra thông tin bắt buộc
  if (!quizInfo.name || !quizInfo.phone) return alert("Vui lòng nhập đầy đủ thông tin!");
   localStorage.setItem('quiz_student_info', JSON.stringify({
    ...quizInfo,
    stk: bankInfo.stk,
    bankName: bankInfo.bankName
  }));
  
  if (showQuizModal) {    
    onSelectQuiz(showQuizModal.num, showQuizModal.pts, {
      ...quizInfo,
      phoneNumber: quizInfo.phone,
      // Nếu là free thì gửi stk/bank trống
      stk: quizMode === 'gift' ? bankInfo.stk : "Tự do",
      bank: quizMode === 'gift' ? bankInfo.bankName : "Tự do"
     });
  }
  
  // Reset trạng thái
  setShowQuizModal(null);
  setQuizMode(null);
  setInputPassword('');
};

  const handleRateSubmit = async () => {
    if (isSubmittingRate) return;
    setIsSubmittingRate(true);
    try {
      const payload = {
        type: 'rating',
        stars: rating,
        comment: comment,
        name: user?.name || quizInfo.name || "Khách",
        class: quizInfo.class || "Tự do",
        idNumber: user?.phoneNumber || "GUEST",
        taikhoanapp: user?.isVip ? "VIP" : "FREE"
      };
      await fetch(DANHGIA_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });
       if (rating >= 4) {
        alert(`❤️ Tuyệt vời! Cảm ơn bạn đã đánh giá ${rating} ⭐. Chúc bạn học tập thật tốt nhé! ❤️`);
      } else {
        // Dưới 4 sao (1, 2, 3 sao)
        alert(`😡 Này! Sao đánh giá có ${rating} ⭐ thôi? Học thì lười mà đánh giá thì khắt khe thế 😡! Thích ăn 👊 à. ❤️ Lần sau nhớ cho 5 sao nghe chưa!`);
      }
      setShowRateModal(false);
    } catch (e) {
      alert("Gửi đánh giá thất bại!");
    } finally {
      setIsSubmittingRate(false);
    }
  };
  // Thêm useEffect này vào trong Component LandingPage
useEffect(() => {
  if (showQuizModal) {
    const savedInfo = localStorage.getItem('quiz_student_info');
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      setQuizInfo(prev => ({
        ...prev,
        name: parsed.name || '',
        class: parsed.class || '',
        school: parsed.school || '',
        phone: parsed.phone || ''
      }));
      setBankInfo({
        stk: parsed.stk || '',
        bankName: parsed.bankName || ''
      });
    }
  }
}, [showQuizModal]);

  const totalRatings = (Object.values(stats.ratings) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans overflow-x-hidden">
      
      {/* 1. Header: Nút chọn lớp & Quiz - Căn chỉnh đồng đều h-[60px] kèm hướng dẫn vuốt mobile */}
      <div className="flex justify-center">
      <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100 mt-4 overflow-hidden">
        <div className="flex flex-nowrap overflow-x-auto gap-3 pb-2 pt-1 px-1 no-scrollbar items-center">
          <div className="flex flex-col items-center shrink-0">
            <div className="bg-red-600 text-white px-6 rounded-2xl shadow-lg flex items-center justify-center h-[60px] whitespace-nowrap border-b-4 border-red-800 animate-pulse">
              <span className="font-black text-sm uppercase flex items-center gap-2">
                <i className="fas fa-edit"></i> Kiểm tra Online →
              </span>
            </div>
            <div className="md:hidden text-[8px] font-black text-red-500 mt-1 uppercase flex items-center gap-1">
              <i className="fas fa-arrow-left"></i> Trên điện thoại vuốt sang trái
            </div>
          </div>
          
          {[
            {g: 9, icon: 'fas fa-user-graduate'},
            {g: 10, icon: 'fas fa-user-graduate'},
            {g: 11, icon: 'fas fa-user-graduate'},
            {g: 12, icon: 'fas fa-user-graduate'}
          ].map(item => (
            <button key={item.g} onClick={() => onSelectGrade(item.g)} className="px-6 bg-blue-600 text-white border-b-4 border-blue-800 rounded-2xl font-black text-sm shrink-0 hover:brightness-110 active:scale-95 transition-all h-[60px] flex items-center justify-center gap-2 min-w-[120px]">
              <i className={item.icon}></i> LỚP {item.g}
            </button>
          ))}
          <button onClick={() => setShowQuizModal({num: 10, pts: 1})} className="px-6 bg-orange-500 text-white border-b-4 border-orange-700 rounded-2xl font-black text-sm shrink-0 hover:brightness-110 h-[60px] uppercase whitespace-nowrap flex items-center justify-center gap-2 min-w-[130px]">
            <i className="fas fa-bolt"></i> QUIZ 10
          </button>
          <button onClick={() => setShowQuizModal({num: 20, pts: 0.5})} className="px-6 bg-orange-500 text-white border-b-4 border-orange-700 rounded-2xl font-black text-sm shrink-0 hover:brightness-110 h-[60px] uppercase whitespace-nowrap flex items-center justify-center gap-2 min-w-[130px]">
            <i className="fas fa-brain"></i> QUIZ 20
          </button>
        </div>
      </div>
     </div>
      {/* 2. Marquee thông báo - Fix Animation */}
      <div className="flex justify-center">
     <div className="bg-indigo-700 py-3 rounded-2xl overflow-hidden shadow-inner border-b-4 border-indigo-900 mx-1"> 
     <div className="whitespace-nowrap overflow-hidden"> <div className="animate-marquee whitespace-nowrap text-white font-black uppercase text-[11px] tracking-widest"> 
     ⭐ Chào mừng các bạn đến với Hệ thống học tập trực tuyến môn Toán ! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
     ⭐ Luyện tập chăm chỉ mỗi ngày để bứt phá điểm số! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      
     ⭐ Liên hệ: 0988.948.882 để tham gia nhóm viết Webapp phục vụ công việc nhé ⭐ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
     </div> 
     </div> 
     </div>
    </div>


      {/* 3. Khối nội dung chính - Bố cục cân đối (LG 3 - 7 - 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* CỘT TRÁI: TOP QUIZ */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden border-b-4 border-blue-200 h-full flex flex-col">
            <div className="bg-blue-600 p-4 text-white font-black text-xs uppercase text-center flex items-center justify-center gap-2">
               <i className="fas fa-crown text-yellow-300"></i> TOP 10 QUIZ TUẦN
            </div>
            <div className="p-2 space-y-1 flex-grow bg-slate-50 overflow-y-auto max-h-[420px] custom-scrollbar">
              {stats.top10.length > 0 ? stats.top10.map((item) => (
                <div key={item.rank} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01]">
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-1">
                    <span className="font-bold text-slate-800 text-[10px] truncate">{item.rank}. {item.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{formatPhoneHidden(item.phone)}</span>
                  </div>
                  <div className="text-right flex flex-col shrink-0">
                    <span className="font-black text-blue-600 text-[10px] leading-none">{item.score.toFixed(1)} đ</span>
                    <span className="text-[8px] text-slate-400 mt-0.5"><i className="far fa-clock mr-0.5"></i>{item.time}</span>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center text-slate-400 text-xs uppercase font-black">Đang cập nhật...</div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT GIỮA: ẢNH CAROUSEL (Rộng hơn) */}
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

        {/* CỘT PHẢI: NÚT CHỨC NĂNG */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {[
             { label: "Trợ lý học tập", icon: "fas fa-headset", link: "https://new-chat-bot-two.vercel.app/" },
            { label: "Vào Học Nhóm", icon: "fas fa-users", link: "https://www.facebook.com/hoctoanthayha.bg" },
            { label: user ? `SĐT: ${user.phoneNumber}` : "Đăng Nhập", icon: "fas fa-sign-in-alt", action: onOpenAuth },
            { label: "Nâng Cấp VIP", icon: "fas fa-gem", action: onOpenVip },
            { label: "Ứng dụng khác", icon: "fas fa-th", link: "https://zalo.me/0988948882" },
            { label: "Kho Tài Liệu", icon: "fas fa-book-open", link: "https://www.facebook.com/hoctoanthayha.bg" }
            
          ].map((btn, i) => (
            <button 
              key={i} 
              onClick={btn.action || (() => window.open(btn.link, '_blank'))}
              className="w-full flex-1 flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md border-b-4 border-indigo-900 hover:brightness-110 transition-all p-2 text-center"
            >
              <i className={`${btn.icon} text-lg mb-1`}></i>
              <span className="leading-tight">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tin tức */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 border-b-8 border-slate-200">
        <h4 className="font-black text-blue-700 uppercase text-xs tracking-widest border-l-4 border-blue-600 pl-4 mb-6">Thông báo hệ thống</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NEWS_DATA.slice(0, 6).map((news, i) => (
            <a key={i} href={news.link} target="_blank" rel="noreferrer" className="block p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-100 transition-all hover:shadow-md">
              <p className="text-[11px] font-bold text-slate-700 leading-snug line-clamp-2"> {news.title}</p>
            </a>
          ))}
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="mt-8 border-t border-slate-200 pt-10 pb-6 text-center space-y-8 bg-slate-50/50 rounded-t-[3rem]">
        <div className="max-w-xs mx-auto">
          <button onClick={() => setShowRateModal(true)} className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-black text-sm shadow-xl hover:scale-105 transition-all active:scale-95 border-b-4 border-orange-600 uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="text-xl">⭐</span> ĐÁNH GIÁ WEB
          </button>
        </div>
        <div className="flex justify-center gap-8">
          {[
            { id: 'fb', icon: 'fa-facebook-f', color: '#1877F2', link: 'https://www.facebook.com/hoctoanthayha.bg' },
            { id: 'tw', icon: 'fa-twitter', color: '#1DA1F2', link: 'https://x.com/Math_teacher_Ha' },
            { id: 'tg', icon: 'fa-telegram-plane', color: '#229ED9', link: 'https://www.telegram.org' }
          ].map((social) => (
            <a key={social.id} href={social.link} target="_blank" rel="noreferrer" style={{ backgroundColor: social.color }}
              className="w-12 h-12 rounded-2xl text-white flex items-center justify-center text-xl shadow-lg hover:rotate-12 hover:scale-110 transition-all border-b-4 border-black/20"
            >
              <i className={`fab ${social.icon}`}></i>
            </a>
          ))}
        </div>
        <div className="text-slate-400 space-y-1">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">© 2025 KÊNH HỌC TOÁN TRỰC TUYẾN CHUYÊN NGHIỆP</p>
            <p className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">Admin: Nguyễn Văn Hà - THPT Yên Dũng số 2</p>
        </div>
      </footer>

      {/* Modals Nhập thông tin trả lời QuiZ*/}
     {showQuizModal && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 overflow-y-auto max-h-[90vh]">
      <h2 className="text-2xl font-black text-orange-500 mb-4 uppercase text-center">
        {quizMode === 'gift' ? '🎁 Chế độ Quà QuiZ' : '🎮 QuiZ Tự Do'}
      </h2>

      {/* Bước 1: Chọn chế độ nếu chưa chọn */}
      {!quizMode ? (
        <div className="flex flex-col gap-4">
          <button onClick={() => setQuizMode('free')} className="py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase">Chơi Tự Do (Không thưởng)</button>
          <button onClick={() => setQuizMode('gift')} className="py-4 bg-orange-500 text-white rounded-2xl font-bold uppercase">Săn Quà (Cần mật khẩu)</button>
        </div>
      ) : (
        <form onSubmit={handleStartQuiz} className="space-y-4">
          {/* Nhập mật khẩu nếu chọn Quà */}
          {quizMode === 'gift' && (
            <input 
              required 
              type="password" 
              placeholder="Nhập mật khẩu Admin cấp" 
              className="w-full p-3 bg-red-50 border-2 border-red-200 rounded-xl font-bold"
              value={inputPassword}
              onChange={e => setInputPassword(e.target.value)}
            />
          )}

          <input required placeholder="Họ và tên" className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={quizInfo.name} onChange={e=>setQuizInfo({...quizInfo, name: e.target.value})} />
          <input required type="tel" placeholder="Số điện thoại" className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={quizInfo.phone} onChange={e=>setQuizInfo({...quizInfo, phone: e.target.value})} />

          {/* Chọn Trường học */}
          <select 
            className="w-full p-3 bg-slate-100 rounded-xl font-bold"
            onChange={(e) => {
              const val = e.target.value;
              setIsOtherSchool(val === "Khác");
              setQuizInfo({...quizInfo, school: val});
            }}
          >
            <option value="">-- Chọn trường học --</option>
            {ADMIN_CONFIG.schools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {isOtherSchool && (
            <input placeholder="Nhập tên trường khác" className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl font-bold" onChange={e => setQuizInfo({...quizInfo, school: e.target.value})} />
          )}

          {/* Phần Ngân hàng chỉ hiện khi chọn Quà QuiZ */}
          {quizMode === 'gift' && (
            <div className="p-4 bg-orange-50 rounded-2xl space-y-3">
              <p className="text-[10px] font-black text-orange-400 uppercase text-center">Thông tin nhận thưởng</p>
              <input required placeholder="Số tài khoản" className="w-full p-3 bg-white rounded-xl font-bold" value={bankInfo.stk} onChange={e=>setBankInfo({...bankInfo, stk: e.target.value})} />
              
              <select 
                className="w-full p-3 bg-white rounded-xl font-bold"
                onChange={(e) => {
                  const val = e.target.value;
                  setIsOtherBank(val === "Khác");
                  setBankInfo({...bankInfo, bankName: val});
                }}
              >
                <option value="">-- Chọn Ngân hàng --</option>
                {ADMIN_CONFIG.banks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {isOtherBank && (
                <input placeholder="Nhập ngân hàng khác" className="w-full p-3 bg-white border border-orange-200 rounded-xl font-bold" onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})} />
              )}
            </div>
          )}

          <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl">BẮT ĐẦU</button>
          <button type="button" onClick={() => {setQuizMode(null); setShowQuizModal(null);}} className="w-full text-slate-400 text-sm">Quay lại</button>
        </form>
      )}
    </div>
  </div>
)}
      {showRateModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-lg">
          <div className="bg-white w-full max-sm rounded-[3rem] p-8 shadow-2xl border border-slate-100 text-center space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Đánh giá Web</h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Tổng: {totalRatings} lượt đánh giá</p>
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.ratings[star] || 0;
                const percent = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold w-4 text-slate-600">{star}★</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className="text-4xl transition-transform hover:scale-125 focus:outline-none">
                  {star <= rating ? <span className="text-yellow-400">★</span> : <span className="text-slate-200">★</span>}
                </button>
              ))}
            </div>
            <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-sm outline-none h-24" placeholder="Nhập nhận xét..." value={comment} onChange={e => setComment(e.target.value)}></textarea>
            <div className="flex gap-3">
              <button onClick={() => setShowRateModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-xs">Đóng</button>
              <button onClick={handleRateSubmit} disabled={isSubmittingRate} className="flex-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs shadow-lg">{isSubmittingRate ? "Đang gửi..." : "Gửi đánh giá"}</button>
            </div>
          </div>
        </div>
      )}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
};

export default LandingPage;
