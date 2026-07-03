# uMatter — Google Play Release Pack

Everything you need to publish **uMatter** (`com.apcsthesisteam.umatter`) to Google Play for
**Vietnam + South Korea**. Work top‑to‑bottom. Items marked ⛔ are blockers.

- **App name:** uMatter
- **Package:** `com.apcsthesisteam.umatter`  ·  **versionCode** 2  ·  **versionName** 1.0
- **Category:** Health & Fitness
- **Contact email:** apcsthesisteam@gmail.com
- **Privacy policy URL:** `https://umatter-apcs.duckdns.org/legal/privacy.html`
- **Signing:** Play App Signing; upload key = `umatter-upload` keystore

---

## 0. Where we are (status)

| Step | Status |
|---|---|
| Backend HTTPS (DuckDNS + Caddy) | ⛔ **staged — waiting on you to open OCI ports 80/443**, then I activate Caddy |
| App points at HTTPS + manifest hardened | ✅ done (code) |
| Privacy policy hosted | ✅ staged (goes live with HTTPS) |
| Signed `.aab` rebuilt against HTTPS | ⏳ after HTTPS is live |
| Play Console: app + listing + declarations | ⏳ this document |
| Closed test (12 testers × 14 days) | ⏳ **personal account → mandatory before production** |

---

## 1. ⛔ Open OCI ports 80 + 443 (only you can)

1. OCI Console → **Networking → Virtual Cloud Networks →** your VCN **→ Security Lists →** the **public** subnet's list.
2. **Add Ingress Rules** (Stateful), Source `0.0.0.0/0`, IP Protocol **TCP**, for **Destination Port 80** and **443**.
3. Tell me when done — I'll start Caddy, confirm the cert issues, verify
   `https://umatter-apcs.duckdns.org/health` = `200`, then rebuild the signed `.aab`.

---

## 2. Store listing

### App name (≤30)
`uMatter`

### Short description — English (≤80)
`Care for your mental health daily: mood, journal, AI support & real therapists.`

### Short description — Tiếng Việt (≤80)
`Chăm sóc sức khỏe tinh thần mỗi ngày: cảm xúc, nhật ký, AI và chuyên gia.`

### Full description — English (≤4000)
```
uMatter is a gentle, judgment‑free companion for your mental wellbeing — built
for teenagers and young people. It turns caring for your mind into a small daily
habit: notice how you feel, understand your patterns, talk to someone who cares
(a warm AI any time, or a verified therapist when you need more), and hold on to
the moments that make you feel good.

WHAT YOU CAN DO
• Daily mood check‑ins — log how you feel in seconds and see your emotional
  patterns over time.
• Private journal ("Góc tâm tư") — write freely, add photos, and watch your
  365‑day mood calendar and streaks grow.
• Treasure Box — save your happy memories (a photo, a kind message, a small win)
  and reopen them on hard days.
• Whole‑self tracking — sleep, nutrition and water, automatic step counting, and
  guided breathing & meditation, each with beautiful 7‑day trends.
• Bạn Tâm Giao, your AI companion — an empathetic chat available 24/7 that
  understands your context. It is supportive, never a replacement for
  professional care.
• Find the right therapist — a caring intake matches you with a verified
  psychologist; book and meet by secure video or chat, all from your phone.
• Connect with friends — add friends and chat in real time.
• Small wins, celebrated — daily trophies and streaks make self‑care rewarding.

PRIVATE BY DESIGN
Your journal, mood and health data are yours. A therapist can see them only if
you explicitly grant permission — and you can revoke it any time.

IMPORTANT
uMatter is a support tool, not an emergency or medical service, and it does not
provide diagnosis. In a crisis it points you straight to professional help and a
real support hotline. If you are in danger, contact your local emergency number.

Fully bilingual (Tiếng Việt & English), with light/dark themes and a friendly
first‑run tour. Made with 💚.
```

