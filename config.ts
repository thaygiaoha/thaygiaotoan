import React, { useState, useEffect } from "react";
import { IMAGES_CAROUSEL, DANHGIA_URL } from "../config";
import { AppUser, Student } from "../types";

/* ================== TYPES ================== */
type Top10Item = {
  name: string;
  idPhone: string;
  score: number;
  time: number;
};

interface LandingPageProps {
  onSelectGrade: (grade: number) => void;
  onSelectQuiz: (num: number, pts: number, quizStudent: Partial<Student>) => void;
  user: AppUser | null;
  onOpenAuth: () => void;
  onOpenVip: () => void;
}

/* ================== CONFIG ================== */
const ADMIN_CONFIG = {
  quizPassword: "66668888",
  schools: [
    "THPT Yên Dũng số 2",
    "THPT Yên Dũng số 1",
    "THPT Lạng Giang số 1",
    "Khác",
  ],
  banks: ["Vietcombank", "Agribank", "MB Bank", "Khác"],
};

const OTHER_APPS = [
  { label: "Nhóm Zalo hỗ trợ", icon: "fab fa-comment", link: "https://zalo.me/0988948882" },
  { label: "Kênh Youtube Toán", icon: "fab fa-youtube", link: "https://youtube.com/..." },
  { label: "Máy tính Online", icon: "fas fa-calculator", link: "https://www.desmos.com/scientific" },
];

/* ================== COMPONENT ================== */
const LandingPage: React.FC<LandingPageProps> = ({
  onSelectGrade,
  onSelectQuiz,
  user,
  onOpenAuth,
  onOpenVip,
}) => {
  /* ---------- STATE ---------- */
  const [currentImg, setCurrentImg] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState<{ num: number; pts: number } | null>(null);
  const [quizMode, setQuizMode] = useState<"free" | "gift" | null>(null);
  const [inputPassword, setInputPassword] = useState("");

  const [quizInfo, setQuizInfo] = useState({
    name: "",
    phone: "",
    school: "",
  });

  const [bankInfo, setBankInfo] = useState({
    stk: "",
    bankName: "",
  });

  const [stats, setStats] = useState<{
    ratings: Record<number, number>;
    top10: Top10Item[];
  }>({
    ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    top10: [],
  });

  /* ---------- FETCH TOP10 ---------- */
  useEffect(() => {
    const fetchTop10 = async () => {
      try {
        const res = await fetch(`${DANHGIA_URL}?type=top10`);
        const json = await res.json();

        setStats((prev) => ({
          ...prev,
          top10: Array.isArray(json.data)
            ? json.data.map((x: any) => ({
                name: x.name,
                idPhone: x.idPhone,
                score: Number(x.score) || 0,
                time: Number(x.time) || 0,
              }))
            : [],
        }));
      } catch (err) {
        console.error("Load TOP10 lỗi:", err);
      }
    };

    fetchTop10();
  }, []);

  /* ---------- QUIZ ---------- */
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    if (quizMode === "gift" && inputPassword !== ADMIN_CONFIG.quizPassword) {
      alert("Mật khẩu không đúng");
      return;
    }

    if (!quizInfo.name || !quizInfo.phone) {
      alert("Nhập thiếu thông tin");
      return;
    }

    onSelectQuiz(showQuizModal!.num, showQuizModal!.pts, {
      name: quizInfo.name,
      phoneNumber: quizInfo.phone,
      school: quizInfo.school,
      stk: quizMode === "gift" ? bankInfo.stk : "Tự do",
      bank: quizMode === "gift" ? bankInfo.bankName : "Tự do",
    });

    setShowQuizModal(null);
    setQuizMode(null);
  };

  /* ================== RENDER ================== */
  return (
    <div className="max-w-7xl mx-auto px-2 pb-10">

      {/* ===== TOP10 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 text-white text-xs font-black p-3 text-center">
            <i className="fas fa-crown text-yellow-300 mr-1"></i>
            TOP 10 QUIZ TUẦN
          </div>

          <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
            {stats.top10.length === 0 && (
              <div className="text-center text-[10px] text-slate-400 font-bold">
                Đang tải...
              </div>
            )}

            {stats.top10.map((item, index) => {
              const cup =
                index === 0 ? "🥇" :
                index === 1 ? "🥈" :
                index === 2 ? "🥉" : "🏅";

              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm">
                  <div className="w-8 text-xl text-center">{cup}</div>

                  <div className="flex-1 overflow-hidden">
                    <div className="text-[11px] font-black uppercase truncate">
                      {item.name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold">
                      {item.idPhone}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-black text-red-600">
                      {item.score} <span className="text-[8px]">đ</span>
                    </div>
                    <div className="text-[9px] text-slate-400 italic">
                      {item.time}s
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== CAROUSEL ===== */}
        <div className="lg:col-span-7">
          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
            {IMAGES_CAROUSEL.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  idx === currentImg ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <button
            onClick={onOpenAuth}
            className="bg-indigo-600 text-white rounded-2xl font-black text-xs p-3"
          >
            <i className="fas fa-sign-in-alt text-lg"></i><br />
            {user ? user.phoneNumber : "Đăng nhập"}
          </button>

          <button
            onClick={onOpenVip}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-xs p-3"
          >
            <i className="fas fa-gem text-lg"></i><br />
            Nâng cấp VIP
          </button>
        </div>
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
    </div>
  );
};

export default LandingPage;
