
import React, { useState, useMemo } from 'react';
import { Question, Student } from '../types';
import { API_ROUTING, DEFAULT_API_URL, TOPICS_DATA, EXAM_CODES } from '../config';
import { pickQuestionsSmart } from '../questions';

interface ExamPortalProps {
  grade: number;
  onBack: () => void;
  onStart: (config: any, student: Student, questions: Question[]) => void;
}

const ExamPortal: React.FC<ExamPortalProps> = ({ grade, onBack, onStart }) => {
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [idInput, setIdInput] = useState("");
  const [sbdInput, setSbdInput] = useState("");
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

  const availableCodes = useMemo(() => EXAM_CODES[grade] || [], [grade]);
  const currentCodeDef = useMemo(() => availableCodes.find(c => c.code === selectedCode), [selectedCode, availableCodes]);

  const handleVerify = async () => {
    if (!idInput || !sbdInput) return alert("Vui lòng nhập ID Giáo viên và Số báo danh!");
    setIsVerifying(true);
    setVerifiedStudent(null);
    const targetUrl = API_ROUTING[idInput] || DEFAULT_API_URL;
    try {
      const url = new URL(targetUrl);
      url.searchParams.append("idnumber", idInput.trim());
      url.searchParams.append("sbd", sbdInput.trim());
      const resp = await fetch(url.toString());
      const result = await resp.json();
      if (result.status === "success") {
        setVerifiedStudent(result.data);
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setIsVerifying(false);
    }
  };

  const getTopicRange = () => {
    if (grade === 10) return [10];
    if (grade === 11) return [10, 11];
    if (grade === 12) return [10, 11, 12];
    if (grade === 9) return [7, 8, 9];
    return [grade];
  };

  const handleStart = () => {
    if (!verifiedStudent || !selectedCode) return alert("Vui lòng xác minh và chọn mã đề!");
    
    let questions: Question[] = [];
    const fc = currentCodeDef?.fixedConfig;
    if (!fc) return alert("Lỗi cấu hình mã đề!");

    const finalConfig = { 
      id: selectedCode, 
      title: currentCodeDef.name, 
      time: fc.duration, 
      mcqPoints: fc.scoreMC, 
      tfPoints: fc.scoreTF, 
      saPoints: fc.scoreSA, 
      gradingScheme: 1 
    };

    const topicsToPick = currentCodeDef.topics === 'manual' ? selectedTopics : (currentCodeDef.topics as number[]);
    if (topicsToPick.length === 0) return alert("Vui lòng chọn ít nhất 1 chuyên đề!");

    const splitCount = (total: number, topics: number[]) => topics.map((_, i) => Math.floor(total / topics.length) + (i < total % topics.length ? 1 : 0));

    questions = pickQuestionsSmart(
      topicsToPick,
      { mc: splitCount(fc.numMC[0], topicsToPick), tf: splitCount(fc.numTF[0], topicsToPick), sa: splitCount(fc.numSA[0], topicsToPick) },
      { 
        mc3: splitCount(fc.mcL3[0], topicsToPick), mc4: splitCount(fc.mcL4[0], topicsToPick),
        tf3: splitCount(fc.tfL3[0], topicsToPick), tf4: splitCount(fc.tfL4[0], topicsToPick),
        sa3: splitCount(fc.saL3[0], topicsToPick), sa4: splitCount(fc.saL4[0], topicsToPick) 
      }
    );

    if (questions.length === 0) return alert("Ngân hàng không đủ câu hỏi cho phạm vi này!");
    onStart(finalConfig, verifiedStudent, questions);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in border border-slate-100 font-sans">
      <div className="bg-blue-600 p-8 text-white flex justify-between items-center shadow-lg">
        <h2 className="text-3xl font-black mb-1 tracking-tight uppercase">Xác Minh & Chọn Đề</h2>
        <button onClick={onBack} className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-full transition font-black border border-white/40">Thoát</button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thí sinh</h3>
          <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-100 shadow-inner">
            <input type="text" placeholder="ID Giáo viên" className="w-full p-4 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500 font-black outline-none" value={idInput} onChange={e => setIdInput(e.target.value)} />
            <input type="text" placeholder="Số báo danh" className="w-full p-4 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500 font-black outline-none" value={sbdInput} onChange={e => setSbdInput(e.target.value)} />
            <button onClick={handleVerify} disabled={isVerifying} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 uppercase tracking-widest">
              {isVerifying ? 'Đang xác minh...' : 'Kiểm tra ID'}
            </button>
            
            {verifiedStudent && (
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in text-xs font-black text-slate-700 space-y-2">
                <p><span className="text-slate-400 uppercase text-[9px]">👤Họ tên:</span> {verifiedStudent.name}</p>
                <p><span className="text-slate-400 uppercase text-[9px]">🏫Lớp:</span> {verifiedStudent.class}</p>
                <p><span className="text-slate-400 uppercase text-[9px]">🆔SBD:</span> {verifiedStudent.sbd}</p>
                <p><span className="text-slate-400 uppercase text-[9px]">🔄Lượt thi tối đa:</span> {verifiedStudent.limit}</p>
                <p><span className="text-slate-400 uppercase text-[9px]">🚫Lượt tab tối đa:</span> {verifiedStudent.limittab}</p>
                <p><span className="text-slate-400 uppercase text-[9px]">💎Tài khoản:</span> {verifiedStudent.taikhoanapp}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cấu hình đề</h3>
          <div className="space-y-4">
            <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-blue-700 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none" value={selectedCode} onChange={e => setSelectedCode(e.target.value)}>
              <option value="">-- CHỌN MÃ ĐỀ --</option>
              {availableCodes.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            {currentCodeDef?.fixedConfig && (
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] shadow-inner space-y-2">
                 <p className="text-[10px] font-black text-blue-400 uppercase">Thông số</p>
                 <p className="text-sm font-black text-blue-700 uppercase">MCQ: {currentCodeDef.fixedConfig.numMC[0]} | TF: {currentCodeDef.fixedConfig.numTF[0]} | SA: {currentCodeDef.fixedConfig.numSA[0]}</p>
                 <p className="text-[10px] font-black text-blue-400 uppercase mt-2">Thời gian</p>
                 <p className="text-sm font-black text-blue-700 uppercase">{currentCodeDef.fixedConfig.duration} PHÚT</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Chuyên đề</h3>
          <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 h-[350px] overflow-y-auto shadow-inner no-scrollbar">
            {currentCodeDef?.topics === 'manual' ? (
              getTopicRange().map(g => (
                <div key={g} className="mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 border-b border-slate-200 pb-1">Khối lớp {g}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {TOPICS_DATA[g]?.map(t => (
                      <label key={t.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-transparent hover:border-blue-200 cursor-pointer transition shadow-sm group min-h-[50px]">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5" checked={selectedTopics.includes(t.id)} onChange={() => setSelectedTopics(prev => prev.includes(t.id) ? prev.filter(i => i !== t.id) : [...prev, t.id])} />
                        <span className="text-[11px] font-black text-slate-600 leading-tight group-hover:text-blue-700">{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-10 text-slate-400 font-black text-sm uppercase">Cố định theo đề</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 border-t bg-slate-50/50 flex justify-end">
        <button onClick={handleStart} disabled={!verifiedStudent || !selectedCode} className="w-full sm:w-auto px-20 py-5 bg-blue-600 text-white rounded-2xl font-black text-2xl hover:bg-blue-700 transition shadow-2xl disabled:opacity-50 active:scale-95 uppercase tracking-tighter border-b-4 border-blue-900">
          VÀO LÀM BÀI NGAY
        </button>
      </div>
    </div>
  );
};

export default ExamPortal;