### Full description — Tiếng Việt (≤4000)
```
uMatter là người bạn đồng hành nhẹ nhàng, không phán xét cho sức khỏe tinh thần
của bạn — dành cho thanh thiếu niên và người trẻ. Ứng dụng biến việc chăm sóc
tâm trí thành một thói quen nhỏ mỗi ngày: ghi lại cảm xúc, hiểu các khuôn mẫu của
mình, trò chuyện với người luôn lắng nghe (một AI ấm áp bất cứ lúc nào, hoặc
chuyên gia tâm lý đã được xác minh khi bạn cần), và giữ lại những khoảnh khắc
khiến bạn thấy vui.

BẠN CÓ THỂ LÀM GÌ
• Ghi nhận cảm xúc mỗi ngày — chỉ vài giây và xem được dòng cảm xúc theo thời gian.
• Nhật ký riêng tư ("Góc tâm tư") — viết tự do, thêm ảnh, cùng lịch cảm xúc 365
  ngày và chuỗi ngày kiên trì.
• Hộp kho báu — cất giữ những kỷ niệm đẹp (một tấm ảnh, lời nhắn, niềm vui nhỏ) và
  mở lại vào những ngày khó khăn.
• Chăm sóc toàn diện — giấc ngủ, dinh dưỡng và nước uống, đếm bước chân tự động,
  cùng bài thở và thiền có hướng dẫn, kèm biểu đồ 7 ngày.
• Bạn Tâm Giao, trợ lý AI — trò chuyện thấu cảm 24/7, thấu hiểu bối cảnh của bạn.
  Đây là sự hỗ trợ, không thay thế cho chăm sóc chuyên môn.
• Tìm đúng chuyên gia — bài khảo sát nhẹ nhàng ghép bạn với chuyên gia tâm lý đã
  xác minh; đặt lịch và gặp qua video hoặc nhắn tin an toàn ngay trên điện thoại.
• Kết nối bạn bè — thêm bạn và trò chuyện theo thời gian thực.
• Ăn mừng những chiến thắng nhỏ — cúp mỗi ngày và chuỗi kiên trì.

RIÊNG TƯ NGAY TỪ THIẾT KẾ
Nhật ký, cảm xúc và dữ liệu sức khỏe là của bạn. Chuyên gia chỉ xem được khi bạn
cho phép — và bạn có thể thu hồi bất cứ lúc nào.

LƯU Ý
uMatter là công cụ hỗ trợ, không phải dịch vụ khẩn cấp hay y tế, và không đưa ra
chẩn đoán. Khi có khủng hoảng, ứng dụng sẽ hướng bạn đến sự trợ giúp chuyên môn và
đường dây nóng. Nếu bạn đang gặp nguy hiểm, hãy gọi số khẩn cấp tại địa phương.

Song ngữ (Tiếng Việt & English), giao diện sáng/tối và hướng dẫn thân thiện lần
đầu. Made with 💚.
```

### Graphic assets you must upload
| Asset | Spec | Notes |
|---|---|---|
| App icon | 512×512 PNG, 32‑bit | Your launcher icon at high res |
| Feature graphic | 1024×500 PNG/JPG | Shown at top of listing; required |
| Phone screenshots | 2–8, PNG/JPG, 16:9 or 9:16, min 320px | Home, mood check‑in, journal, AI chat, therapist booking, trends |
| (Optional) 7" / 10" tablet shots | — | Only if you support tablets |

> Tip: capture screenshots from a release build on a phone/emulator. Avoid
> showing real personal data — use the demo content.

---

## 3. Data Safety form (recommended answers)

Answer honestly; below matches what uMatter actually does. Under **Data
collected**, mark **Encrypted in transit = Yes** (true once HTTPS is live) and
**Users can request deletion = Yes** (email flow in the policy).

