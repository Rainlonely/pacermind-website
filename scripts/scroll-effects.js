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
                "hero.subtitle": "Run Smarter. Think Deeper.",
                "hero.body": "Every run tells a story. Pacermind decodes your pace, cadence, and heart rate to reveal what your training truly means.",
                "hero.ctaPrimary": "Download on App Store",
                "hero.ctaSecondary": "Learn More",
                "hero.scroll": "Scroll",
                "values.eyebrow": "Core Value",
                "values.title": "Data. Insight. Progress.",
                "values.subtitle": "Three pillars that power Pacermind—transforming numbers into meaningful, on-device understanding.",
                "values.card1.title": "Data-Driven Insight",
                "values.card1.text": "We transform running metrics into real context—not just numbers.",
                "values.card2.title": "AI Personal Analysis",
                "values.card2.text": "Personalized feedback built from pace, cadence, and heart rate.",
                "values.card3.title": "On-Device Privacy",
                "values.card3.text": "Every analysis stays on your device with nothing uploaded.",
                "features.eyebrow": "Features",
                "features.title": "Understand Your Run in Four Dimensions",
                "features.subtitle": "Smart analysis, seamless sync, rich history, and intentional limits—every detail crafted for thoughtful runners.",
                "features.card1.title": "AI Insight Engine",
                "features.card1.text": "Automatically analyze pace, cadence, and heart rate to reveal training status. Understand fatigue, readiness, and progression—automatically.",
                "features.card2.title": "Multi-source Sync",
                "features.card2.text": "Sync seamlessly with Apple Health and Strava, keeping data current with a constant sense of motion.",
                "features.card3.title": "Training History & Trends",
                "features.card3.text": "Calendar views and charts showcase training trends. See your growth in data, not guesswork.",
                "features.card4.title": "Daily Insight Limit",
                "features.card4.text": "We cap daily analyses so every insight stays focused and high quality. Precision over quantity.",
                "product.eyebrow": "Product Showcase",
                "product.title": "Everything you do in motion, understood in context.",
                "product.fig1": "Home · Today’s training data",
                "product.fig2": "Insight view · AI interpretation",
                "product.fig3": "History view · Calendar overview",
                "usecases.eyebrow": "Use Cases",
                "usecases.title": "Tailored for Every Runner",
                "usecases.subtitle": "From marathon cycles to everyday mileage, Pacermind adapts to your habits and goals.",
                "usecases.card1.title": "For Marathoners",
                "usecases.card1.text": "Explore fatigue and breakthroughs across every training block.",
                "usecases.card2.title": "For Everyday Runners",
                "usecases.card2.text": "Stay in tune with recovery rhythms and train more effectively.",
                "usecases.card3.title": "For Data Lovers",
                "usecases.card3.text": "Let your numbers speak with clarity and context.",
                "trust.title": "Pacermind runs entirely on your device.",
                "trust.copy": "No servers. No uploads. No tracking. Just your data, your run, your mind.",
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
                "hero.subtitle": "更聪明地跑，更深刻地理解自己。",
                "hero.body": "每一次奔跑都有它的故事。Pacermind 解析你的配速、步频与心率，呈现训练背后的真正意义。",
                "hero.ctaPrimary": "前往 App Store 下载",
                "hero.ctaSecondary": "了解更多",
                "hero.scroll": "下滑探索",
                "values.eyebrow": "核心价值",
                "values.title": "数据 · 洞察 · 精进",
                "values.subtitle": "Pacermind 的三大支柱——让数字在本地转换为真正有意义的理解。",
                "values.card1.title": "数据驱动的洞察",
                "values.card1.text": "把跑步指标转换成真正可执行的上下文，而不是冰冷数字。",
                "values.card2.title": "AI 个性分析",
                "values.card2.text": "结合配速、步频与心率，为你量身打造反馈。",
                "values.card3.title": "本地隐私保护",
                "values.card3.text": "全部分析留在设备本地，绝不上传。",
                "features.eyebrow": "功能亮点",
                "features.title": "从四个维度理解你的跑步",
                "features.subtitle": "智能分析、无缝同步、丰富历史与精确限制——每一个细节都是为了深思熟虑的跑者。",
                "features.card1.title": "AI 洞察引擎",
                "features.card1.text": "自动分析配速、步频与心率，揭示训练状态——理解疲劳、恢复与进展。",
                "features.card2.title": "多源同步",
                "features.card2.text": "与 Apple Health 和 Strava 无缝同步，让数据始终保持流动。",
                "features.card3.title": "训练历史与趋势",
                "features.card3.text": "用日历与图表呈现训练趋势，让你的成长有据可循。",
                "features.card4.title": "每日洞察限额",
                "features.card4.text": "限制每日分析次数，确保每条洞察专注而高质量。",
                "product.eyebrow": "产品展示",
                "product.title": "运动中的每一步，都被理解在语境中。",
                "product.fig1": "首页 · 今日训练数据",
                "product.fig2": "Insight 页面 · AI 解读",
                "product.fig3": "历史页面 · 日历概览",
                "usecases.eyebrow": "使用场景",
                "usecases.title": "为每一类跑者量身打造",
                "usecases.subtitle": "无论是马拉松周期还是日常里程，Pacermind 都能适应你的习惯与目标。",
                "usecases.card1.title": "马拉松跑者",
                "usecases.card1.text": "洞察每个训练周期的疲劳与突破点。",
                "usecases.card2.title": "日常跑者",
                "usecases.card2.text": "掌握恢复节奏，让训练更高效。",
                "usecases.card3.title": "数据爱好者",
                "usecases.card3.text": "让数字真正说话，提供清晰语境。",
                "trust.title": "Pacermind 全程在你的设备上运行。",
                "trust.copy": "无服务器、无上传、无追踪。只有你的数据、你的跑步、你的思维。",
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
                "privacy.subtitle": "Pacermind is designed to meet App Store privacy requirements while delivering transparent, on-device analysis.",
                "privacy.section1.title": "1. Data Controller",
                "privacy.section1.text": "Pacermind is developed and operated by Rainlonely Studio (“we”, “us”, “our”). For any privacy questions, contact <a href=\"mailto:hello@pacermind.app\">hello@pacermind.app</a>.",
                "privacy.section2.title": "2. Data We Access",
                "privacy.section2.item1": "Running metrics retrieved from Apple Health (distance, duration, pace, cadence, heart rate).",
                "privacy.section2.item2": "Workout metadata you choose to sync from Strava, if connected.",
                "privacy.section2.item3": "Device information limited to iOS version and language for UI rendering.",
                "privacy.section2.text": "Pacermind does not collect personal identifiers such as name, email, or location.",
                "privacy.section3.title": "3. On-Device Processing",
                "privacy.section3.text": "All calculations, AI models, and insight generation run locally on your iPhone. We do not transmit raw or derived workout data to external servers.",
                "privacy.section4.title": "4. Data Storage & Retention",
                "privacy.section4.text": "Workout summaries and insights remain stored in your device’s secure container. Removing the Pacermind app deletes all locally stored data. We do not maintain backups outside your device.",
                "privacy.section5.title": "5. Sharing & Disclosure",
                "privacy.section5.text": "Pacermind does not share data with third parties. When you connect Strava, the secure authentication is handled by Strava; Pacermind only receives the workout data you approve.",
                "privacy.section6.title": "6. User Controls",
                "privacy.section6.item1": "Revoke HealthKit permissions at any time by visiting iOS Settings → Health → Data Access.",
                "privacy.section6.item2": "Disconnect Strava via Pacermind Settings → Connections.",
                "privacy.section6.item3": "Delete local history through Pacermind Settings → Clear Insights.",
                "privacy.section7.title": "7. Children’s Privacy",
                "privacy.section7.text": "Pacermind is intended for users aged 16 and above. We do not knowingly process data from younger users.",
                "privacy.section8.title": "8. Policy Updates",
                "privacy.section8.text": "When we update this policy, we will highlight the changes in-app and note the revision date below.",
                "privacy.lastUpdated": "Last updated: January 2025"
            },
            zh: {
                "privacy.eyebrow": "隐私政策",
                "privacy.title": "你的跑步，你的数据，你的思维。",
                "privacy.subtitle": "Pacermind 在满足 App Store 隐私要求的同时，提供透明的本地分析体验。",
                "privacy.section1.title": "1. 数据控制者",
                "privacy.section1.text": "Pacermind 由 Rainlonely Studio（“我们”）开发与运营。如有隐私问题，请联系 <a href=\"mailto:hello@pacermind.app\">hello@pacermind.app</a>。",
                "privacy.section2.title": "2. 我们访问的数据",
                "privacy.section2.item1": "来自 Apple Health 的跑步指标（距离、时长、配速、步频、心率）。",
                "privacy.section2.item2": "如你连接 Strava，我们会获取你授权同步的训练摘要。",
                "privacy.section2.item3": "仅用于界面渲染的设备信息（iOS 版本与系统语言）。",
                "privacy.section2.text": "Pacermind 不会收集姓名、邮箱或地理位置等个人身份信息。",
                "privacy.section3.title": "3. 本地处理",
                "privacy.section3.text": "所有计算、AI 模型与洞察生成都在你的 iPhone 本地完成，我们不会将原始或衍生数据传输到外部服务器。",
                "privacy.section4.title": "4. 数据存储与保留",
                "privacy.section4.text": "训练摘要与洞察保存在设备安全区域。卸载 Pacermind 时，本地数据将被删除，我们不保留任何外部备份。",
                "privacy.section5.title": "5. 数据共享与披露",
                "privacy.section5.text": "Pacermind 不会与第三方共享数据。连接 Strava 时，认证流程由 Strava 负责，我们仅接收你授权的训练数据。",
                "privacy.section6.title": "6. 用户控制",
                "privacy.section6.item1": "随时可以在 iOS 设置 → 健康 → 数据访问中撤销 HealthKit 权限。",
                "privacy.section6.item2": "在 Pacermind 设置 → 连接 中断开 Strava。",
                "privacy.section6.item3": "在 Pacermind 设置 → 清除洞察 中删除本地历史数据。",
                "privacy.section7.title": "7. 儿童隐私",
                "privacy.section7.text": "Pacermind 面向 16 岁及以上用户，我们不会主动处理更低年龄用户的数据。",
                "privacy.section8.title": "8. 政策更新",
                "privacy.section8.text": "若本政策发生变更，我们会在应用内提示并注明下方的修订日期。",
                "privacy.lastUpdated": "最后更新：2025 年 1 月"
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
                "support.contact.email": "Email: <a href=\"mailto:support@pacermind.app\">support@pacermind.app</a>",
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
                "support.contact.email": "邮箱：<a href=\"mailto:support@pacermind.app\">support@pacermind.app</a>",
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
