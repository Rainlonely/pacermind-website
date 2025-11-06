#Pacermind Website SPEC
🥅 Goal

为 Pacermind 构建一个兼具专业运动科技感与 Apple 审美的品牌网站，用于：
	1.	App Store 审核合规（隐私政策与支持页）
	2.	展示产品价值、AI 逻辑与视觉风格
	3.	后续可扩展为中国区备案域名（pacermind.cn）

参考风格： Runna￼
核心关键词：极简、克制、专业、速度感、AI智能分析

⸻

🧩 Modules

1️⃣ Hero / Landing Section

Purpose:
建立第一印象与品牌识别，突出口号与视觉冲击。

Content:
	•	大标题：Pacermind
	•	副标题（Slogan）：Run Smarter. Think Deeper.
	•	辅助文案：Every Run Tells a Story.
	•	CTA 按钮：
	•	[Download on App Store]
	•	[Learn More]
	•	背景：动态数据流线（仿跑步节奏线条），iPhone Mockup 展示 App 界面（首页+AI Insight）

Visual Style:
深色背景 (#0C0C0E) + 白色大号字体 + 蓝色主按钮 (#00B3FF)
滚动视差：轻微上下浮动的跑步数据曲线动画。

⸻

2️⃣ Core Value Section

Purpose:
用三句话解释 Pacermind 的核心理念：数据 → 洞察 → 改进

Layout:
三列卡片 + 图标（SF Symbols风格）
图标    标题    描述
🧠  数据驱动的洞察  将跑步数据转化为真实洞察，而非仅仅数字。
⚙️  AI个性分析  基于配速、步频、心率等训练维度，生成个性化反馈。
🔒  本地隐私保护    所有分析均在设备上完成，不上传任何数据。

Motion:
滚动时淡入；鼠标悬停时放大 1.05x。

⸻

3️⃣ Features Section

Purpose:
展示产品功能逻辑，体现“智能 + 专业”的定位。

Content Blocks:
	1.	AI Insight Engine
	•	自动分析你的配速、步频与心率，揭示背后的训练状态。
	•	文案：“Understand fatigue, readiness, and progression — automatically.”
	2.	Multi-source Sync
	•	与 Apple Health 与 Strava 自动同步。
	•	图标：双箭头同步动画。
	3.	Training History & Trends
	•	日历与图表展示训练趋势。
	•	文案：“See your growth in data, not in guesswork.”
	4.	Daily Insight Limit
	•	限制每日分析次数，确保结果专注与高质量。
	•	文案：“Precision over quantity.”
Layout:
两行两列功能卡片；淡入动画 + 轻微滚动延迟。


4️⃣ Product Showcase Section

Purpose:
展示实机界面，传达产品真实体验。

Display:
滚动视差 + iPhone 模拟图，依次展示：
	•	首页（今日运动数据）
	•	Insight 页面（AI 解读）
	•	历史页面（日历总览）

Supporting Text:

“Everything you do in motion, understood in context.”

Visual:
可使用深灰背景 + 蓝色高光线条，辅以小粒子动态特效。

5️⃣ Use Cases Section

Purpose:
让用户看到真实应用场景。

场景    文案
For Marathoners 探索每个训练周期的疲劳与突破点。
For Everyday Runners    掌握恢复节奏，让训练更高效。
For Data Lovers 让数字真正说话。
Layout:
三张横幅图（城市夜跑 / 山路 / 室内跑步机），上叠透明渐变黑背景 + 白色文字。

6️⃣ Trust & Privacy Section

Purpose:
建立信任，强化隐私保护与品牌价值。

Text:

Pacermind runs entirely on your device.
No servers. No uploads. No tracking.
Just your data, your run, your mind.

Visual:
蓝色数据盾牌图标 + 轻微粒子流动背景。


7️⃣ Footer / CTA

Purpose:
引导转化，汇总信息。

Text:
Ready to understand your run?
立即开启你的洞察之旅。

Buttons:
	•	[Download Pacermind]
	•	[Privacy Policy]
	•	[Support]

Footer Links:
	•	Privacy Policy → /privacy.html
	•	Support → /support.html
	•	© 2025 Rainlonely Studio

🧠 Logic
	1.	网站架构逻辑
	•	单页滚动式（Landing Page）
	•	顶部导航锚点：Home | Features | Product | Privacy | Support
	•	滚动动画触发：视差淡入、数值上升动效
	2.	响应式设计
	•	优先 iPhone / Mac Safari 视觉体验
	•	移动端折叠导航，按钮放大，滚动动画减少
	3.	加载性能
	•	使用静态生成（Next.js / Astro / Hugo）或纯 HTML 静态页
	•	所有动画通过 CSS 实现，避免 JS 依赖

⸻

📁 File Structure
/pacermind-website
│
├── index.html            # 主页面
├── privacy.html          # 隐私政策（之前生成内容）
├── support.html          # 用户支持页面（FAQ + 联系）
│
├── /assets
│   ├── /images
│   │   ├── hero-bg.svg
│   │   ├── iphone-mockup.png
│   │   ├── feature-icons.svg
│   │   ├── run-scenes/
│   ├── /fonts
│   └── /styles
│       ├── main.css
│       └── animations.css
│
└── /scripts
    └── scroll-effects.js

🎨 Design Tokens
类型    值
主色    #00B3FF
背景色  #0C0C0E
文字主色    #FFFFFF
副色    #1F1F22
强调色  #3DD6FF
字体    Inter / SF Pro Display / 思源黑体
按钮圆角    12px
动效时长    0.4s ease-in-out

🧭 Slogan Final Decision

Primary Slogan:

    Run Smarter. Think Deeper.

Secondary Line:

    Every Run Tells a Story.

Chinese Translation:

    更聪明地跑，更深刻地理解自己。
    每一次奔跑，都有它的故事。