| Data type | Collected | Purpose | Notes |
|---|---|---|---|
| Name | Yes | App functionality, account | Profile |
| Email address | Yes | Account management | Login |
| Other personal info (school, emergency contact) | Yes (optional) | App functionality | Only if user provides |
| **Health info** (mood, journal, breathing/meditation, therapy intake) | Yes | App functionality, personalization | Sensitive |
| **Fitness info** (steps, nutrition, water, sleep) | Yes | App functionality | — |
| Photos | Yes | App functionality | Journal & Treasure Box images |
| In‑app messages (social chat) | Yes | App functionality | User‑to‑user |
| AI chat content | Yes | App functionality | Sent to Google Gemini (processor) |
| Device or other IDs (FCM push token) | Yes | Messaging (notifications) | — |
| App activity/interactions | Yes | Analytics/app functionality | Keep honest & minimal |
| Location | **No** | — | App uses no GPS/location permission |
| Financial info | **No** | — | — |

**Data shared with third parties:** Google (Gemini AI, Firebase) and Zoom act as
service providers. Decide "shared" vs "processed on our behalf" honestly:
- **Gemini:** confirm your API tier. On the paid Gemini API, prompts are not used
  to train Google's models (processing). On the free tier, they may be — if so,
  declare AI chat as **shared**. ⚠️ **Verify this before you submit.**
- **Zoom audio/video:** real‑time during a session; if you do **not** record or
  store it, you generally declare it as processed for the call, not stored. ⚠️
  Confirm no recording is enabled.

**Security practices:** Data encrypted in transit = **Yes**. Users can request
data deletion = **Yes** (via apcsthesisteam@gmail.com; documented in the policy).

---

## 4. Content rating (IARC questionnaire)

Fill this in **App content → Content ratings**. Answer honestly:
- Category: **Reference, News, or Educational** or **Health** (utility app, not a game).
- Violence / sexual content / profanity / gambling / controlled substances: **No**.
- **Does the app let users interact / share content or communicate?** **Yes**
  (friends + real‑time chat) → declare user interaction and that users can share
  content/media.
- **Does it reference sensitive topics (mental health, self‑harm)?** Be truthful:
  uMatter discusses mental health and surfaces crisis‑support resources.
- Expected result: a **Teen**‑level rating (e.g., ESRB Teen / PEGI 12 / GRAC 12
  for Korea). That's fine and appropriate for the audience.

---

## 5. Target audience & content

**App content → Target audience and content:**
- **Target age groups:** select **13–15, 16–17, 18 and over**. ✅ Do **NOT**
  include under‑13 — that would pull you into Google's Families/COPPA program and
  Korea's under‑14 guardian‑consent regime with much heavier requirements.
- **Appeals to children?** No.
- This keeps the app out of "Designed for Families" while remaining teen‑appropriate.

> ⚠️ Legal note (not legal advice): a mental‑health app for minors handling
> sensitive data in VN + KR touches Vietnam's PDPD and Korea's PIPA (under‑14
> guardian consent). For a real public launch, have the policy + consent flow
> reviewed by someone qualified. Setting the floor at 13+ (and noting KR 14+ in
> the policy) is the pragmatic path for the thesis demo.

---

## 6. Other "App content" declarations

| Declaration | Answer |
|---|---|
| Privacy policy | `https://umatter-apcs.duckdns.org/legal/privacy.html` |
| Ads | **No ads** |
| App access (login required) | **Yes** → provide reviewer credentials (Section 7) |
| Content ratings | Complete questionnaire (Section 4) |
| Government apps | No |
| Financial features | No |
| Health apps | If prompted (therapy/health features), complete the Health
  declaration honestly: you connect users to therapists but are **not** a
  licensed provider yourself. |
| News app | No |
| Data safety | Section 3 |

---

## 7. App access (reviewer test account)

The whole app is behind login, so Google's reviewers need a working account **on
the production backend**. A seeded account is already live and has demo data
(mood, journal, Treasure Box images) — ideal for review. Verified working against
the live HTTPS API.

