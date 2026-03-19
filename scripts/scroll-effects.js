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
                "nav.features": "Features",
                "nav.product": "Product",
                "nav.privacy": "Privacy",
                "nav.support": "Support",
                "footer.privacy": "Privacy Policy",
                "footer.support": "Support"
            },
            zh: {
                "nav.home": "首页",
                "nav.features": "功能亮点",
                "nav.product": "产品展示",
                "nav.privacy": "隐私",
                "nav.support": "支持",
                "footer.privacy": "隐私政策",
                "footer.support": "支持"
            }
        },
        home: {
            en: {
                "hero.badge": "New • AI Run Insight",
                "hero.title": "Pacermind",
                "hero.subtitle": "Run Smarter. Train Intelligently. Understand Every Run.",
                "hero.body": "Every run tells a story — Pacermind decodes your pace, cadence, and heart rate into meaningful strides.",
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
                "trust.title": "Pacermind puts privacy controls in front of AI features.",
                "trust.copy": "Core workout history stays in your app, and AI features ask permission before sending selected data for plan and insight generation.",
                "trust.cta1": "Read Privacy Policy",
                "trust.cta2": "Visit Support",
                "cta.title": "Ready to understand your run?",
                "cta.subtitle": "Start your journey of insight today.",
                "cta.primary": "Download Pacermind",
                "cta.secondary": "Privacy Policy"
            },
            zh: {
                "hero.badge": "全新 • AI 跑步洞察",
                "hero.title": "Pacermind",
                "hero.subtitle": "跑得更聪明，训练更智能，读懂每一次跑步。",
                "hero.body": "每一次跑步都有故事——Pacermind 将配速、步频与心率解码为有意义的步伐。",
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
                "trust.title": "Pacermind 在 AI 功能前提供明确的隐私控制。",
                "trust.copy": "核心训练历史保留在应用内，AI 功能会在发送选定数据用于计划与洞察生成前先征得你的同意。",
                "trust.cta1": "查看隐私政策",
                "trust.cta2": "访问支持中心",
                "cta.title": "准备好读懂你的跑步了吗？",
                "cta.subtitle": "立即开启你的洞察之旅。",
                "cta.primary": "下载 Pacermind",
                "cta.secondary": "隐私政策"
            }
        },
        privacy: {
            en: {
                "privacy.eyebrow": "Privacy Policy",
                "privacy.title": "Your run, your data, your mind.",
                "privacy.subtitle": "This policy explains what data Pacermind collects, how AI features use it, who receives it, and how you control consent.",
                "privacy.section1.title": "1. Data Controller",
                "privacy.section1.text": "Pacermind is developed and operated by Rainlonely Studio (“we”, “us”, “our”). For any privacy questions, contact <a href=\"mailto:rainlonely@me.com\">rainlonely@me.com</a>.",
                "privacy.section2.title": "2. Data We Collect and Access",
                "privacy.section2.item1": "Workout and health/fitness data you authorize from Apple Health, such as distance, duration, pace, cadence, heart rate, splits, and related workout metadata.",
                "privacy.section2.item2": "Workout metadata and activity details you choose to sync from Strava, if connected.",
                "privacy.section2.item3": "Profile and training inputs you enter in the app, such as goals, race information, weekly availability, notes, and training preferences.",
                "privacy.section2.item4": "Technical and app settings data necessary to provide the service, such as app language, consent version, and device/app environment details relevant to rendering and requests.",
                "privacy.section2.text": "We may also infer training summaries from the data above, such as weekly load, execution quality, and AI-ready workout context. Pacermind does not require your real name to use the app.",
                "privacy.section3.title": "3. How We Collect Data",
                "privacy.section3.item1": "Directly from you when you enter profile details, goals, notes, and plan preferences.",
                "privacy.section3.item2": "From Apple Health and Strava only after you choose to connect or authorize those sources.",
                "privacy.section3.item3": "Automatically from app usage and device context when needed to render features, persist settings, and process requests securely.",
                "privacy.section4.title": "4. How We Use Data",
                "privacy.section4.item1": "To import, display, and organize your workouts, plans, journals, and history.",
                "privacy.section4.item2": "To generate AI-assisted training plans, workout insights, weekly journal insights, and coach continuation flows.",
                "privacy.section4.item3": "To maintain app settings, consent records, subscriptions, debugging, and service reliability.",
                "privacy.section5.title": "5. AI Features, Sharing, and Consent",
                "privacy.section5.text": "Certain AI features send selected workout-related data, health/fitness metrics, derived training summaries, and your text inputs to Rainlonely Studio’s servers and to OpenAI in order to generate plans and insights. We request your explicit permission in-app before any such AI transfer occurs. You can decline, or revoke consent later in Settings.",
                "privacy.section5.item1": "Recipients: Rainlonely Studio / PacerMind server infrastructure (relay/processor) and OpenAI.",
                "privacy.section5.item2": "Purpose: AI plan generation, workout analysis, weekly insight generation, and coach continuation features.",
                "privacy.section5.item3": "Protection: We require service providers that receive this data to provide the same or equal protection of user data as described in this policy and applicable law.",
                "privacy.section6.title": "6. Data Storage, Retention, and Deletion",
                "privacy.section6.text": "Workout records, plan data, journal data, and consent state are primarily stored on your device. For AI features, selected data may pass through Rainlonely Studio infrastructure only to relay and process your request to OpenAI, but we do not describe that relay path as long-term storage of your workout history or profile data. Removing app data, disconnecting sources, revoking permissions, or uninstalling the app will stop future collection from those sources.",
                "privacy.section7.title": "7. User Controls",
                "privacy.section7.item1": "Revoke HealthKit permissions at any time in iOS Settings → Health → Data Access.",
                "privacy.section7.item2": "Disconnect Strava inside Pacermind Settings.",
                "privacy.section7.item3": "Decline or revoke AI Data Sharing in Pacermind Settings before future AI requests are sent.",
                "privacy.section8.title": "8. Children’s Privacy",
                "privacy.section8.text": "Pacermind is intended for users aged 16 and above. We do not knowingly collect data from children below the age permitted by applicable law.",
                "privacy.section9.title": "9. Policy Updates",
                "privacy.section9.text": "When we update this policy, we may revise the in-app consent flow, update the consent version, and note the revision date below.",
                "privacy.lastUpdated": "Last updated: March 2026"
            },
            zh: {
                "privacy.eyebrow": "隐私政策",
                "privacy.title": "你的跑步，你的数据，你的思维。",
                "privacy.subtitle": "本政策说明 Pacermind 收集哪些数据、AI 功能如何使用这些数据、数据会发送给谁，以及你如何控制授权。",
                "privacy.section1.title": "1. 数据控制者",
                "privacy.section1.text": "Pacermind 由 Rainlonely Studio（“我们”）开发与运营。如有隐私问题，请联系 <a href=\"mailto:rainlonely@me.com\">rainlonely@me.com</a>。",
                "privacy.section2.title": "2. 我们收集和访问的数据",
                "privacy.section2.item1": "你授权自 Apple Health 提供的训练与健康/体能数据，例如距离、时长、配速、步频、心率、分段以及相关训练元数据。",
                "privacy.section2.item2": "如你连接 Strava，你选择同步的训练元数据和活动详情。",
                "privacy.section2.item3": "你在应用中主动填写的资料与训练输入，例如目标、比赛信息、每周可训练时间、笔记和训练偏好。",
                "privacy.section2.item4": "提供服务所必需的技术与设置数据，例如应用语言、授权版本，以及与展示和请求处理相关的设备/应用环境信息。",
                "privacy.section2.text": "我们还可能基于上述数据生成训练摘要，例如周负荷、执行质量和用于 AI 的训练上下文。Pacermind 不要求你提供真实姓名才能使用应用。",
                "privacy.section3.title": "3. 我们如何收集数据",
                "privacy.section3.item1": "当你填写个人资料、目标、笔记和计划偏好时，直接由你提供。",
                "privacy.section3.item2": "仅在你主动连接或授权后，从 Apple Health 和 Strava 获取。",
                "privacy.section3.item3": "在需要展示功能、保存设置和安全处理请求时，自动收集必要的应用使用与设备上下文信息。",
                "privacy.section4.title": "4. 我们如何使用数据",
                "privacy.section4.item1": "导入、展示和整理你的训练记录、计划、周记和历史。",
                "privacy.section4.item2": "生成 AI 辅助训练计划、单次训练洞察、周记洞察和 Share to Coach 延续计划。",
                "privacy.section4.item3": "维护应用设置、授权记录、订阅、调试与服务可靠性。",
                "privacy.section5.title": "5. AI 功能、数据共享与授权",
                "privacy.section5.text": "部分 AI 功能会将选定的训练相关数据、健康/体能指标、衍生训练摘要以及你输入的文本发送给 Rainlonely Studio 的服务器和 OpenAI，以生成训练计划和洞察。在发生这类 AI 数据传输前，我们会在应用内先征得你的明确同意。你可以拒绝，也可以之后在设置中撤销授权。",
                "privacy.section5.item1": "接收方：Rainlonely Studio / PacerMind 服务器基础设施（中转/处理）以及 OpenAI。",
                "privacy.section5.item2": "用途：AI 训练计划生成、单次训练分析、周洞察生成，以及 Share to Coach 等延续计划功能。",
                "privacy.section5.item3": "保护：我们要求接收该等数据的服务提供方依据本政策和适用法律提供相同或不低于本政策标准的保护。",
                "privacy.section6.title": "6. 数据存储、保留与删除",
                "privacy.section6.text": "训练记录、计划数据、周记数据和授权状态主要存储在你的设备上。对于 AI 功能，选定数据可能仅为中转和处理你的 OpenAI 请求而经过 Rainlonely Studio 的服务基础设施，但我们不将这一中转路径表述为对你的训练历史或个人资料进行长期存储。删除应用数据、断开数据源、撤销权限或卸载应用后，将停止未来从这些来源收集数据。",
                "privacy.section7.title": "7. 用户控制",
                "privacy.section7.item1": "你可以随时在 iOS 设置 → 健康 → 数据访问中撤销 HealthKit 权限。",
                "privacy.section7.item2": "你可以在 Pacermind 设置中断开 Strava。",
                "privacy.section7.item3": "你可以在 Pacermind 设置中拒绝或撤销 AI Data Sharing，以阻止未来 AI 请求继续发送数据。",
                "privacy.section8.title": "8. 儿童隐私",
                "privacy.section8.text": "Pacermind 面向 16 岁及以上用户。我们不会明知而收集低于适用法律允许年龄的儿童数据。",
                "privacy.section9.title": "9. 政策更新",
                "privacy.section9.text": "当本政策更新时，我们可能同步更新应用内授权流程、授权版本，并在下方注明修订日期。",
                "privacy.lastUpdated": "最后更新：2026 年 3 月"
            }
        },
        support: {
            en: {
                "support.eyebrow": "Support Center",
                "support.title": "We are here to keep you moving.",
                "support.subtitle": "Quick answers, step-by-step guidance, and direct contact with the Pacermind team.",
                "support.faq.title": "FAQs",
                "support.faq.item1": "<strong>How do I sync Apple Health?</strong> Open Pacermind → Settings → Health Access. Enable the workout metrics you want synced.",
                "support.faq.item2": "<strong>Where can I view my insights?</strong> Insights are generated after each eligible run and listed on the Home tab. Tap any insight to see AI commentary.",
                "support.faq.item3": "<strong>Why is my daily insight limit reached?</strong> Pacermind intentionally caps insights to preserve quality. The limit resets at midnight local time.",
                "support.troubleshooting.title": "Troubleshooting",
                "support.troubleshooting.item1": "<strong>No data shown:</strong> Confirm Pacermind has Health permissions and that new workouts exist within Apple Health.",
                "support.troubleshooting.item2": "<strong>Strava sync delay:</strong> Strava may take a few minutes to post workouts. Pull down on Pacermind Home to refresh once the activity appears on Strava.",
                "support.troubleshooting.item3": "<strong>Reset insights:</strong> Tap Settings → Clear Insights to rebuild your history from Health and Strava.",
                "support.contact.title": "Contact",
                "support.contact.email": "Email: <a href=\"mailto:rainlonely@me.com\">rainlonely@me.com</a>",
                "support.contact.response": "Response time: within 2 business days.",
                "support.contact.language": "Language: English · 简体中文",
                "support.checklist.title": "Manual Smoke Checklist",
                "support.checklist.subtitle": "Run these steps after updating Pacermind to confirm core flows:",
                "support.checklist.item1": "Launch Pacermind and verify home metrics refresh.",
                "support.checklist.item2": "Import a recent Apple Health workout and confirm an insight is generated.",
                "support.checklist.item3": "Connect Strava and ensure new activities synchronize within 10 minutes.",
                "support.checklist.item4": "Trigger the daily insight limit and confirm the UI displays “Precision over quantity”.",
                "support.checklist.item5": "Open the Privacy Policy link and confirm it loads successfully."
            },
            zh: {
                "support.eyebrow": "支持中心",
                "support.title": "我们随时守护你的每一次奔跑。",
                "support.subtitle": "快速解答、分步指南与 Pacermind 团队的直接联系。",
                "support.faq.title": "常见问题",
                "support.faq.item1": "<strong>如何同步 Apple Health？</strong> 打开 Pacermind → 设置 → 健康访问，开启需要同步的指标。",
                "support.faq.item2": "<strong>在哪里查看洞察？</strong> 每次符合条件的跑步结束后会生成洞察，并显示在首页，点击即可查看 AI 解读。",
                "support.faq.item3": "<strong>为什么达到每日洞察上限？</strong> 为保证质量，Pacermind 会限制每日洞察数量，该限制会在本地午夜重置。",
                "support.troubleshooting.title": "故障排查",
                "support.troubleshooting.item1": "<strong>没有数据显示：</strong> 请确认 Pacermind 已获得健康权限，并且 Apple Health 中存在新的训练记录。",
                "support.troubleshooting.item2": "<strong>Strava 同步延迟：</strong> Strava 上传活动可能需要几分钟，待活动出现在 Strava 后，在 Pacermind 首页下拉刷新即可。",
                "support.troubleshooting.item3": "<strong>重建洞察：</strong> 在设置 → 清除洞察 中重新导入 Apple Health 和 Strava 的训练数据。",
                "support.contact.title": "联系我们",
                "support.contact.email": "邮箱：<a href=\"mailto:rainlonely@me.com\">rainlonely@me.com</a>",
                "support.contact.response": "回复时间：2 个工作日内。",
                "support.contact.language": "支持语言：English · 简体中文",
                "support.checklist.title": "手动回归检查清单",
                "support.checklist.subtitle": "每次更新 Pacermind 后，请执行以下步骤确认核心流程：",
                "support.checklist.item1": "启动 Pacermind，确认首页数据刷新。",
                "support.checklist.item2": "导入最近的 Apple Health 训练并确认生成洞察。",
                "support.checklist.item3": "连接 Strava 并确认新活动在 10 分钟内同步。",
                "support.checklist.item4": "触发每日洞察上限，确认界面提示“Precision over quantity”。",
                "support.checklist.item5": "打开隐私政策链接并确认加载正常。"
            }
        }
    };

    const page = document.body.dataset.page || "home";
    const languageButtons = document.querySelectorAll("[data-lang-btn]");
    const supportedLanguages = ["en", "zh"];

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
});
