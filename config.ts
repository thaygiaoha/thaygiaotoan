
import { Topic, ExamCodeDefinition, NewsItem, FixedConfig } from './types';

export const GRADES = [9, 10, 11, 12];
export const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbwZYM9wi2DoKfj5V_V-3c8fXtJbrJX0p3LxDY0zL8Op19ZXJQY5XXOak7WhRPvfGPH4/exec";
export const DANHGIA_URL = "https://script.google.com/macros/s/AKfycbwZYM9wi2DoKfj5V_V-3c8fXtJbrJX0p3LxDY0zL8Op19ZXJQY5XXOak7WhRPvfGPH4/exec";
export const VIP_SHEET_URL = "https://script.google.com/macros/s/AKfycbzxQQd3QmPUtguwdfLjz4TuHiroQNrWYaDsL4syLrtjZMWguKtQQhoFsGI5xcT7q113/exec";

export const API_ROUTING: Record<string, string> = {
  "680988948882": DEFAULT_API_URL
};

export const NEWS_DATA: NewsItem[] = [
  { title: "Thông tin tuyển sinh lớp 10 năm 2025", link: "https://moet.gov.vn" },
  { title: "Cấu trúc đề thi tốt nghiệp THPT mới nhất", link: "https://vneconomy.vn" },
  { title: "Lịch thi học sinh giỏi cấp tỉnh Bắc Ninh", link: "https://bacninh.edu.vn" }
];

export const IMAGES_CAROUSEL = [
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200"
];

export const TOPICS_DATA: Record<number, Topic[]> = {
  7: [{ id: 701, name: "Toán lớp 7" }],
  8: [{ id: 801, name: "Toán lớp 8" }],
  9:  [
    { id: 901, name: "01. Phương trình và hệ phương trình bậc nhất" },
    { id: 902, name: "02. Phương trình bậc hai một ẩn số" },
    { id: 903, name: "03. Hệ thức lượng trong tam giác vuông" },
    { id: 904, name: "04. Đường tròn" },
    { id: 905, name: "05. Hàm số y = ax²" },
    { id: 906, name: "06. Các hình khối trong thực tiễn" },
    { id: 907, name: "07. Căn thức bậc hai và căn thức bậc ba" },
    { id: 908, name: "08. Một số yếu tố xác suất và thống kê" }
  ],
  10: [
    { id: 1001, name: "01. Mệnh đề và Tập hợp" },
    { id: 1002, name: "02. BPT và Hệ BPT bậc nhất hai ẩn" },
    { id: 1003, name: "03. Hàm số bậc hai và Đồ thị" },
    { id: 1004, name: "04. Hệ thức lượng trong tam giác" },
    { id: 1005, name: "05. Vectơ" },
    { id: 1006, name: "06. Thống kê" },
    { id: 1007, name: "07. Phương pháp tọa độ trong mặt phẳng" },
    { id: 1008, name: "08. Đại số tổ hợp" },
    { id: 1009, name: "09. Xác suất cổ điển của biến cố" }
  ],
  11: [
    { id: 1101, name: "01. Hàm số lượng giác và Phương trình lượng giác" },
    { id: 1102, name: "02. Dãy số, Cấp số cộng và Cấp số nhân" },
    { id: 1103, name: "03. Các số đặc trưng đo thế giới trung tâm" },
    { id: 1104, name: "04. Quan hệ song song trong không gian" },
    { id: 1105, name: "05. Giới hạn dãy số" },
    { id: 1106, name: "06. Giới hạn hàm số. Hàm số liên tục" },
    { id: 1107, name: "07. Hàm số mũ và Hàm số lôgarit" },
    { id: 1108, name: "08. Quan hệ vuông góc trong không gian" },
    { id: 1109, name: "09. Quy tắc tính đạo hàm" },
    { id: 1110, name: "10. Quy tắc tính xác suất" }
  ],
  12: [
    { id: 1201, name: "01. Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số" },
    { id: 1202, name: "02. Vectơ và Hệ tọa độ trong không gian (Oxyz)" },
    { id: 1203, name: "03. Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm" },
    { id: 1204, name: "04. Nguyên hàm và Tích phân" },
    { id: 1205, name: "05. Phương pháp tọa độ trong không gian (Đường thẳng, Mặt phẳng, Mặt cầu)" },
    { id: 1206, name: "06. Xác suất có điều kiện và Công thức Bayes" }
  ]
};

// Loại 45 phút : MCQ = 12 (0.5đ); TF = 2 (1đ, 1 câu mức 3); SA = 4 (0.5đ, 1 câu mức 3, 1 câu mức 4)
const CONFIG_45P: FixedConfig = {
  duration: 45,
  numMC: [12], scoreMC: 0.5, mcL3: [0], mcL4: [0],
  numTF: [2], scoreTF: 1, tfL3: [1], tfL4: [0],
  numSA: [4], scoreSA: 0.5, saL3: [1], saL4: [1]
};

// Loại 90 phút : MCQ = 12 (0.25đ); TF = 4 (1đ, 2 câu mức 3); SA = 6 (0.5đ, 1 câu mức 3, 1 câu mức 4)
const CONFIG_90P: FixedConfig = {
  duration: 90,
  numMC: [12], scoreMC: 0.25, mcL3: [0], mcL4: [0],
  numTF: [4], scoreTF: 1, tfL3: [2], tfL4: [0],
  numSA: [6], scoreSA: 0.5, saL3: [1], saL4: [1]
};

export const EXAM_CODES: Record<number, ExamCodeDefinition[]> = {
  9: [
    { code: "TD_45_K9", name: "Tự do 45 phút (7+8+9)", topics: 'manual', fixedConfig: CONFIG_45P },
    { code: "TD_90_K9", name: "Tự do 90 phút (7+8+9)", topics: 'manual', fixedConfig: CONFIG_90P }
  ],
  10: [
    { code: "TD_45_K10", name: "Tự do 45 phút (Khối 10)", topics: 'manual', fixedConfig: CONFIG_45P },
    { code: "TD_90_K10", name: "Tự do 90 phút (Khối 10)", topics: 'manual', fixedConfig: CONFIG_90P }
  ],
  11: [
    { code: "TD_45_K11", name: "Tự do 45 phút (10+11)", topics: 'manual', fixedConfig: CONFIG_45P },
    { code: "TD_90_K11", name: "Tự do 90 phút (10+11)", topics: 'manual', fixedConfig: CONFIG_90P }
  ],
  12: [
    { code: "TD_45_K12", name: "Tự do 45 phút (10+11+12)", topics: 'manual', fixedConfig: CONFIG_45P },
    { code: "TD_90_K12", name: "Tự do 90 phút (10+11+12)", topics: 'manual', fixedConfig: CONFIG_90P }
  ]
};
