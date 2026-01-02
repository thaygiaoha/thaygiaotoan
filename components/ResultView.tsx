
import React, { useState } from 'react';
import { ExamResult, Question } from '../types';
import MathText from './MathText';

interface ResultViewProps {
  result: ExamResult;
  questions: Question[];
  onBack: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, questions, onBack }) => {
  const [showReview, setShowReview] = useState(false);

  const btnStyle = "w-full sm:w-64 py-4 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-700 transition shadow-xl flex items-center justify-center gap-3 active:scale-95 border-b-4 border-blue-800";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 font-sans">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tight">KẾT QUẢ BÀI THI</h2>
        <p className="text-slate-500 mb-10 font-bold uppercase text-xs tracking-widest">Hệ thống thi trực tuyến THPT Yên Dũng số 2</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-10 text-left">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Họ tên thí sinh</p>
            <p className="font-black text-slate-800 text-xl leading-tight">{result.name}</p>
            <p className="text-sm text-slate-500 mt-1 font-bold">SBD: {result.sbd} • Lớp: {result.className}</p>
          </div>
          <div className="bg-blue-600 p-8 rounded-3xl shadow-2xl flex flex-col justify-center transform hover:scale-105 transition">
            <p className="text-[10px] font-black text-white/70 uppercase mb-2 tracking-[0.2em]">Tổng điểm</p>
            <p className="text-6xl font-black text-white">{result.score.toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Thời gian hoàn thành</p>
            <p className="font-black text-slate-800 text-xl leading-tight">{result.totalTime}</p>
            <p className="text-sm text-slate-500 mt-1 font-bold">{new Date(result.timestamp).toLocaleDateString('vi-VN')} {new Date(result.timestamp).toLocaleTimeString('vi-VN')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6 border-t border-slate-100">
          <button onClick={() => setShowReview(!showReview)} className={btnStyle}>
            {showReview ? 'ĐÓNG XEM CHI TIẾT' : 'XEM LẠI BÀI LÀM'}
          </button>
          <button onClick={onBack} className={btnStyle}>
            VỀ TRANG CHỦ
          </button>
        </div>
      </div>

      {showReview && (
        <div className="space-y-8 animate-fade-in">
          <h3 className="text-2xl font-black text-slate-800 uppercase px-6 border-l-8 border-blue-600 mb-6">ĐÁP ÁN VÀ GIẢI THÍCH</h3>
          {questions.map((q, idx) => {
            const u = result.details[idx].answer;
            const isCorrect = q.type === 'true-false' 
              ? (u as any).every((v:any, i:any) => v === q.s![i].a) 
              : u?.toString().trim().toLowerCase() === q.a?.toString().trim().toLowerCase();

            return (
              <div key={q.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                <div className={`absolute left-0 top-0 w-3 h-full ${isCorrect ? 'bg-emerald-500':'bg-red-500'}`}></div>
                
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <span className={`w-14 h-14 flex items-center justify-center rounded-[1.2rem] font-black text-2xl shadow-inner ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{idx + 1}</span>
                    <div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded block w-fit mb-1">ID: {q.id}</span>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{q.part}</span>
                    </div>
                  </div>
                  <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${isCorrect ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                  </span>
                </div>

                <div className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed">
                   <MathText content={q.question} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Phương án đã chọn</p>
                    <div className="font-bold text-slate-700 text-lg">
                       {q.type === 'true-false' ? (u as any).map((v:any, i:any) => <span key={i} className="mr-3">{String.fromCharCode(97+i)}: {v===true?'Đúng':(v===false?'Sai':'Chưa chọn')}</span>) : (u || <span className="opacity-50">Không trả lời</span>)}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-inner">
                    <p className="text-[10px] font-black text-emerald-500 uppercase mb-3 tracking-widest">Đáp án đúng</p>
                    <div className="font-bold text-emerald-700 text-lg">
                      {q.type === 'true-false' ? q.s!.map((s, i) => <span key={i} className="mr-3">{String.fromCharCode(97+i)}: {s.a?'Đúng':'Sai'}</span>) : q.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultView;
