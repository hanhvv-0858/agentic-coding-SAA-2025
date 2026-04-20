import type { SpotlightRecipient } from "@/types/kudo";

/**
 * Dev-mode fallback for §B.7 Spotlight board. Renders a deterministic
 * cloud of ~30 Sunner names scattered across the 0..1 normalised canvas
 * so the page looks populated when the real `GET /kudos/spotlight`
 * endpoint has no data yet. Names + distribution are hand-seeded; we do
 * NOT call this when real data is available.
 */
const NAMES = [
  "Huỳnh Dương Xuân Nhật",
  "Nguyễn Bá Chức",
  "Đỗ Hoàng Hiệp",
  "Trần Minh Anh",
  "Nguyễn Văn Quý",
  "Nguyễn Hoàng Linh",
  "Lê Thành Đạt",
  "Phạm Quỳnh Nhi",
  "Hoàng Anh Tuấn",
  "Lê Thanh Hải",
  "Ngô Thị Mai",
  "Đặng Bảo Trân",
  "Vũ Thu Hà",
  "Trịnh Gia Khánh",
  "Dương Quốc Huy",
  "Phan Thảo Vy",
  "Bùi Công Thành",
  "Tô Minh Châu",
  "Lý Ngọc Anh",
  "Võ Hải Đăng",
  "Cao Kim Chi",
  "Hà Tuấn Kiệt",
  "Đinh Mỹ Linh",
  "Chu Xuân Phong",
  "Tạ Bích Ngọc",
  "La Quang Vinh",
  "Mai Khánh Ly",
  "Đoàn Trung Hiếu",
  "Hồ Ánh Dương",
  "Lâm Phương Anh",
];

function seededRand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function buildSpotlightMock(): {
  total: number;
  recipients: SpotlightRecipient[];
} {
  const recipients: SpotlightRecipient[] = NAMES.map((name, i) => ({
    name,
    // Deterministic scatter across the normalised 0..1 canvas — tight
    // margins on each edge so names don't clip against the radius.
    x: 0.08 + seededRand(i * 12.9898) * 0.84,
    y: 0.12 + seededRand(i * 78.233) * 0.76,
    // Weight skewed toward the named SUNNERs for visual interest.
    weight: 1 + Math.floor(seededRand(i * 3.1415) * 24),
    recentKudo: {
      time: "08:30PM",
      preview: "Vừa nhận được một Kudos mới.",
    },
  }));
  return { total: 388, recipients };
}
