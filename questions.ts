
import { Question } from './types';

// Giả định questionsBank được nạp từ nguồn dữ liệu khác hoặc đã được định nghĩa
export const questionsBank: Question[] = [];

const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const pickQuestionsSmart = (
  topicIds: number[], 
  counts: { mc: number[], tf: number[], sa: number[] },
  levels: { mc3: number[], mc4: number[], tf3: number[], tf4: number[], sa3: number[], sa4: number[] }
) => {
  let selectedPart1: Question[] = [];
  let selectedPart2: Question[] = [];
  let selectedPart3: Question[] = [];
  
  topicIds.forEach((tid, idx) => {
    // Lọc câu hỏi theo chuyên đề
    const pool = questionsBank.filter(q => q.classTag.toString().startsWith(tid.toString() + "."));
    
    const getSub = (type: string, l3: number, l4: number, total: number) => {
      const typePool = pool.filter(q => q.type === type);
      const p4 = typePool.filter(q => q.classTag.toString().endsWith(".4"));
      const p3 = typePool.filter(q => q.classTag.toString().endsWith(".3"));
      const pOther = typePool.filter(q => !q.classTag.toString().endsWith(".3") && !q.classTag.toString().endsWith(".4"));

      let res4 = shuffleArray(p4).slice(0, l4);
      let deficit4 = l4 - res4.length; 
      let res3 = shuffleArray(p3).slice(0, l3 + deficit4);
      
      let res = [...res4, ...res3];
      const remainingNeeded = total - res.length;
      if (remainingNeeded > 0) {
        res = [...res, ...shuffleArray(pOther).slice(0, remainingNeeded)];
      }
      return res;
    };

    selectedPart1 = [...selectedPart1, ...getSub('mcq', levels.mc3[idx] || 0, levels.mc4[idx] || 0, counts.mc[idx] || 0)];
    selectedPart2 = [...selectedPart2, ...getSub('true-false', levels.tf3[idx] || 0, levels.tf4[idx] || 0, counts.tf[idx] || 0)];
    selectedPart3 = [...selectedPart3, ...getSub('short-answer', levels.sa3[idx] || 0, levels.sa4[idx] || 0, counts.sa[idx] || 0)];
  });

  // Xử lý hậu kỳ: Trộn đáp án MCQ và trộn các ý của câu hỏi Đúng/Sai
  return [...selectedPart1, ...selectedPart2, ...selectedPart3].map(q => {
    const newQ = { ...q };
    if (newQ.o) {
      newQ.shuffledOptions = shuffleArray(newQ.o);
    }
    if (newQ.s && newQ.type === 'true-false') {
      newQ.s = shuffleArray(newQ.s);
    }
    return newQ;
  });
};
