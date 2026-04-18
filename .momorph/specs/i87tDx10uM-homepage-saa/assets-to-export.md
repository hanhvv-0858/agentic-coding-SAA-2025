# Assets cần export từ design team — Homepage SAA

**Frame**: [i87tDx10uM](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM) · node `2167:9026`

Mỗi asset phải export **PNG @2× (retina)** hoặc **SVG** khi có thể. Target folder: `public/images/` hoặc `public/images/awards/`.

---

## 1. HIGH PRIORITY — đang block pixel-perfect

### 1.1 "ROOT FURTHER" display wordmark
**Figma node**: `2167:9032` Frame 482 (hero title) + tái dùng trong Root Further card
**Hiện tại**: `public/images/root-further-big.png` chỉ **189×67** → quá nhỏ, bị pixelate khi scale. Hiện code đã fallback sang render text Montserrat 120px.
**Cần export**:
- Format: **SVG** (ưu tiên) hoặc PNG @2×
- Dimensions: dùng cho hero width ~680px + Root Further card width ~520px → export tối thiểu **1400×600** ở @2×
- Màu: trắng cho hero, cream `#FFEA9E` cho Root Further card (có thể export 1 version trắng, CSS `filter` sang cream hoặc export cả 2)
- File đích: `public/images/root-further-wordmark.svg` (hoặc `.png`)

### 1.2 6 Award badges (trophy circles) — từng cái khác nhau
**Figma nodes**: `C2.1`–`C2.6` Picture-Award sub-instances bên trong từng award card
**Hiện tại**: 6 card đang dùng chung `award-frame.png` (336×336) + overlay text. File `top-talent.png`, `mvp.png`, v.v. chỉ là **text label 222×36** → không dùng được.
**Cần export 6 file riêng, mỗi file là 1 trophy/medal design khác biệt**:
- Format: **PNG @2×** (vì có hiệu ứng ánh sáng, không phù hợp SVG đơn giản)
- Dimensions: **600×600** ở @2× (cho card hiển thị ~300×300 mỗi chiều)
- Files đích — thay thế toàn bộ:
  - `public/images/awards/top-talent.png`
  - `public/images/awards/top-project.png`
  - `public/images/awards/top-project-leader.png`
  - `public/images/awards/best-manager.png`
  - `public/images/awards/signature-2025.png`
  - `public/images/awards/mvp.png`
- **Lưu ý**: mỗi badge nên đã bao gồm tên giải thưởng trong artwork (TOP TALENT, TOP PROJECT, …) như design frame thể hiện — không cần overlay text thêm.

### 1.3 "2025" vertical decoration
**Figma node**: `3204:10152` sub-node trong Root Further card
**Hiện tại**: `public/images/2025-decoration.png` (290×67) thực ra là bitmap text **"FURTHER"** — file bị đặt tên sai. Code đã bỏ image này, thay bằng CSS render "2025" vertical-rl.
**Cần export**:
- Format: **SVG** ưu tiên, hoặc PNG @2×
- Dimensions: khoảng **200×800** vertical layout
- Màu: cream `#FFEA9E` với opacity ~15-30% (hoặc để CSS opacity)
- File đích: `public/images/2025-decoration.svg` (xoá file cũ)

### 1.4 Sun* Kudos promo illustration (KUDOS wordart đầy đủ)
**Figma node**: `3390:10349` sub-node (Sun* Kudos block illustration)
**Hiện tại**: `public/images/sunkudos-promo.png` (1120×500) chỉ là **dark decorative arc** — không có chữ "KUDOS" trong illustration. Code đang overlay chữ "KUDOS" bằng CSS text 120px.
**Cần export**:
- Format: PNG @2×
- Dimensions: **1200×600** ở @2×
- Nội dung: đủ cả KUDOS wordart (SVN-Gotham decorative font theo design-style.md §57) + background art
- File đích: `public/images/sunkudos-promo.png` (thay thế)
- **Lưu ý**: theo spec design-style.md, chữ "KUDOS" SVN-Gotham 96.16px được bake vào illustration chứ không phải text động → export 1 ảnh đã có sẵn text là đúng.

