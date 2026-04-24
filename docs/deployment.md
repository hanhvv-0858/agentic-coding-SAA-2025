# Deployment Guide — Cloudflare Workers

Hướng dẫn chi tiết deploy **Sun\* Annual Awards 2025** lên Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Bao gồm first-time setup, smoke-test, troubleshooting mọi lỗi thường gặp, và CI/CD.

> **TL;DR version** ở [README.md § Deployment](../README.md#deployment-cloudflare-workers). File này là full walkthrough — đọc khi setup lần đầu hoặc khi gặp lỗi.

---

## Mục lục

1. [Prerequisites](#1-prerequisites)
2. [Mental model — env vars chảy ở đâu](#2-mental-model--env-vars-chảy-ở-đâu)
3. [First-time setup](#3-first-time-setup)
4. [Build + Preview + Deploy](#4-build--preview--deploy)
5. [Smoke test sau khi deploy](#5-smoke-test-sau-khi-deploy)
6. [Observability](#6-observability)
7. [Redeploy workflows](#7-redeploy-workflows)
8. [Troubleshooting](#8-troubleshooting--mọi-lỗi-mình-từng-gặp)
9. [Custom domain (optional)](#9-custom-domain-optional)
10. [GitHub Actions auto-deploy](#10-github-actions-autodeploy)
11. [Rollback](#11-rollback)

---

## 1. Prerequisites

| Yêu cầu | Note |
|---|---|
| **Node 22 LTS** | Node 25 cần CA workaround — xem README |
| **Yarn v1.22.x** | `corepack enable && corepack prepare yarn@1.22.22 --activate` |
| **Cloudflare account** | Free tier đủ cho project học tập (100K request/ngày, 10 ms CPU/req) |
| **Supabase project đã sẵn sàng** | Có `SUPABASE_URL`, anon key, service_role key |
| **Google OAuth credentials** | Đã config trong Supabase dashboard |

---

## 2. Mental model — env vars chảy ở đâu

Đây là phần **confusing nhất** của deploy stack này. Trước khi làm bất cứ gì, hiểu rõ 3 nơi khác nhau env vars được đọc:

| Loại var | Nơi đọc | Khi nào đọc | Source of truth |
|---|---|---|---|
| `NEXT_PUBLIC_*` (client-facing) | Client JS bundle | **BUILD TIME** (inlined như string literal) | `.env.production.local` (gitignored) hoặc shell env khi `yarn cf:build` chạy |
| Server runtime env (e.g. `ALLOWED_EMAIL_DOMAINS`) | Server Components + Server Actions + middleware | **RUNTIME** trên Worker | `wrangler.toml [vars]` |
| Secrets (e.g. `SUPABASE_SERVICE_ROLE_KEY`) | Server runtime, sensitive | **RUNTIME** | Cloudflare Worker secrets (via `wrangler secret put`) |

### Pitfall phổ biến #1

**`NEXT_PUBLIC_*` trong `wrangler.toml [vars]` KHÔNG hoạt động.**

Next.js **inline** `process.env.NEXT_PUBLIC_X` thành literal string lúc build. Giá trị trong `wrangler.toml [vars]` chỉ có tác dụng server-runtime → đã quá muộn cho client bundle.

**Luôn đặt `NEXT_PUBLIC_*` trong `.env.production.local` (tại build time).**

### Pitfall phổ biến #2

**Server env schema validate tại BUILD time, không chỉ runtime.**

[src/libs/env/server.ts](../src/libs/env/server.ts) dùng Zod validate env khi module load. Next.js prerender static routes → trigger server module load → Zod chạy → thiếu biến → **build fail**.

Hệ quả: `ALLOWED_EMAIL_DOMAINS` cần tồn tại **cả** tại build-time (trong `.env.production.local` hoặc shell env) **và** runtime (trong `wrangler.toml`). Yes — duplicate. Unavoidable.

---

## 3. First-time setup

### Bước 1 — Cloudflare account + Wrangler login

```bash
npx wrangler login        # OAuth vào CF account qua browser
npx wrangler whoami       # xác nhận account
```

Cần quyền `Workers Scripts:Edit`. Với account free, Wrangler sẽ tự tạo.

### Bước 2 — Register `workers.dev` subdomain

**Quan trọng:** làm qua Dashboard UI, đừng làm qua CLI prompt (CLI hay glitchy).

1. Mở https://dash.cloudflare.com/ → chọn account
2. Sidebar trái → **Workers & Pages** → **Overview**
3. Đầu trang section **"Your subdomain"** → click **Change** hoặc **Set up**
4. Nhập tên (ví dụ `vuvanhanh`) → Save

Nếu tên bị chiếm → thử tên khác (`vu-van-hanh`, `vuvanhanh-saa`, …). Globally unique, vĩnh viễn, không đổi được.

URL cuối của Worker sẽ là:
```
https://<worker-name>.<your-subdomain>.workers.dev
```
Trong đó `<worker-name>` = value `name` trong [wrangler.toml](../wrangler.toml) (hiện là `agentic-coding-saa-2025`).

### Bước 3 — Tạo `.env.production.local`

File này **gitignored** (pattern `.env*` trong `.gitignore`). Nó là source of truth cho các `NEXT_PUBLIC_*` giá trị production khi build.

```bash
# Tạo từ .env.local + thay giá trị prod
touch .env.production.local
```

Nội dung (thay giá trị thực tế của bạn):

```env
# Production-build overrides (gitignored).
# Next.js reads this when NODE_ENV=production (i.e. `next build`),
# and its values WIN over .env.local.

NEXT_PUBLIC_SITE_URL=https://agentic-coding-saa-2025.<your-subdomain>.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_LAUNCH_AT=2026-04-22T00:00:00Z
NEXT_PUBLIC_CEREMONY_AT=2026-05-05T11:30:00Z
```

> **Tip:** Nếu muốn dev local test countdown, giữ `.env.local` với ngày tương lai. `.env.production.local` chỉ chạy khi `yarn cf:build`, không ảnh hưởng `yarn dev`.

### Bước 4 — Config `wrangler.toml`

File [wrangler.toml](../wrangler.toml) đã có sẵn cấu hình cơ bản. Verify:

```toml
name = "agentic-coding-saa-2025"
main = ".open-next/worker.js"
compatibility_date = "2026-04-17"
compatibility_flags = ["nodejs_compat"]   # ← bắt buộc cho Supabase SDK

workers_dev = true        # publish ra .workers.dev URL
preview_urls = false      # tắt per-version preview URLs (tuỳ chọn, giảm noise)

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[vars]
# Chỉ đặt server-runtime vars ở đây. KHÔNG đặt NEXT_PUBLIC_* (inlined at build time).
ALLOWED_EMAIL_DOMAINS = "sun-asterisk.com,gmail.com"
```

Nếu thiếu `nodejs_compat` → Supabase SDK fail (thiếu `node:crypto`, `node:stream`).

### Bước 5 — Set server-only secret

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Wrangler prompt `? Enter a secret value:` → paste **service_role** key từ Supabase Dashboard → *Settings* → *API* → *Project API keys* → **`service_role`** (KHÔNG phải `anon`).

**Lần đầu:** Wrangler sẽ hỏi `? There doesn't seem to be a Worker called "agentic-coding-saa-2025". Do you want to create a new Worker...` → **y**.

Verify:
```bash
npx wrangler secret list
# [ { "name": "SUPABASE_SERVICE_ROLE_KEY", "type": "secret_text" } ]
```

### Bước 6 — Supabase Auth Redirect URLs

**Critical** — nếu bỏ, Google OAuth fail với `redirect_uri_mismatch` ngay lần login đầu.

1. https://supabase.com/dashboard → chọn project
2. Sidebar → **Authentication** → **URL Configuration**
3. **Site URL**: 
   ```
   https://agentic-coding-saa-2025.<your-subdomain>.workers.dev
   ```
4. **Redirect URLs** (allow-list, thêm **cả 2**):
   ```
   http://localhost:3000/auth/callback
   https://agentic-coding-saa-2025.<your-subdomain>.workers.dev/auth/callback
   ```
5. Save.

Client code [GoogleLoginButton.tsx](../src/components/login/GoogleLoginButton.tsx) derive `redirectTo` từ `window.location.origin` → Supabase check allow-list → phải có match.

---

## 4. Build + Preview + Deploy

### Build

```bash
yarn cf:build
```

Script wrap `opennextjs-cloudflare build`, bên trong nó chạy 2 phase:
1. `next build` → output ở `.next/`
2. OpenNext transform → `.open-next/worker.js` + `.open-next/assets/`

Expected output cuối:
```
Worker saved in `.open-next/worker.js` 🚀
OpenNext build complete.
```

### Preview local (optional but recommended)

```bash
yarn cf:preview
```

Miniflare boot Worker ở `http://localhost:8787` với bindings thực (bao gồm secrets đã set ở bước 5). Lưu ý:

- Login full-round-trip **không work** qua `localhost:8787` (Supabase chỉ whitelist `localhost:3000` + `.workers.dev` URL)
- Preview dùng để smoke-test UI render + non-auth routes + image rendering
- Check browser console không có lỗi runtime Node (`Cannot find module 'fs'`, etc.)

### Deploy thật

```bash
yarn cf:deploy
```

Expected output cuối:
```
Total Upload:  12571.49 KiB / gzip: 2792.04 KiB
Worker Startup Time: 30 ms
Your Worker has access to the following bindings:
Binding                                                       Resource
env.ASSETS                                                    Assets
env.ALLOWED_EMAIL_DOMAINS ("sun-asterisk.com,gmail.com")      Environment Variable

Uploaded agentic-coding-saa-2025 (29.36 sec)
Deployed agentic-coding-saa-2025 triggers (1.61 sec)
  https://agentic-coding-saa-2025.<your-subdomain>.workers.dev
Current Version ID: ff750bb4-...
```

URL ở dòng cuối là endpoint public.

### Sanity check size

Workers free tier: **3 MB** unzipped, paid: **10 MB**. Project hiện ~12.5 MB raw / 2.8 MB gzipped — dư sức trong paid, cũng fit luôn free (Cloudflare đo gzipped).

---

## 5. Smoke test sau khi deploy

Mở URL `.workers.dev` vừa in. Checklist:

| # | Flow | Expected | Nếu fail → |
|---|---|---|---|
| 1 | `/` (homepage) | Render trực tiếp | Check `NEXT_PUBLIC_SITE_LAUNCH_AT` đã past chưa |
| 2 | `/login` | Google button render | — |
| 3 | Click Google → consent | Redirect về `/auth/callback` rồi `/kudos` (hoặc `/onboarding` lần đầu) | Supabase Redirect URLs chưa đúng (bước 6 §3) |
| 4 | `/kudos` | Live board với Spotlight + Highlight + Feed | 500 → mở `wrangler tail` xem log |
| 5 | `/kudos/new` → upload ảnh | Preview ảnh hiện | Check Supabase Storage bucket `kudo-images` + RLS |
| 6 | DevTools Network response headers | Có `cf-ray`, `server: cloudflare` | Confirm qua Workers runtime |
| 7 | DevTools Console | 0 lỗi đỏ | — |

---

## 6. Observability

```bash
# Stream live logs (runtime errors + console.log) — rất hữu ích 5-10 phút đầu sau deploy
npx wrangler tail

# Deployment history (version IDs, timestamps)
npx wrangler deployments list

# Rollback sang version trước nếu deploy mới broken
npx wrangler rollback
```

`wrangler tail` tail mọi request real-time — search "500", "Error", "throw" để bắt bug.

---

## 7. Redeploy workflows

Khi cần redeploy tuỳ theo thứ thay đổi:

| What changed | Cần làm |
|---|---|
| `NEXT_PUBLIC_*` trong `.env.production.local` | `yarn cf:build && yarn cf:deploy` (rebuild để bake lại bundle) |
| `[vars]` trong `wrangler.toml` (server-runtime) | `yarn cf:deploy` (không cần rebuild) |
| Secret via `wrangler secret put` | Immediate — applied tức thì tới Worker đang chạy, không cần redeploy |
| App code (`src/**`, migrations, `supabase/**`) | `yarn cf:build && yarn cf:deploy` |
| `wrangler.toml` name / compat flags | `yarn cf:deploy` |

---

## 8. Troubleshooting — mọi lỗi mình từng gặp

### 8.1. `Node.js middleware is not currently supported. Consider switching to Edge Middleware.`

**Root cause:** Next 16 introduced `src/proxy.ts` convention chạy Node runtime. OpenNext-Cloudflare chỉ support legacy Edge `src/middleware.ts`.

**Fix:** Rename file `src/proxy.ts` → `src/middleware.ts`, rename export `proxy` → `middleware`. **KHÔNG** thêm `runtime: "edge"` vào `config` (Next sẽ báo `Proxy does not support Edge runtime`).

### 8.2. `Next.js can't recognize the exported config field in route. Proxy does not support Edge runtime.`

Bạn vừa thêm `runtime: "edge"` vào `config` trong `proxy.ts`. Proxy không support edge. Đọc 8.1 — giải pháp là dùng `middleware.ts`.

### 8.3. `Invalid server environment variables: ALLOWED_EMAIL_DOMAINS: expected string, received undefined`

**Root cause:** Biến này được Zod schema yêu cầu, nhưng chỉ available runtime (`wrangler.toml [vars]`). Build-time validation trigger khi Next prerender routes → fail.

**Fix:** Thêm vào `.env.production.local`:
```env
ALLOWED_EMAIL_DOMAINS=sun-asterisk.com,gmail.com
```
Duplicate với `wrangler.toml` — không tránh được, đó là trade-off của Next env inlining.

Với GitHub Actions, add luôn repo variable `ALLOWED_EMAIL_DOMAINS` (xem §10).

### 8.4. Countdown hiển thị sai ngày sau deploy

`NEXT_PUBLIC_CEREMONY_AT` / `NEXT_PUBLIC_SITE_LAUNCH_AT` được **bake vào client bundle** tại build time. Update `.env.production.local` rồi **rebuild + redeploy**:
```bash
yarn cf:build && yarn cf:deploy
```

Update trong `wrangler.toml [vars]` **không có tác dụng** — biến `NEXT_PUBLIC_*` không được đọc runtime.

### 8.5. Login redirect báo `redirect_uri_mismatch`

Supabase Redirect URLs allow-list thiếu URL Worker. Về **bước 6 §3** — thêm `<worker-url>/auth/callback`.

### 8.6. 500 với `Invalid API key` trong `wrangler tail`

Service role key set sai. Re-set:
```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```
Paste key `service_role` **chính xác** — không có space/newline ở đầu/cuối.

### 8.7. `node scripts/check-bundle-size.mjs` báo `app-build-manifest.json not found`

Script cũ viết cho Next 15. Next 16 đổi manifest structure. File có thể đã fix cho Next 16 (nếu bạn đã pull commit `c98dcb6`). Nếu script vẫn fail → skip guard (không phải gate bắt buộc) hoặc đồng bộ với main branch.

### 8.8. Deploy prompt `You need to register a workers.dev subdomain`

CLI prompt hay glitchy. **Fix:** Ctrl+C huỷ → về dashboard register subdomain thủ công (xem **bước 2 §3**) → `yarn cf:deploy` lại.

### 8.9. Wrangler warning về `workers_dev`/`preview_urls` không explicit

```
▲ Because 'workers_dev' is not in your Wrangler file, it will be enabled for this deployment by default.
```

Thêm vào `wrangler.toml`:
```toml
workers_dev = true
preview_urls = false
```
Silence warnings, explicit là best practice.

### 8.10. Test pass local nhưng fail trên GitHub Actions với timezone offset

Test dùng `new Date(year, month, day, hour, ...)` — local-time constructor, phụ thuộc system TZ. Local máy là `Asia/Ho_Chi_Minh (UTC+7)`, GitHub runner là UTC → 2 môi trường cho ra giá trị khác nhau.

**Fix:** Dùng `new Date(Date.UTC(...))` để input UTC deterministic, output VN time cũng deterministic.

```diff
- const d = new Date(2025, 9, 30, 10, 0, 0); // 10:00 local
+ const d = new Date(Date.UTC(2025, 9, 30, 3, 0, 0)); // 03:00 UTC = 10:00 VN
```

---

## 9. Custom domain (optional)

Điều kiện: domain đã nằm trong Cloudflare DNS zone.

1. Mua domain qua Cloudflare Registrar (at-cost, ~$10/năm `.com`) HOẶC import domain đã có vào Cloudflare DNS
2. Uncomment trong [wrangler.toml](../wrangler.toml):
   ```toml
   [env.production]
   routes = [{ pattern = "saa.sun-asterisk.com", custom_domain = true }]
   ```
3. Deploy với env flag:
   ```bash
   yarn cf:deploy --env production
   ```
4. Cloudflare tự issue cert + route traffic

Không có custom domain? URL `.workers.dev` là đủ cho học tập / portfolio.

---

## 10. GitHub Actions auto-deploy

### 10.1. Secrets + Variables

Repo → **Settings** → **Secrets and variables** → **Actions**:

**Secrets (3):**
| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token từ https://dash.cloudflare.com/profile/api-tokens — template "Edit Cloudflare Workers" |
| `CLOUDFLARE_ACCOUNT_ID` | `npx wrangler whoami` in ra, hoặc trong dashboard URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Giống value trong `.env.production.local` |

**Variables (5):**
| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://agentic-coding-saa-2025.<subdomain>.workers.dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SITE_LAUNCH_AT` | `2026-04-22T00:00:00Z` |
| `NEXT_PUBLIC_CEREMONY_AT` | `2026-05-05T11:30:00Z` |
| `ALLOWED_EMAIL_DOMAINS` | `sun-asterisk.com,gmail.com` |

> `ALLOWED_EMAIL_DOMAINS` cần cho build-time Zod validation, xem pitfall §2 và §8.3.

### 10.2. Workflow file

Đã có sẵn ở [.github/workflows/deploy.yml](../.github/workflows/deploy.yml). Các bước:
1. Checkout
2. Node 22 + Yarn via corepack
3. `yarn install --frozen-lockfile`
4. Tạo `.env.production.local` từ vars + secrets
5. `yarn cf:build`
6. `yarn cf:deploy` với `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` env

### 10.3. Trigger

Mặc định workflow chỉ chạy khi bấm manual (disable auto-deploy on push):
```yaml
on:
  # push:
  #   branches: [main]
  workflow_dispatch:
```

Để chạy: **Actions** tab → chọn "Deploy to Cloudflare Workers" → **Run workflow** → chọn branch → click.

### 10.4. Bật auto-deploy

Uncomment 2 dòng trong [.github/workflows/deploy.yml](../.github/workflows/deploy.yml):
```yaml
on:
  push:                        # ← uncomment
    branches: [main]           # ← uncomment
  workflow_dispatch:
```

Commit + push → từ đó mỗi push `main` tự trigger deploy.

### 10.5. Skip deploy với commit flag

Nếu muốn push mà không deploy (vd: update docs), thêm điều kiện vào workflow:
```yaml
jobs:
  deploy:
    if: "!contains(github.event.head_commit.message, '[skip deploy]')"
```
Rồi commit với `git commit -m "docs: update README [skip deploy]"`.

---

## 11. Rollback

### Qua Wrangler

```bash
npx wrangler deployments list       # Xem 10 version gần nhất với ID
npx wrangler rollback               # Rollback sang version trước đó
npx wrangler rollback <version-id>  # Rollback sang version cụ thể
```

### Qua Dashboard

Cloudflare Dashboard → **Workers & Pages** → `agentic-coding-saa-2025` → **Deployments** → click version muốn revert → **Rollback**.

### Rule of thumb

- Rollback **nhanh nhất** khi bug prod xuất hiện (rollback trong 5 giây vs debug ~15 phút)
- Sau khi rollback → mở `wrangler tail` xem prod đã ổn chưa → điều tra nguyên nhân → fix code → redeploy forward

---

## 12. Cleanup / remove deploy

Nếu muốn xoá Worker hoàn toàn:

```bash
npx wrangler delete agentic-coding-saa-2025
```

Dashboard sẽ xác nhận. Sau đó secrets + bindings đều bị xoá cùng.

---

## Tham khảo

- [@opennextjs/cloudflare docs](https://opennext.js.org/cloudflare)
- [Wrangler CLI reference](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Cloudflare Workers env + bindings](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Next.js env variable precedence](https://nextjs.org/docs/app/guides/environment-variables)