Provide in **App access → All functionality → Add instructions**:
- Username: `teen001.dev@mhsa.local`
- Password: `developer`
- Steps: "Log in with the credentials above. From the home screen you can log a
  mood, open the journal ('Góc tâm tư'), chat with the AI companion ('Bạn Tâm
  Giao'), open the Treasure Box, and start therapist matching. The
  Vietnamese/English toggle is in Profile → Settings."

> Prefer a dedicated reviewer‑only account instead of the shared seed one? Tell
> me and I'll create one on the live backend and hand you the credentials.

---

## 8. Release mechanics (order of operations)

1. **Create app** in Play Console → *Create app* (name uMatter, language, App,
   Free, accept declarations).
2. **Set up → App content**: complete every card above (privacy, data safety,
   ratings, target audience, ads, app access).
3. **Store listing**: paste Section 2 + upload graphics.
4. **Countries/regions:** Vietnam + South Korea. **Pricing:** Free.
5. **Testing → Closed testing:** create a track, upload the **HTTPS‑built `.aab`**,
   add **≥12 testers** (email list or Google Group). Roll out.
   - Testers so far (need ≥12): `khiemduong0938@gmail.com`, `duonghieu2907@gmail.com` — *add more.*
6. ⛔ **Personal‑account rule:** keep the closed test running with 12+ opted‑in
   testers for **14 continuous days**. Then Play unlocks **Apply for production
   access**.
7. **Production:** promote the build, submit for review. First review for a new
   account can take a few days.

---

## 9. Checklist before you hit "Send for review"

- [ ] OCI 80/443 open, Caddy live, `https://…/health` = 200
- [ ] `.aab` rebuilt against HTTPS and signed with `umatter-upload` key
- [ ] Privacy policy URL loads publicly
- [ ] Data safety: encrypted‑in‑transit = Yes, deletion = Yes, Gemini/Zoom sharing verified
- [ ] Content rating questionnaire submitted
- [ ] Target audience = 13+ (no under‑13)
- [ ] Reviewer account works on production
- [ ] Store listing text (EN + VI) + icon + feature graphic + ≥2 screenshots
- [ ] Countries = VN + KR, price = Free
- [ ] Closed test running (12 testers / 14 days) → then production
```

---

## 10. Closed-test tracker (live)

**Status:** Closed testing **version 2** submitted — *In review* (quick checks passed,
awaiting Google reviewers). Package `com.apcsthesisteam.umatter`, versionCode **2**,
countries **Vietnam + South Korea**. The `FOREGROUND_SERVICE_MEDIA_PROJECTION`
permission was removed in v2, so no media-projection declaration/video is required.

### 12-tester / 14-day window (personal-account gate)

Need **≥12 testers opted in for 14 continuous days** before *Apply for production*
unlocks. Recruit 14–15 to absorb dropouts. A tester leaving the list mid-window
can reset the counter.

| # | Tester email | Added to list | Opted in via link | Installed | Notes |
|---|--------------|:---:|:---:|:---:|-------|
| 1 | khiemduong0938@gmail.com | ☐ | ☐ | ☐ | |
| 2 | duonghieu2907@gmail.com | ☐ | ☐ | ☐ | |
| 3 |  | ☐ | ☐ | ☐ | |
| 4 |  | ☐ | ☐ | ☐ | |
| 5 |  | ☐ | ☐ | ☐ | |
| 6 |  | ☐ | ☐ | ☐ | |
| 7 |  | ☐ | ☐ | ☐ | |
| 8 |  | ☐ | ☐ | ☐ | |
| 9 |  | ☐ | ☐ | ☐ | |
| 10 |  | ☐ | ☐ | ☐ | |
| 11 |  | ☐ | ☐ | ☐ | |
| 12 |  | ☐ | ☐ | ☐ | |
| 13 |  | ☐ | ☐ | ☐ | *buffer* |
| 14 |  | ☐ | ☐ | ☐ | *buffer* |

**Tester instructions (send with the opt-in link):**
1. Open the opt-in link on the phone signed in with the Google account you gave me.
2. Tap **Become a tester**, then **Download it on Google Play**.
3. Install **uMatter** and **open it at least once**; keep it installed for 14 days.
4. Stay on the tester list the whole window — don't leave until told.

**Milestones:**
- [ ] Review approved (email received) — date: ________
- [ ] Opt-in link sent to all testers — date: ________
- [ ] ≥12 testers installed & opened — date: ________
- [ ] Day-14 reached with 12+ still opted in — date: ________
- [ ] *Apply for production access* → submit for VN + KR production
