document.addEventListener("DOMContentLoaded", () => {
    const animatedItems = document.querySelectorAll(".animate");
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    animatedItems.forEach(item => {
        if (item.classList.contains("is-visible")) {
            return;
        }
        observer.observe(item);
    });

    const navToggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navToggle && nav) {
        navToggle.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                if (nav.classList.contains("is-open")) {
                    nav.classList.remove("is-open");
                    navToggle.setAttribute("aria-expanded", "false");
                }
            });
        });
    }

    const TRANSLATIONS = {
        shared: {
            en: {
                "nav.home": "Home",
                "nav.journey": "Journey",
                "nav.features": "Features",
                "nav.product": "Product",
                "nav.download": "Download",
                "nav.privacy": "Privacy",
                "nav.support": "Support",
                "footer.privacy": "Privacy Policy",
                "footer.support": "Support"
            },
            zh: {
                "nav.home": "首页",
                "nav.journey": "旅程",
                "nav.features": "功能亮点",
                "nav.product": "产品展示",
                "nav.download": "下载",
                "nav.privacy": "隐私",
                "nav.support": "支持",
                "footer.privacy": "隐私政策",
                "footer.support": "支持"
            }
        },
        home: {
            en: {
                "hero.badge": "PacerMind 2.0",
                "hero.title": "Light Up Your City.",
                "hero.subtitle": "This is my journey. What's yours?",
                "hero.body": "PacerMind turns years of routes, notes, plans, and small decisions into a living map of why you keep running.",
                "hero.ctaPrimary": "Download on App Store",
                "hero.ctaSecondary": "Learn More",
                "hero.scroll": "Scroll",
                "values.eyebrow": "Core Value",
                "values.title": "Better Training Plans • AI Insight Engine • On-Device Privacy",
                "values.subtitle": "Transform your running data into a clear path forward.",
                "values.card1.title": "Better Training Plans",
                "values.card1.text": "Transform data into actionable training steps.",
                "values.card2.title": "AI Insight Engine",
                "values.card2.text": "Harness AI insight and trends.",
                "values.card3.title": "On-Device Privacy",
                "values.card3.text": "Designed for privacy-first, on-device analysis.",
                "features.eyebrow": "Features",
                "features.title": "Understand Your Run in Four Dimensions",
                "features.subtitle": "Smart analysis, seamless sync, rich history, and intentional limits—every detail crafted for thoughtful runners.",
                "features.card1.title": "AI Insight Engine",
                "features.card1.text": "Receive concise, actionable feedback after every run.",
                "features.card2.title": "Smart Training Plans",
                "features.card2.text": "Dynamic weekly plans tailored to your goal, schedule, and ability.",
                "features.card3.title": "Multi-source Sync",
                "features.card3.text": "Seamless sync with Apple Health, Strava, and Apple Watch.",
                "features.card4.title": "Weekly Journal",
                "features.card4.text": "Weekly training recaps to reflect, learn, and improve.",
                "features.card5.title": "Training History & Trends",
                "features.card5.text": "Calendar views and charts showcase training trends. See your growth in data, not guesswork.",
                "features.card6.title": "Daily Insight Limit",
                "features.card6.text": "We cap daily insights to keep every analysis focused and high-quality.",
                "product.eyebrow": "Product Showcase",
                "product.title": "Everything you do in motion, understood in context.",
                "product.fig1": "Home · Today’s training data",
                "product.fig2": "Insight view · AI interpretation",
                "product.fig3": "History view · Calendar overview",
                "usecases.eyebrow": "Use Cases",
                "usecases.title": "Tailored for Every Runner",
                "usecases.subtitle": "For goal-oriented runners, consistency seekers, data lovers, and Apple Watch enthusiasts.",
                "usecases.card1.title": "Goal-oriented runners",
                "usecases.card1.text": "Build race-ready blocks with clear targets and milestones.",
                "usecases.card2.title": "Consistency seekers",
                "usecases.card2.text": "Create habits with steady weekly structure and guidance.",
                "usecases.card3.title": "Tech-savvy runners",
                "usecases.card3.text": "Track trends and metrics with clear AI commentary.",
                "usecases.card4.title": "Apple Watch focused",
                "usecases.card4.text": "Maximize Watch guidance with real-time pace and phase cues.",
                "trust.title": "PacerMind puts privacy controls in front of AI features.",
                "trust.copy": "Core workout history stays in your app, and AI features ask permission before sending selected data for plan and insight generation.",
                "trust.cta1": "Read Privacy Policy",
                "trust.cta2": "Visit Support",
                "cta.title": "Ready to understand your run?",
                "cta.subtitle": "Start your journey of insight today.",
                "cta.primary": "Download PacerMind",
                "cta.secondary": "Privacy Policy",
                "hero.eyebrow": "PacerMind 2.0",
                "hero.title": "Light Up Your City.",
                "hero.subtitle": "This is my journey. What's yours?",
                "hero.body": "PacerMind turns years of routes, notes, plans, and small decisions into a living map of why you keep running.",
                "hero.ctaPrimary": "Download on App Store",
                "hero.ctaSecondary": "View Journey",
                "hero.panelLabel": "Latest city",
                "hero.scroll": "Scroll",
                "journey.eyebrow": "My Journey",
                "journey.title": "A city slowly lit by ordinary days.",
                "journey.subtitle": "Not every run is a breakthrough. Some just make the map a little warmer.",
                "journey.stats.runs": "Runs",
                "journey.stats.distance": "Kilometers",
                "journey.stats.years": "Years",
                "journey.stats.pace": "Avg Pace",
                "journey.stats.time": "Total Time",
                "journey.recent": "Recent 10 Runs",
                "product.eyebrow": "PacerMind 2.0",
                "product.title": "A different kind of running app.",
                "product.subtitle": "Not just to make you faster. To help you keep going ten years from now.",
                "product.card1.title": "Light Up Your City",
                "product.card1.text": "City heatmaps make consistency visible, turning scattered routes into a living memory.",
                "product.card2.title": "Reflect Every Run",
                "product.card2.text": "Workout notes and weekly journals keep the feeling of each block, not just the numbers.",
                "product.card3.title": "Train With Rhythm",
                "product.card3.text": "Import plans, link workouts, and follow the week without turning training into homework.",
                "product.card4.title": "Stay Close to the Run",
                "product.card4.text": "Apple Watch, widgets, weather, and gentle reminders keep the next step within reach.",
                "product.fig1": "Today · Run rhythm",
                "product.fig2": "Today · Training focus",
                "product.fig3": "Journey · City heatmap",
                "product.fig4": "History · Running journal",
                "product.fig5": "Plan · Weekly rhythm",
                "product.fig6": "Widget · Next run",
                "product.fig7": "Profile · Long-term record",
                "download.eyebrow": "Start Your Map",
                "download.title": "Run long enough, and the city starts to answer back.",
                "download.subtitle": "PacerMind remembers the routes, the notes, the plan, and the quiet reasons you came back.",
                "download.ctaPrimary": "Download PacerMind",
                "download.ctaSecondary": "Privacy Policy",
                "journey.updated": "Updated"
            },
            zh: {
                "hero.badge": "PacerMind 2.0",
                "hero.title": "点亮你的城市",
                "hero.subtitle": "这是我的 journey，那么你的呢？",
                "hero.body": "PacerMind 把多年的路线、笔记、计划和那些微小决定，变成一张还在生长的跑步地图。",
                "hero.ctaPrimary": "前往 App Store 下载",
                "hero.ctaSecondary": "了解更多",
                "hero.scroll": "下滑探索",
                "values.eyebrow": "核心价值",
                "values.title": "更好的训练计划 • AI 洞察引擎 • 本地隐私",
                "values.subtitle": "把你的跑步数据转化为清晰的前进路径。",
                "values.card1.title": "智能训练计划",
                "values.card1.text": "把数据转化为可执行的训练步骤，覆盖完整周期化结构。",
                "values.card2.title": "AI 洞察引擎",
                "values.card2.text": "洞察趋势与关键变化，给出智能解读。",
                "values.card3.title": "本地隐私优先",
                "values.card3.text": "隐私优先的本地分析设计。",
                "features.eyebrow": "功能亮点",
                "features.title": "从四个维度理解你的跑步",
                "features.subtitle": "智能分析、无缝同步、丰富历史与精确限制——每一个细节都是为了深思熟虑的跑者。",
                "features.card1.title": "AI 洞察引擎",
                "features.card1.text": "每次跑步后提供简明、可执行的反馈。",
                "features.card2.title": "智能训练计划",
                "features.card2.text": "基于目标、时间安排与能力动态生成周计划。",
                "features.card3.title": "多源同步",
                "features.card3.text": "无缝同步 Apple Health、Strava 与 Apple Watch。",
                "features.card4.title": "跑步周记",
                "features.card4.text": "每周训练回顾，帮助复盘、学习与提升。",
                "features.card5.title": "训练历史与趋势",
                "features.card5.text": "用日历与图表呈现训练趋势，让你的成长有据可循。",
                "features.card6.title": "每日洞察限额",
                "features.card6.text": "限制每日洞察数量，确保每条分析聚焦且高质量。",
                "product.eyebrow": "产品展示",
                "product.title": "运动中的每一步，都被理解在语境中。",
                "product.fig1": "首页 · 今日训练数据",
                "product.fig2": "Insight 页面 · AI 解读",
                "product.fig3": "历史页面 · 日历概览",
                "usecases.eyebrow": "使用场景",
                "usecases.title": "为每一类跑者量身打造",
                "usecases.subtitle": "适合目标导向跑者、习惯养成者、数据爱好者与 Apple Watch 深度用户。",
                "usecases.card1.title": "备赛目标跑者",
                "usecases.card1.text": "拆解训练周期与关键阶段，目标更清晰。",
                "usecases.card2.title": "习惯养成跑者",
                "usecases.card2.text": "用稳定的周结构建立训练节奏。",
                "usecases.card3.title": "技术派数据跑者",
                "usecases.card3.text": "关注趋势与指标，享受 AI 解读。",
                "usecases.card4.title": "Apple Watch 深度用户",
                "usecases.card4.text": "最大化手表实时配速与阶段提示价值。",
                "trust.title": "PacerMind 在 AI 功能前提供明确的隐私控制。",
                "trust.copy": "核心训练历史保留在应用内，AI 功能会在发送选定数据用于计划与洞察生成前先征得你的同意。",
                "trust.cta1": "查看隐私政策",
                "trust.cta2": "访问支持中心",
                "cta.title": "准备好读懂你的跑步了吗？",
                "cta.subtitle": "立即开启你的洞察之旅。",
                "cta.primary": "下载 PacerMind",
                "cta.secondary": "隐私政策",
                "hero.eyebrow": "PacerMind 2.0",
                "hero.title": "点亮你的城市",
                "hero.subtitle": "这是我的 journey，那么你的呢？",
                "hero.body": "PacerMind 把多年的路线、笔记、计划和那些微小决定，变成一张还在生长的跑步地图。",
                "hero.ctaPrimary": "前往 App Store 下载",
                "hero.ctaSecondary": "看看这段旅程",
                "hero.panelLabel": "最近点亮的城市",
                "hero.scroll": "下滑",
                "journey.eyebrow": "My Journey",
                "journey.title": "城市，是被普通日子慢慢点亮的。",
                "journey.subtitle": "不是每一次跑步都有突破。有些只是让地图稍微亮了一点。",
                "journey.stats.runs": "次跑步",
                "journey.stats.distance": "公里",
                "journey.stats.years": "年",
                "journey.stats.pace": "平均配速",
                "journey.stats.time": "总时间",
                "journey.recent": "最近 10 次跑步",
                "product.eyebrow": "PacerMind 2.0",
                "product.title": "一种不太一样的跑步 App。",
                "product.subtitle": "不只是让你更快，而是帮你在十年后还愿意继续跑。",
                "product.card1.title": "点亮你的城市",
                "product.card1.text": "城市热力图让坚持变得可见，把分散的路线变成持续生长的记忆。",
                "product.card2.title": "复盘每一次跑步",
                "product.card2.text": "跑步笔记和周记留下每个训练阶段的感受，而不只是数字。",
                "product.card3.title": "跟着节奏训练",
                "product.card3.text": "导入计划、关联训练、跟随每一周的安排，但不把跑步变成作业。",
                "product.card4.title": "让下一步更近一点",
                "product.card4.text": "Apple Watch、小组件、天气和温和提醒，让下一次出门更容易发生。",
                "product.fig1": "Today · 今日节奏",
                "product.fig2": "Today · 训练重点",
                "product.fig3": "Journey · 城市热力图",
                "product.fig4": "History · 跑步日志",
                "product.fig5": "Plan · 每周节奏",
                "product.fig6": "Widget · 下一次跑步",
                "product.fig7": "Profile · 长期记录",
                "download.eyebrow": "开始点亮你的地图",
                "download.title": "跑得足够久，城市会开始回应你。",
                "download.subtitle": "PacerMind 记得路线、笔记、计划，也记得你一次次回来的理由。",
                "download.ctaPrimary": "下载 PacerMind",
                "download.ctaSecondary": "隐私政策",
                "journey.updated": "更新于"
            }
        },
        privacy: {
            en: {
                "privacy.eyebrow": "Privacy Policy",
                "privacy.title": "Your run, your data, your mind.",
                "privacy.subtitle": "This policy explains what data PacerMind collects, how AI features use it, who receives it, and how you control consent.",
                "privacy.section1.title": "1. Data Controller",
                "privacy.section1.text": "PacerMind is developed and operated by Rainlonely Studio (“we”, “us”, “our”). For any privacy questions, contact <a href=\"mailto:rainlonely@me.com\">rainlonely@me.com</a>.",
                "privacy.section2.title": "2. Local-First App",
                "privacy.section2.text": "PacerMind is designed as a standalone app. Workout records, notes, plans, journals, route data, and generated history are stored locally on your device. We do not maintain user accounts, cloud profiles, or a PacerMind server database that receives or stores your personal running data.",
                "privacy.section3.title": "3. Data the App Accesses on Your Device",
                "privacy.section3.item1": "Workout and health metrics you authorize from Apple Health, such as distance, duration, pace, cadence, heart rate, route, and related training data.",
                "privacy.section3.item2": "Workout data you choose to import from Strava, if you connect Strava.",
                "privacy.section3.item3": "Notes, plans, preferences, and app settings you create inside PacerMind.",
                "privacy.section3.item4": "Basic device context, such as system language and app version, used to render the app and provide support.",
                "privacy.section3.text": "This access is performed by the PacerMind app installed on your device. Rainlonely Studio does not remotely access this data. The app uses it to provide local features, unless you choose to use an AI feature or connect a third-party service as described below.",
                "privacy.section4.title": "4. AI Features, Sharing, and Consent",
                "privacy.section4.text": "Some PacerMind features use third-party large language model providers to generate training feedback, summaries, plans, or insights. Currently, AI services in mainland China are provided through Qwen, and AI services outside mainland China are provided through OpenAI GPT models. When you use an AI feature, the necessary workout context, health and fitness metrics, derived training summaries, notes, or prompt content may be sent to Rainlonely Studio infrastructure and the relevant provider solely to generate the requested response. We request your permission in-app before this AI transfer occurs, and you can decline or revoke consent later in Settings.",
                "privacy.section4.extra": "We may change model providers, model versions, or routing logic from time to time, including for quality, reliability, availability, compliance, or cost reasons. These changes may occur without prior notice, but our purpose remains to provide the best practical feedback experience for users while applying the protections described in this policy.",
                "privacy.section5.title": "5. Strava Connection",
                "privacy.section5.text": "If you connect Strava, Strava authentication is handled by Strava. Workout data may pass through our relay interface only so it can be delivered from Strava to your device. We do not store Strava access data, workout data, route data, or imported training history on our servers after relay delivery.",
                "privacy.section6.title": "6. Data Storage & Retention",
                "privacy.section6.text": "Your PacerMind data is primarily stored locally in the app container on your device. For AI features, selected data may pass through Rainlonely Studio infrastructure only to relay and process your request to the relevant provider, but we do not describe that relay path as long-term storage of your workout history or profile data. Deleting the app deletes the local app data managed by iOS.",
                "privacy.section7.title": "7. User Controls",
                "privacy.section7.item1": "Revoke Apple Health permissions at any time in iOS Settings → Health → Data Access & Devices.",
                "privacy.section7.item2": "Disconnect Strava from PacerMind or revoke access from your Strava account settings.",
                "privacy.section7.item3": "Delete local app data by using in-app deletion controls where available or by deleting PacerMind from your device.",
                "privacy.section8.title": "8. Children’s Privacy",
                "privacy.section8.text": "PacerMind is intended for users aged 16 and above. We do not knowingly collect or process personal data from children under that age.",
                "privacy.section9.title": "9. Policy Updates",
                "privacy.section9.text": "We may update this policy as PacerMind changes. Material changes will be reflected on this page, together with the latest revision date below.",
                "privacy.lastUpdated": "Last updated: June 9, 2026"
            },
            zh: {
                "privacy.eyebrow": "隐私政策",
                "privacy.title": "你的跑步，你的数据，你的思维。",
                "privacy.subtitle": "本政策说明 PacerMind 收集哪些数据、AI 功能如何使用这些数据、数据会发送给谁，以及你如何控制授权。",
                "privacy.section1.title": "1. 数据控制者",
                "privacy.section1.text": "PacerMind 由 Rainlonely Studio（“我们”）开发与运营。如有隐私问题，请联系 <a href=\"mailto:rainlonely@me.com\">rainlonely@me.com</a>。",
                "privacy.section2.title": "2. 本地优先的应用",
                "privacy.section2.text": "PacerMind 按单机应用的方式设计。训练记录、笔记、计划、周记、路线数据和生成的历史内容均保存在你的设备本地。我们不维护用户账号、云端个人资料，也没有用于接收或存储你个人跑步数据的 PacerMind 服务器数据库。",
                "privacy.section3.title": "3. App 在你的设备上访问的数据",
                "privacy.section3.item1": "你授权从 Apple Health 读取的训练与健康指标，例如距离、时长、配速、步频、心率、路线以及相关训练数据。",
                "privacy.section3.item2": "如果你连接 Strava，我们会访问你选择导入的 Strava 训练数据。",
                "privacy.section3.item3": "你在 PacerMind 内创建的笔记、计划、偏好设置和应用设置。",
                "privacy.section3.item4": "用于界面展示和支持服务的基础设备上下文，例如系统语言和应用版本。",
                "privacy.section3.text": "这些访问由安装在你设备上的 PacerMind App 完成。Rainlonely Studio 不会远程访问这些数据。App 使用这些信息来提供本地功能；除非你选择使用 AI 功能或连接下文所述的第三方服务。",
                "privacy.section4.title": "4. AI 功能、数据共享与授权",
                "privacy.section4.text": "PacerMind 的部分功能会使用第三方大语言模型服务来生成训练反馈、总结、计划或洞察。目前，中国大陆地区的 AI 服务由 Qwen 提供，中国大陆以外地区的 AI 服务由 OpenAI GPT 模型提供。当你使用 AI 功能时，为生成你请求的结果，必要的训练上下文、健康与体能指标、衍生训练摘要、笔记或提示内容可能会发送给 Rainlonely Studio 的服务基础设施和相应模型服务商。发生这类 AI 数据传输前，我们会在应用内先征得你的许可；你可以拒绝，也可以之后在设置中撤销授权。",
                "privacy.section4.extra": "我们可能会根据反馈质量、稳定性、可用性、合规要求或成本等因素，不时调整模型服务商、模型版本或调用路由。这类调整可能不会提前通知用户，但目的始终是在适用本政策所述保护措施的前提下，为用户提供尽可能好的反馈体验。",
                "privacy.section5.title": "5. Strava 连接",
                "privacy.section5.text": "如果你连接 Strava，认证流程由 Strava 处理。训练数据可能仅通过我们的中转接口从 Strava 传递到你的设备。中转完成后，我们不会在服务器上存储 Strava 访问数据、训练数据、路线数据或导入的训练历史。",
                "privacy.section6.title": "6. 数据存储与保留",
                "privacy.section6.text": "你的 PacerMind 数据主要保存在设备本地的应用容器中。对于 AI 功能，选定数据可能仅为中转和处理你的请求而经过 Rainlonely Studio 的服务基础设施和相应模型服务商，但我们不将这一中转路径表述为对你的训练历史或个人资料进行长期存储。删除应用会删除由 iOS 管理的本地应用数据。",
                "privacy.section7.title": "7. 用户控制",
                "privacy.section7.item1": "你可以随时在 iOS 设置 → 健康 → 数据访问与设备 中撤销 Apple Health 权限。",
                "privacy.section7.item2": "你可以在 PacerMind 中断开 Strava，或在 Strava 账号设置中撤销授权。",
                "privacy.section7.item3": "你可以使用应用内可用的删除功能，或从设备中删除 PacerMind，以删除本地应用数据。",
                "privacy.section8.title": "8. 儿童隐私",
                "privacy.section8.text": "PacerMind 面向 16 岁及以上用户。我们不会有意收集或处理低于该年龄用户的个人数据。",
                "privacy.section9.title": "9. 政策更新",
                "privacy.section9.text": "我们可能会随着 PacerMind 的变化更新本政策。重大变更将体现在本页面，并以下方最新修订日期为准。",
                "privacy.lastUpdated": "最后更新：2026 年 6 月 9 日"
            }
        },
        support: {
            en: {
                "support.eyebrow": "Support Center",
                "support.title": "Talk to the maker of PacerMind.",
                "support.subtitle": "Choose any channel below to share feedback, ask questions, or follow product updates.",
                "support.channel.email.label": "Email",
                "support.channel.email.title": "Email the developer",
                "support.channel.xhs.label": "Xiaohongshu",
                "support.channel.xhs.title": "Training notes and updates",
                "support.channel.xhs.meta": "Follow Rain's running and product posts",
                "support.channel.discord.label": "Discord",
                "support.channel.discord.title": "Join the community",
                "support.channel.discord.meta": "Discuss training, plans, and product ideas",
                "support.channel.wechat.label": "WeChat",
                "support.channel.wechat.title": "Official account",
                "support.channel.wechat.meta": "Scan the QR code to follow"
            },
            zh: {
                "support.eyebrow": "支持中心",
                "support.title": "和 PacerMind 的开发者聊聊。",
                "support.subtitle": "你可以通过下面任意渠道反馈问题、提出想法，或关注产品更新。",
                "support.channel.email.label": "邮箱",
                "support.channel.email.title": "给开发者发邮件",
                "support.channel.xhs.label": "小红书",
                "support.channel.xhs.title": "训练分享与更新",
                "support.channel.xhs.meta": "看看 Rain 的跑步与产品记录",
                "support.channel.discord.label": "Discord",
                "support.channel.discord.title": "加入社区",
                "support.channel.discord.meta": "讨论训练、计划和产品想法",
                "support.channel.wechat.label": "微信公众号",
                "support.channel.wechat.title": "雨哥在吗",
                "support.channel.wechat.meta": "微信扫码关注公众号"
            }
        }
    };

    const page = document.body.dataset.page || "home";
    const languageButtons = document.querySelectorAll("[data-lang-btn]");
    const supportedLanguages = ["en", "zh"];
    const FALLBACK_JOURNEY = {
        updatedAt: "2026-06-08T00:00:00+08:00",
        stats: { runs: 3854, distanceKm: 18200, years: 12 },
        hero: { city: "Shanghai", latestRunId: "run-001" },
        runs: [
            {
                id: "run-001",
                date: "2026-05-31",
                title: "Easy Run",
                type: "easy",
                distanceKm: 10.7,
                duration: "1:05:10",
                avgPace: "6'06\"",
                note: "今天没有追配速，只是想吹吹风。",
                coordinates: [[31.2262, 121.4758], [31.2315, 121.4879], [31.2413, 121.4882], [31.2392, 121.4777], [31.2262, 121.4758]]
            },
            {
                id: "run-002",
                date: "2026-05-29",
                title: "Tempo Run",
                type: "tempo",
                distanceKm: 8.4,
                duration: "43:18",
                avgPace: "5'09\"",
                note: "前半段有点顶，后半段终于找回节奏。",
                coordinates: [[31.2200, 121.4652], [31.2288, 121.4766], [31.2380, 121.4868], [31.2421, 121.4922]]
            },
            {
                id: "run-003",
                date: "2026-05-27",
                title: "Recovery Run",
                type: "recovery",
                distanceKm: 6.1,
                duration: "39:44",
                avgPace: "6'31\"",
                note: "今天只想慢慢跑，让腿自己醒过来。",
                coordinates: [[31.2450, 121.4710], [31.2370, 121.4741], [31.2303, 121.4691], [31.2282, 121.4644]]
            }
        ]
    };
    let currentJourney = null;
    let mapboxLoadPromise = null;

    const applyLanguage = lang => {
        const merged = Object.assign(
            {},
            TRANSLATIONS.shared?.[lang] || {},
            TRANSLATIONS[page]?.[lang] || {}
        );

        document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            const translation = merged[key];
            if (translation) {
                el.innerHTML = translation;
            }
        });

        languageButtons.forEach(btn => {
            const isActive = btn.dataset.lang === lang;
            btn.classList.toggle("is-active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });

        updateJourneyLocale(lang);
    };

    const formatNumber = value => {
        return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(value) || 0);
    };

    const formatTotalTimeLabel = value => {
        const parts = String(value || "").split(":").map(part => Number(part));
        if (parts.length < 2 || parts.some(part => !Number.isFinite(part))) {
            return value || "--";
        }
        const hours = parts[0];
        const minutes = parts[1];
        return `${formatNumber(hours)}h ${String(minutes).padStart(2, "0")}m`;
    };

    const formatRunDate = (dateString, lang, options = { month: "short", day: "numeric" }) => {
        const date = new Date(`${dateString}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return dateString || "";
        }
        return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", options).format(date);
    };

    const validRuns = data => {
        return Array.isArray(data?.runs) ? data.runs.filter(run => Array.isArray(run.coordinates)) : [];
    };

    const allCoordinates = runs => {
        return runs.flatMap(run => run.coordinates || []).filter(point => {
            return Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]);
        });
    };

    const makeProjection = runs => {
        const points = allCoordinates(runs);
        if (!points.length) {
            return () => ({ x: 500, y: 340 });
        }

        const lats = points.map(point => point[0]);
        const lons = points.map(point => point[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const latSpan = maxLat - minLat || 0.01;
        const lonSpan = maxLon - minLon || 0.01;
        const pad = 88;
        const width = 1000 - pad * 2;
        const height = 680 - pad * 2;

        return point => ({
            x: pad + ((point[1] - minLon) / lonSpan) * width,
            y: pad + ((maxLat - point[0]) / latSpan) * height
        });
    };

    const pathFromCoordinates = (coordinates, project) => {
        const points = coordinates.filter(point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
        if (points.length < 2) {
            return "";
        }
        return points.map((point, index) => {
            const projected = project(point);
            return `${index === 0 ? "M" : "L"} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`;
        }).join(" ");
    };

    const svgNode = (tag, attributes = {}) => {
        const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attributes).forEach(([key, value]) => {
            node.setAttribute(key, value);
        });
        return node;
    };

    const drawBaseMap = svg => {
        const baseLayer = svgNode("g", { class: "base-map-layer", "aria-hidden": "true" });
        const water = svgNode("path", {
            class: "water-shape",
            d: "M 705 -20 C 725 70 706 140 748 210 C 804 303 920 342 1016 392 L 1016 710 L 808 710 C 765 602 734 522 646 462 C 560 403 503 347 505 263 C 507 152 604 106 650 -20 Z"
        });
        const park = svgNode("path", {
            class: "park-shape",
            d: "M 78 448 C 150 402 236 398 302 443 C 360 483 367 565 308 613 C 246 664 129 666 67 612 C 18 570 25 482 78 448 Z"
        });
        baseLayer.append(water, park);

        [
            "M 72 488 C 204 438 334 373 487 302 C 607 247 735 196 922 130",
            "M 112 246 C 258 279 382 313 516 360 C 656 409 759 463 914 556",
            "M 286 86 C 330 190 363 289 398 392 C 430 486 470 568 524 650",
            "M 620 80 C 578 190 550 300 523 423 C 506 505 501 584 518 666",
            "M 136 612 C 244 570 357 526 487 468 C 626 407 750 360 890 320"
        ].forEach(d => baseLayer.appendChild(svgNode("path", { class: "base-road-major", d })));

        [
            "M 118 140 L 866 140",
            "M 94 208 L 760 250 L 934 276",
            "M 72 322 L 270 306 L 508 318 L 916 388",
            "M 90 408 L 340 380 L 602 392 L 948 458",
            "M 150 532 L 408 512 L 680 548 L 930 632",
            "M 178 76 L 222 660",
            "M 338 58 L 338 656",
            "M 462 80 L 438 660",
            "M 728 74 L 668 660",
            "M 848 104 L 780 638",
            "M 84 182 C 238 220 384 228 532 200 C 646 178 755 174 928 214",
            "M 114 584 C 260 506 378 456 510 448 C 650 438 776 493 938 582"
        ].forEach(d => baseLayer.appendChild(svgNode("path", { class: "base-road", d })));

        [
            "M 128 356 C 280 296 452 270 632 294 C 756 310 858 348 948 414",
            "M 182 96 C 265 198 344 270 440 316 C 550 369 646 414 738 522"
        ].forEach(d => baseLayer.appendChild(svgNode("path", { class: "base-road-ring", d })));

        [
            { text: "HUAIHAI ROAD", x: 126, y: 225, rotate: 4, className: "base-label" },
            { text: "XINHUA ROAD", x: 296, y: 118, rotate: -8, className: "base-label-small" },
            { text: "SOUTH SHAANXI", x: 602, y: 364, rotate: 15, className: "base-label-small" },
            { text: "RIVERSIDE", x: 776, y: 512, rotate: 32, className: "base-label" },
            { text: "MEDIA PARK", x: 118, y: 590, rotate: -10, className: "base-label-small" }
        ].forEach(label => {
            const text = svgNode("text", {
                class: label.className,
                x: label.x,
                y: label.y,
                transform: `rotate(${label.rotate} ${label.x} ${label.y})`
            });
            text.textContent = label.text;
            baseLayer.appendChild(text);
        });

        svg.appendChild(baseLayer);
    };

    const routeAnchor = (coordinates, project) => {
        const points = coordinates.filter(point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
        const source = points[Math.max(0, Math.floor(points.length * 0.55) - 1)] || points[0] || [31.23, 121.47];
        const projected = project(source);
        return {
            left: `${Math.min(82, Math.max(12, projected.x / 10))}%`,
            top: `${Math.min(72, Math.max(16, projected.y / 6.8))}%`
        };
    };

    const drawMap = (svg, runs, options = {}) => {
        if (!svg) {
            return;
        }

        svg.innerHTML = "";
        drawBaseMap(svg);
        const project = makeProjection(runs);
        const drawable = runs
            .map((run, index) => ({ run, index, path: pathFromCoordinates(run.coordinates || [], project) }))
            .filter(item => item.path);

        if (!drawable.length) {
            const empty = document.createElementNS("http://www.w3.org/2000/svg", "path");
            empty.setAttribute("class", "route-line");
            empty.setAttribute("d", "M 210 350 L 310 310 L 430 330 L 520 260 L 650 300 L 780 220");
            svg.appendChild(empty);
            return;
        }

        drawable.forEach(({ run, index, path }) => {
            const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
            shadow.setAttribute("class", `route-shadow${options.animated ? " is-animated" : ""}`);
            shadow.setAttribute("d", path);
            shadow.style.setProperty("--route-delay", `${index * 1.45}s`);
            svg.appendChild(shadow);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            line.setAttribute("class", `route-line${options.animated ? " is-animated" : ""}`);
            line.setAttribute("d", path);
            line.dataset.routeId = run.id || "";
            line.style.setProperty("--route-delay", `${index * 1.45}s`);
            svg.appendChild(line);

            let length = 900;
            try {
                length = Math.ceil(line.getTotalLength());
            } catch {
                length = 900;
            }
            line.style.setProperty("--route-length", length);
            shadow.style.setProperty("--route-length", length);

            const last = (run.coordinates || []).filter(point => Array.isArray(point)).at(-1);
            if (last) {
                const dotPoint = project(last);
                const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                dot.setAttribute("class", "route-dot");
                dot.setAttribute("cx", dotPoint.x.toFixed(1));
                dot.setAttribute("cy", dotPoint.y.toFixed(1));
                dot.setAttribute("r", options.animated ? "4.8" : "3.4");
                svg.appendChild(dot);
            }
        });

        return project;
    };

    const renderBubbles = (container, runs, project) => {
        if (!container || !project) {
            return;
        }

        container.innerHTML = "";
        runs.filter(run => run.note && (run.coordinates || []).length >= 2).slice(0, 5).forEach((run, index) => {
            const bubble = document.createElement("div");
            const anchor = routeAnchor(run.coordinates, project);
            bubble.className = "memory-bubble";
            bubble.style.left = anchor.left;
            bubble.style.top = anchor.top;
            bubble.style.setProperty("--note-delay", `${index * 3.6}s`);
            bubble.innerHTML = `<strong>${formatRunDate(run.date, savedLanguage, { month: "short", day: "numeric" })} · ${run.title || "Run"}</strong><span>${run.note}</span>`;
            container.appendChild(bubble);
        });
    };

    const renderRunList = (runs, lang) => {
        const list = document.querySelector("[data-run-list]");
        if (!list) {
            return;
        }

        list.innerHTML = "";
        const items = runs.slice(0, 10);
        if (!items.length) {
            const empty = document.createElement("article");
            empty.className = "run-item";
            empty.innerHTML = `<h3>${lang === "zh" ? "还没有可展示的跑步" : "No runs yet"}</h3><p>${lang === "zh" ? "导出 journey.json 后，这里会自动显示最近的路线与笔记。" : "Export journey.json and recent routes will appear here automatically."}</p>`;
            list.appendChild(empty);
            return;
        }

        items.forEach(run => {
            const item = document.createElement("article");
            item.className = "run-item";
            item.innerHTML = `
                <div>
                    <h3>${formatRunDate(run.date, lang)} · ${run.title || "Run"}</h3>
                    <div class="run-meta">
                        <span>${run.duration || "--"}</span>
                        <span>${run.avgPace || "--"}</span>
                        <span>${run.type || "run"}</span>
                    </div>
                </div>
                <strong class="run-distance">${Number(run.distanceKm || 0).toFixed(1)} km</strong>
                <p>${run.note || (lang === "zh" ? "这次跑步没有留下笔记。" : "No note for this run.")}</p>
            `;
            list.appendChild(item);
        });
    };

    const updateJourneyLocale = lang => {
        if (!currentJourney || page !== "home") {
            return;
        }
        const updatedEl = document.querySelector("[data-updated-at]");
        if (updatedEl) {
            const label = lang === "zh" ? "更新于" : "Updated";
            const formatted = formatRunDate(currentJourney.updatedAt?.slice(0, 10), lang, { year: "numeric", month: "short", day: "numeric" });
            updatedEl.textContent = `${label} ${formatted}`;
        }
        renderRunList(validRuns(currentJourney), lang);
    };

    const hydrateJourney = data => {
        if (page !== "home") {
            return;
        }

        const runs = validRuns(data);
        currentJourney = Object.assign({}, FALLBACK_JOURNEY, data, { runs });
        const latest = runs.find(run => run.id === data?.hero?.latestRunId) || runs[0] || FALLBACK_JOURNEY.runs[0];

        const statRuns = document.querySelector("[data-stat-runs]");
        const statDistance = document.querySelector("[data-stat-distance]");
        const statYears = document.querySelector("[data-stat-years]");
        const statPace = document.querySelector("[data-stat-pace]");
        const statTime = document.querySelector("[data-stat-time]");
        if (statRuns) statRuns.textContent = formatNumber(currentJourney.stats?.runs);
        if (statDistance) statDistance.textContent = formatNumber(currentJourney.stats?.distanceKm);
        if (statYears) statYears.textContent = formatNumber(currentJourney.stats?.years);
        if (statPace) statPace.textContent = currentJourney.stats?.avgPace || "--";
        if (statTime) statTime.textContent = formatTotalTimeLabel(currentJourney.stats?.totalTime);

        const heroCity = document.querySelector("[data-hero-city]");
        const latestDate = document.querySelector("[data-latest-date]");
        const latestDistance = document.querySelector("[data-latest-distance]");
        const latestTitle = document.querySelector("[data-latest-title]");
        const latestNote = document.querySelector("[data-latest-note]");
        if (heroCity) heroCity.textContent = currentJourney.hero?.city || "Shanghai";
        if (latestDate) latestDate.textContent = formatRunDate(latest.date, savedLanguage);
        if (latestDistance) latestDistance.textContent = `${Number(latest.distanceKm || 0).toFixed(1)} km`;
        if (latestTitle) latestTitle.textContent = latest.title || "Run";
        if (latestNote) latestNote.textContent = latest.note || "";

        const recentRoutes = runs.filter(run => (run.coordinates || []).length >= 2).slice(0, 10);
        const heroProject = drawMap(document.querySelector("[data-hero-map]"), recentRoutes.length ? recentRoutes : runs.slice(0, 10), { animated: true });
        drawMap(document.querySelector("[data-journey-map]"), runs, { animated: false });
        renderBubbles(document.querySelector("[data-memory-bubbles]"), recentRoutes.length ? recentRoutes : runs, heroProject);
        updateJourneyLocale(savedLanguage);
        initMapboxMaps(currentJourney);
    };

    const loadMapboxLibrary = () => {
        if (window.mapboxgl) {
            return Promise.resolve(window.mapboxgl);
        }
        if (mapboxLoadPromise) {
            return mapboxLoadPromise;
        }

        mapboxLoadPromise = new Promise((resolve, reject) => {
            const cssHref = "https://api.mapbox.com/mapbox-gl-js/v3.24.0/mapbox-gl.css";
            if (!document.querySelector(`link[href="${cssHref}"]`)) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = cssHref;
                document.head.appendChild(link);
            }

            const script = document.createElement("script");
            script.src = "https://api.mapbox.com/mapbox-gl-js/v3.24.0/mapbox-gl.js";
            script.async = true;
            script.onload = () => resolve(window.mapboxgl);
            script.onerror = () => reject(new Error("Mapbox GL JS failed to load"));
            document.head.appendChild(script);
        });

        return mapboxLoadPromise;
    };

    const loadMapboxConfig = async () => {
        try {
            const response = await fetch("assets/data/mapbox-config.json", { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Mapbox config failed: ${response.status}`);
            }
            return await response.json();
        } catch {
            return null;
        }
    };

    const routeCoordinateSystem = () => (window.pacermindRouteCoordinateSystem === "gcj02" ? "gcj02" : "wgs84");

    const runCoordinates = run => {
        if (!run) {
            return [];
        }
        if (routeCoordinateSystem() === "gcj02" && Array.isArray(run.coordinatesGcj02)) {
            return run.coordinatesGcj02;
        }
        return run.coordinates || [];
    };

    const journeyToGeoJSON = runs => ({
        type: "FeatureCollection",
        features: runs
            .filter(run => Array.isArray(runCoordinates(run)) && runCoordinates(run).length >= 2)
            .map(run => ({
                type: "Feature",
                properties: {
                    id: run.id,
                    title: run.title || "Run",
                    type: run.type || "run",
                    date: run.date || "",
                    note: run.note || "",
                    distanceKm: Number(run.distanceKm || 0)
                },
                geometry: {
                    type: "LineString",
                    coordinates: runCoordinates(run)
                        .filter(point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]))
                        .map(point => [point[1], point[0]])
                }
            }))
    });

    const boundsForRuns = runs => {
        const coordinates = runs
            .flatMap(run => runCoordinates(run))
            .filter(point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]))
            .map(point => [point[1], point[0]]);
        if (!coordinates.length || !window.mapboxgl) {
            return null;
        }
        const bounds = new window.mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
        coordinates.forEach(coord => bounds.extend(coord));
        return bounds;
    };

    const boundsFromConfig = value => {
        if (!Array.isArray(value) || value.length !== 4 || !window.mapboxgl) {
            return null;
        }
        const [west, south, east, north] = value.map(Number);
        if (![west, south, east, north].every(Number.isFinite)) {
            return null;
        }
        return new window.mapboxgl.LngLatBounds([west, south], [east, north]);
    };

    const runOverlapsBounds = (run, boundsValue) => {
        if (!Array.isArray(boundsValue) || boundsValue.length !== 4) {
            return true;
        }
        const [west, south, east, north] = boundsValue.map(Number);
        if (![west, south, east, north].every(Number.isFinite)) {
            return true;
        }
        return runCoordinates(run).some(point => {
            if (!Array.isArray(point)) {
                return false;
            }
            const [lat, lon] = point;
            return lat >= south && lat <= north && lon >= west && lon <= east;
        });
    };

    const fitMapToRuns = (map, runs, options = {}) => {
        const bounds = boundsForRuns(runs);
        if (!bounds) {
            return;
        }
        const padding = options.padding ?? 96;
        map.fitBounds(bounds, {
            padding,
            duration: options.duration ?? 0,
            bearing: Number(options.bearing || 0),
            pitch: Number(options.pitch || 0),
            essential: true
        });
    };

    const singleRunGeoJSON = (run, coordinates = null) => ({
        type: "FeatureCollection",
        features: run ? [{
            type: "Feature",
            properties: {
                id: run.id,
                title: run.title || "Run",
                type: run.type || "run",
                date: run.date || "",
                note: run.note || "",
                distanceKm: Number(run.distanceKm || 0)
            },
            geometry: {
                type: "LineString",
                coordinates: coordinates || runCoordinates(run)
                    .filter(point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]))
                    .map(point => [point[1], point[0]])
            }
        }] : []
    });

    const runLngLatCoordinates = run => runCoordinates(run)
        .filter(point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]))
        .map(point => [point[1], point[0]]);

    const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const escapeHTML = value => String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const staticStylePath = style => {
        const normalized = String(style || "mapbox://styles/mapbox/streets-v12");
        return normalized.replace("mapbox://styles/", "");
    };

    const prefersDarkMode = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

    const mapStyleForScheme = config => {
        if (prefersDarkMode()) {
            return config.darkStyle || "mapbox://styles/mapbox/dark-v11";
        }
        return config.style || "mapbox://styles/mapbox/streets-v12";
    };

    const staticMapUrl = ({ stylePath, token, center, zoom, bearing, pitch }) => {
        const encodedToken = encodeURIComponent(token);
        return `https://api.mapbox.com/styles/v1/${stylePath}/static/${center[0]},${center[1]},${zoom},${bearing},${pitch}/1280x840@2x?access_token=${encodedToken}`;
    };

    const setStaticMapBackgrounds = (containers, config, data) => {
        const token = config?.accessToken?.trim();
        if (!token) {
            return;
        }

        const stylePath = staticStylePath(mapStyleForScheme(config));
        const center = Array.isArray(config.center) ? config.center : [121.48, 31.235];
        const zoom = Number(config.zoom || 12);
        const bearing = Number(config.bearing || 0);
        const pitch = Number(config.pitch || 0);
        const defaultStaticUrl = staticMapUrl({ stylePath, token, center, zoom, bearing, pitch });

        containers.forEach(container => {
            container.style.backgroundImage = `url("${defaultStaticUrl}")`;
            container.closest(".map-stage, .journey-map")?.classList.add("has-static-map");
        });
    };

    const positionHeroNote = ({ note, map, run }) => {
        const coordinates = runLngLatCoordinates(run);
        if (!note || coordinates.length < 2) {
            return;
        }
        const anchor = coordinates[Math.max(0, Math.floor(coordinates.length * 0.58) - 1)];
        const point = map.project(anchor);
        const container = map.getContainer();
        const desktop = window.innerWidth >= 760;
        const left = desktop
            ? Math.min(container.clientWidth - 360, Math.max(560, point.x + 24))
            : Math.min(container.clientWidth - 296, Math.max(24, point.x + 16));
        const top = Math.min(container.clientHeight - 84, Math.max(desktop ? 320 : 260, point.y));
        note.style.left = `${left}px`;
        note.style.top = `${top}px`;
    };

    const updateHeroNote = ({ note, map, run }) => {
        if (!note || !run) {
            return;
        }
        note.classList.remove("is-visible");
        const noteText = run.note || "";
        note.innerHTML = `<strong>${escapeHTML(formatRunDate(run.date, savedLanguage, { month: "short", day: "numeric" }))} · ${escapeHTML(run.title || "Run")}</strong><span>${escapeHTML(noteText)}</span>`;
        positionHeroNote({ note, map, run });
        window.setTimeout(() => {
            positionHeroNote({ note, map, run });
            note.classList.add("is-visible");
        }, 900);
    };

    const playHeroRoutes = ({ map, runs, sourceId, config, note }) => {
        const routeRuns = runs.filter(run => runLngLatCoordinates(run).length >= 2).slice(0, 10);
        const source = map.getSource(sourceId);
        if (!routeRuns.length || !source) {
            return;
        }

        const showRoute = (routeIndex, immediate = false) => {
            const run = routeRuns[routeIndex % routeRuns.length];
            const coordinates = runLngLatCoordinates(run);
            if (coordinates.length < 2) {
                return;
            }

            fitMapToRuns(map, [run], {
                padding: {
                    top: 128,
                    bottom: 132,
                    left: window.innerWidth < 760 ? 56 : 420,
                    right: window.innerWidth < 760 ? 56 : 120
                },
                duration: immediate || prefersReducedMotion() ? 0 : 3600,
                bearing: Number(config.bearing || 0),
                pitch: Number(config.pitch || 0)
            });

            if (prefersReducedMotion()) {
                source.setData(singleRunGeoJSON(run, coordinates));
                return;
            }

            const drawDuration = 10000;
            const mapMoveDelay = immediate ? 600 : 2400;
            const draw = start => now => {
                const progress = Math.min(1, (now - start) / drawDuration);
                const count = Math.max(2, Math.ceil(progress * coordinates.length));
                source.setData(singleRunGeoJSON(run, coordinates.slice(0, count)));
                positionHeroNote({ note, map, run });
                if (progress >= 0.86) {
                    note?.classList.remove("is-visible");
                }
                if (progress < 1) {
                    requestAnimationFrame(draw(start));
                    return;
                }
                window.setTimeout(() => showRoute((routeIndex + 1) % routeRuns.length), 3600);
            };

            source.setData(singleRunGeoJSON(run, coordinates.slice(0, 2)));
            note?.classList.remove("is-visible");
            window.setTimeout(() => {
                updateHeroNote({ note, map, run });
                requestAnimationFrame(now => draw(now)(now));
            }, mapMoveDelay);
        };

        showRoute(0, true);
    };

    const createMapboxMap = ({ container, config, runs, latestRun, interactive }) => {
        const isHero = container.dataset.mapboxMap === "hero";
        const map = new window.mapboxgl.Map({
            accessToken: config.accessToken,
            container,
            style: mapStyleForScheme(config),
            center: config.center || [121.48, 31.235],
            zoom: Number(config.zoom || 12),
            bearing: Number(config.bearing || 0),
            pitch: Number(config.pitch || 0),
            interactive,
            attributionControl: true
        });

        window.pacermindMaps = window.pacermindMaps || {};
        window.pacermindMaps[isHero ? "hero" : "journey"] = map;

        if (interactive) {
            map.addControl(new window.mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
        }

        map.on("load", () => {
            const routeRuns = runs.filter(run => runCoordinates(run).length >= 2);

            if (isHero) {
                const firstRun = latestRun || routeRuns[0];
                const note = document.querySelector("[data-memory-bubbles]");
                if (note) {
                    note.innerHTML = `<div class="hero-live-note" data-hero-live-note></div>`;
                }
                const liveNote = document.querySelector("[data-hero-live-note]");
                map.addSource("pacermind-hero-route", {
                    type: "geojson",
                    data: singleRunGeoJSON(firstRun, runLngLatCoordinates(firstRun).slice(0, 2))
                });

                map.addLayer({
                    id: "pacermind-hero-route-glow",
                    type: "line",
                    source: "pacermind-hero-route",
                    paint: {
                        "line-color": "#ff6a22",
                        "line-width": 18,
                        "line-opacity": 0.28,
                        "line-blur": 6
                    }
                });
                map.addLayer({
                    id: "pacermind-hero-route",
                    type: "line",
                    source: "pacermind-hero-route",
                    paint: {
                        "line-color": "#ff6a22",
                        "line-width": 5.4,
                        "line-opacity": 0.96
                    }
                });

                fitMapToRuns(map, firstRun ? [firstRun] : routeRuns.slice(0, 1), {
                    padding: {
                        top: 128,
                        bottom: 132,
                        left: window.innerWidth < 760 ? 56 : 420,
                        right: window.innerWidth < 760 ? 56 : 120
                    },
                    bearing: Number(config.bearing || 0),
                    pitch: Number(config.pitch || 0)
                });

                container.style.backgroundImage = "";
                container.closest(".map-stage, .journey-map")?.classList.add("has-live-map");
                playHeroRoutes({ map, runs: routeRuns, sourceId: "pacermind-hero-route", config, note: liveNote });
                return;
            }

            const journeyRouteRuns = routeRuns.filter(run => runOverlapsBounds(run, config.journeyBounds));
            const visibleRouteRuns = journeyRouteRuns.length ? journeyRouteRuns : routeRuns;
            const sourceData = journeyToGeoJSON(visibleRouteRuns);
            const visibleLatestRun = latestRun && runOverlapsBounds(latestRun, config.journeyBounds) ? latestRun : visibleRouteRuns[0];
            const latestData = journeyToGeoJSON(visibleLatestRun ? [visibleLatestRun] : visibleRouteRuns.slice(0, 1));

            map.addSource("pacermind-routes", { type: "geojson", data: sourceData });
            map.addSource("pacermind-latest-route", { type: "geojson", data: latestData });

            map.addLayer({
                id: "pacermind-routes-glow",
                type: "line",
                source: "pacermind-routes",
                paint: {
                    "line-color": "#ff6a22",
                    "line-width": 10,
                    "line-opacity": 0.18,
                    "line-blur": 4
                }
            });
            map.addLayer({
                id: "pacermind-routes",
                type: "line",
                source: "pacermind-routes",
                paint: {
                    "line-color": "#ff6a22",
                    "line-width": 3.2,
                    "line-opacity": 0.62
                }
            });
            map.addLayer({
                id: "pacermind-latest-route-glow",
                type: "line",
                source: "pacermind-latest-route",
                paint: {
                    "line-color": "#ff6a22",
                    "line-width": 16,
                    "line-opacity": 0.28,
                    "line-blur": 5
                }
            });
            map.addLayer({
                id: "pacermind-latest-route",
                type: "line",
                source: "pacermind-latest-route",
                paint: {
                    "line-color": "#ff6a22",
                    "line-width": 5,
                    "line-opacity": 0.95
                }
            });

            const configuredBounds = boundsFromConfig(config.journeyBounds);
            if (configuredBounds) {
                map.fitBounds(configuredBounds, {
                    padding: interactive ? 48 : 64,
                    duration: 0,
                    bearing: Number(config.bearing || 0),
                    pitch: Number(config.pitch || 0),
                    essential: true
                });
            } else {
                fitMapToRuns(map, visibleRouteRuns, {
                    padding: interactive ? 64 : 96,
                    bearing: Number(config.bearing || 0),
                    pitch: Number(config.pitch || 0)
                });
            }

            container.closest(".map-stage, .journey-map")?.classList.add("has-live-map");
        });

        map.on("error", event => {
            if (event?.error) {
                console.warn("PacerMind Mapbox fallback:", event.error.message);
            }
        });

        return map;
    };

    const initMapboxMaps = async data => {
        const containers = document.querySelectorAll("[data-mapbox-map]");
        if (!containers.length) {
            return;
        }

        const config = await loadMapboxConfig();
        const token = config?.accessToken?.trim();
        if (!token || token.includes("your_mapbox_public_token_here")) {
            return;
        }

        window.pacermindRouteCoordinateSystem = config.routeCoordinateSystem === "gcj02" ? "gcj02" : "wgs84";
        setStaticMapBackgrounds(containers, config, data);

        try {
            await loadMapboxLibrary();
            const runs = validRuns(data).filter(run => runCoordinates(run).length >= 2);
            const latest = runs.find(run => run.id === data?.hero?.latestRunId) || runs[0];
            containers.forEach(container => {
                if (container.dataset.mapboxReady === "true") {
                    return;
                }
                container.dataset.mapboxReady = "true";
                createMapboxMap({
                    container,
                    config,
                    runs,
                    latestRun: latest,
                    interactive: container.dataset.mapboxMap === "journey" && config.interactiveJourneyMap !== false
                });
            });
        } catch (error) {
            console.warn("PacerMind Mapbox fallback:", error.message);
        }
    };

    const loadJourney = async () => {
        if (page !== "home") {
            return;
        }

        try {
            const journeyUrl = new URL("assets/data/journey.json", window.location.href);
            journeyUrl.searchParams.set("v", Date.now().toString());
            const response = await fetch(journeyUrl, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Journey data failed: ${response.status}`);
            }
            const data = await response.json();
            hydrateJourney(data);
        } catch {
            hydrateJourney(FALLBACK_JOURNEY);
        }
    };

    let savedLanguage = localStorage.getItem("pacermind-lang");
    if (!supportedLanguages.includes(savedLanguage)) {
        savedLanguage = "en";
    }

    applyLanguage(savedLanguage);

    languageButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const lang = btn.dataset.lang;
            if (!supportedLanguages.includes(lang) || lang === savedLanguage) {
                return;
            }
            savedLanguage = lang;
            localStorage.setItem("pacermind-lang", lang);
            applyLanguage(lang);
        });
    });

    loadJourney();
});