---

## 2. MEDIUM PRIORITY — nice to have

### 2.1 Hero key visual artwork — full fidelity
**Figma node**: `2167:9028` (MM_MEDIA_Keyvisual BG)
**Hiện tại**: `public/images/homepage-hero.png` 1512×1392 — đã có, trông ổn ở 1440 viewport
**Cần check lại**:
- Nếu quality hiện tại không đủ cho retina 4K → export @2× = **3024×2784**
- Format: **JPG @80-90% quality** (file nhỏ hơn PNG, artwork không cần alpha channel)
- Cân nhắc: có thể thêm phiên bản mobile-cropped nếu cần

### 2.2 Flanking artwork cho Root Further card
**Figma node**: bên trái + phải của title ROOT FURTHER trong Root Further card frame
**Hiện tại**: Code đang tái dùng `homepage-hero.png` với mask gradient làm decoration 2 bên
**Cần export nếu design team có asset riêng**:
- Format: PNG @2×
- Dimensions: ~**600×400** mỗi bên
- Files đích: `public/images/root-further-flank-left.png` + `-right.png`
- Nếu design team xác nhận dùng chung `homepage-hero.png` là được thì skip task này.

---

## 3. FONT LICENSING (không phải asset image)

### 3.1 Digital Numbers font — countdown digits
**Hiện tại**: Fallback `"Courier New", monospace` (xem `src/app/globals.css` `--font-digital-numbers`)
**Spec**: design-style.md §54 — Digital Numbers 49.152px, tile countdown
**Cần**:
- Xác nhận font chính xác design team dùng (tên cụ thể, ví dụ "Digital-7", "DSEG7-Classic", "Segment7")
- License commercial (nếu dùng prod) hoặc open-source version
- Drop file `.woff2` vào `public/fonts/digital-numbers.woff2`
- Uncomment font loading trong `src/app/layout.tsx` qua `next/font/local`
- Task T006 trong tasks.md theo dõi hạng mục này

---

## 4. Format yêu cầu chung

- **PNG**: @2× retina, RGBA (alpha) khi cần transparent background
- **SVG**: optimize qua SVGO, không embed raster images
- **JPG**: 80-90% quality cho full-bleed photos/artworks (không cần alpha)
- **Naming**: lowercase, dùng `-` phân cách, không dấu tiếng Việt
- **Location**: `public/images/` (asset chung), `public/images/awards/` (card badges), `public/fonts/` (font)

---

## 5. Checklist summary (đưa cho design team)

```
[ ] 1. "ROOT FURTHER" wordmark           (SVG hoặc PNG @2×, ~1400×600)
[ ] 2. 6 award badges độc lập            (PNG @2× mỗi file, 600×600)
     [ ] top-talent.png
     [ ] top-project.png
     [ ] top-project-leader.png
     [ ] best-manager.png
     [ ] signature-2025.png
     [ ] mvp.png
[ ] 3. "2025" vertical decoration         (SVG, ~200×800)
[ ] 4. Sun* Kudos promo — đủ KUDOS art    (PNG @2×, 1200×600)
[ ] 5. Hero artwork retina re-export      (JPG @2×, 3024×2784) — optional
[ ] 6. Root Further flank artwork L/R     (PNG @2× mỗi file) — optional nếu khác hero
[ ] 7. Digital Numbers font               (.woff2 + license)
```

Khi nhận đủ 1-5, bulk copy vào `public/images/` (hoặc subfolder), rồi chỉ cần gỡ bỏ CSS text fallbacks trong:
- `src/components/homepage/HeroSection.tsx` — swap `<RootFurtherTitle />` → `<Image>` cho wordmark
- `src/components/homepage/RootFurtherCard.tsx` — swap flanks + xoá CSS "2025" vertical
- `src/components/homepage/AwardCard.tsx` — dùng `award.image` thay vì hardcode `award-frame.png`, xoá overlay text
- `src/components/homepage/KudosPromoBlock.tsx` — xoá `<span>KUDOS</span>` overlay, chỉ render image
