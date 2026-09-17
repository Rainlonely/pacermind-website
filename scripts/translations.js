// Shared legal/support copy, retained from the previous website.
window.PM_TRANSLATIONS = {
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
      "footer.support": "Support",
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
      "footer.support": "支持",
    },
  },
  privacy: {
    en: {
      "privacy.eyebrow": "Privacy Policy",
      "privacy.title": "Your run, your data, your mind.",
      "privacy.subtitle":
        "This policy explains what data PacerMind collects, how AI and optional analytics features use it, who receives it, and how you control consent.",
      "privacy.section1.title": "1. Data Controller",
      "privacy.section1.text":
        'PacerMind is developed and operated by Rainlonely Studio (“we”, “us”, “our”). For any privacy questions, contact <a href="mailto:rainlonely@me.com">rainlonely@me.com</a>.',
      "privacy.section2.title": "2. Local-First App",
      "privacy.section2.text":
        "PacerMind is designed as a standalone app. Workout records, notes, plans, journals, route data, and generated history are stored locally on your device. We do not maintain user accounts, cloud profiles, or a PacerMind server database that receives or stores your personal running data.",
      "privacy.section3.title": "3. Data the App Accesses on Your Device",
      "privacy.section3.item1":
        "Workout and health metrics you authorize from Apple Health, such as distance, duration, pace, cadence, heart rate, route, and related training data.",
      "privacy.section3.item2":
        "Workout data you choose to import from Strava, if you connect Strava.",
      "privacy.section3.item3":
        "Notes, plans, preferences, and app settings you create inside PacerMind.",
      "privacy.section3.item4":
        "Basic device context, such as system language and app version, used to render the app and provide support.",
      "privacy.section3.text":
        "This access is performed by the PacerMind app installed on your device. Rainlonely Studio does not remotely access this data. The app uses it to provide local features, unless you choose to use an AI feature or connect a third-party service as described below.",
      "privacy.section4.title": "4. AI Features, Sharing, and Consent",
      "privacy.section4.text":
        "Some PacerMind features use third-party large language model providers to generate training feedback, summaries, plans, or insights. Currently, AI services in mainland China are provided through Qwen, and AI services outside mainland China are provided through OpenAI GPT models. When you use an AI feature, the necessary workout context, health and fitness metrics, derived training summaries, notes, or prompt content may be sent to Rainlonely Studio infrastructure and the relevant provider solely to generate the requested response. We request your permission in-app before this AI transfer occurs, and you can decline or revoke consent later in Settings.",
      "privacy.section4.extra":
        "We may change model providers, model versions, or routing logic from time to time, including for quality, reliability, availability, compliance, or cost reasons. These changes may occur without prior notice, but our purpose remains to provide the best practical feedback experience for users while applying the protections described in this policy.",
      "privacy.section5.title": "5. Optional Anonymous Product Analytics",
      "privacy.section5.text":
        "Only after you explicitly opt in, PacerMind uses PostHog Cloud in the United States to understand feature adoption and improve the product. We send basic app lifecycle events and a limited set of product milestones, such as completing onboarding, connecting a workout source, completing a first import, opening workout or plan details, generating an insight or plan, and completing a share. Event properties are restricted to coarse categories such as source, insight type, plan context, and share format. PostHog may also process a randomly generated anonymous identifier and technical context such as app version, device model, operating-system version, locale, time zone, and network information necessarily received with a request. PacerMind marks every analytics event to disable GeoIP location enrichment.",
      "privacy.section5.extra":
        'We do not send names, email addresses, account identifiers, workout or health values, routes, precise location, notes, AI prompts, or AI responses to PostHog. Session replay, automatic interaction and screen capture, crash reporting, advertising, cross-app tracking, and identified person profiles are disabled. You can decline analytics or turn it off later in PacerMind Settings. Turning it off stops future analytics collection. Anonymous analytics already received may be retained only as reasonably necessary for product analytics and according to our PostHog project controls. See <a href="https://posthog.com/privacy" rel="noopener noreferrer">PostHog’s privacy information</a>.',
      "privacy.section6.title": "6. Strava Connection",
      "privacy.section6.text":
        "If you connect Strava, Strava authentication is handled by Strava. Workout data may pass through our relay interface only so it can be delivered from Strava to your device. We do not store Strava access data, workout data, route data, or imported training history on our servers after relay delivery.",
      "privacy.section7.title": "7. Website Analytics",
      "privacy.section7.text":
        'The PacerMind website uses Umami Cloud for privacy-focused aggregate traffic measurement. It may process page views, referrers, browser and operating-system type, device type, language, and approximate country or region. Our website configuration does not use cookies, cross-site advertising tracking, or session replay. See <a href="https://umami.is/privacy" rel="noopener noreferrer">Umami’s privacy information</a>. Website analytics is separate from the optional in-app PostHog analytics.',
      "privacy.section8.title": "8. Data Storage & Retention",
      "privacy.section8.text":
        "Your personal PacerMind content is primarily stored locally in the app container on your device. For AI features, selected data may pass through Rainlonely Studio infrastructure only to relay and process your request to the relevant provider; we do not use that path as long-term storage for your workout history or profile. Optional anonymous app analytics is processed by PostHog, and aggregate website analytics is processed by Umami, as described above. Deleting the app deletes local app data managed by iOS, but does not by itself delete anonymous analytics already received by those services.",
      "privacy.section9.title": "9. User Controls",
      "privacy.section9.item1":
        "Revoke Apple Health permissions at any time in iOS Settings → Health → Data Access & Devices.",
      "privacy.section9.item2":
        "Disconnect Strava from PacerMind or revoke access from your Strava account settings.",
      "privacy.section9.item3":
        "Decline or disable Anonymous Product Analytics at any time in PacerMind Settings.",
      "privacy.section9.item4":
        "Delete local app data by using in-app deletion controls where available or by deleting PacerMind from your device.",
      "privacy.section10.title": "10. Children’s Privacy",
      "privacy.section10.text":
        "PacerMind is intended for users aged 16 and above. We do not knowingly collect or process personal data from children under that age.",
      "privacy.section11.title": "11. Policy Updates",
      "privacy.section11.text":
        "We may update this policy as PacerMind changes. Material changes will be reflected on this page, together with the latest revision date below.",
      "privacy.lastUpdated": "Last updated: August 25, 2026",
    },
    zh: {
      "privacy.eyebrow": "隐私政策",
      "privacy.title": "你的跑步，你的数据，你的思维。",
      "privacy.subtitle":
        "本政策说明 PacerMind 收集哪些数据、AI 与可选统计功能如何使用这些数据、数据会发送给谁，以及你如何控制授权。",
      "privacy.section1.title": "1. 数据控制者",
      "privacy.section1.text":
        'PacerMind 由 Rainlonely Studio（“我们”）开发与运营。如有隐私问题，请联系 <a href="mailto:rainlonely@me.com">rainlonely@me.com</a>。',
      "privacy.section2.title": "2. 本地优先的应用",
      "privacy.section2.text":
        "PacerMind 按单机应用的方式设计。训练记录、笔记、计划、周记、路线数据和生成的历史内容均保存在你的设备本地。我们不维护用户账号、云端个人资料，也没有用于接收或存储你个人跑步数据的 PacerMind 服务器数据库。",
      "privacy.section3.title": "3. App 在你的设备上访问的数据",
      "privacy.section3.item1":
        "你授权从 Apple Health 读取的训练与健康指标，例如距离、时长、配速、步频、心率、路线以及相关训练数据。",
      "privacy.section3.item2":
        "如果你连接 Strava，我们会访问你选择导入的 Strava 训练数据。",
      "privacy.section3.item3":
        "你在 PacerMind 内创建的笔记、计划、偏好设置和应用设置。",
      "privacy.section3.item4":
        "用于界面展示和支持服务的基础设备上下文，例如系统语言和应用版本。",
      "privacy.section3.text":
        "这些访问由安装在你设备上的 PacerMind App 完成。Rainlonely Studio 不会远程访问这些数据。App 使用这些信息来提供本地功能；除非你选择使用 AI 功能或连接下文所述的第三方服务。",
      "privacy.section4.title": "4. AI 功能、数据共享与授权",
      "privacy.section4.text":
        "PacerMind 的部分功能会使用第三方大语言模型服务来生成训练反馈、总结、计划或洞察。目前，中国大陆地区的 AI 服务由 Qwen 提供，中国大陆以外地区的 AI 服务由 OpenAI GPT 模型提供。当你使用 AI 功能时，为生成你请求的结果，必要的训练上下文、健康与体能指标、衍生训练摘要、笔记或提示内容可能会发送给 Rainlonely Studio 的服务基础设施和相应模型服务商。发生这类 AI 数据传输前，我们会在应用内先征得你的许可；你可以拒绝，也可以之后在设置中撤销授权。",
      "privacy.section4.extra":
        "我们可能会根据反馈质量、稳定性、可用性、合规要求或成本等因素，不时调整模型服务商、模型版本或调用路由。这类调整可能不会提前通知用户，但目的始终是在适用本政策所述保护措施的前提下，为用户提供尽可能好的反馈体验。",
      "privacy.section5.title": "5. 可选的匿名产品统计",
      "privacy.section5.text":
        "只有在你明确同意后，PacerMind 才会使用位于美国的 PostHog Cloud 来了解功能采用情况并改进产品。我们会发送基础应用生命周期事件和一组受限的产品里程碑，例如完成引导、连接训练来源、完成首次导入、打开训练或计划详情、生成洞察或计划，以及完成分享。事件属性仅限于来源、洞察类型、计划场景和分享格式等粗粒度类别。PostHog 还可能处理随机生成的匿名标识符，以及应用版本、设备型号、操作系统版本、语言区域、时区和处理网络请求时必然接收的网络信息等技术上下文。PacerMind 会在每个统计事件中明确关闭 GeoIP 位置富化。",
      "privacy.section5.extra":
        '我们不会向 PostHog 发送姓名、电子邮箱、账号标识、训练或健康数值、路线、精确位置、笔记、AI 提示或 AI 回复。会话回放、自动交互与屏幕采集、崩溃报告、广告、跨 App 追踪和已识别的个人资料均已关闭。你可以拒绝统计，也可以之后在 PacerMind 设置中将其关闭；关闭后会停止未来的统计收集。此前已接收的匿名统计数据，仅会在产品分析所合理需要的期限内，按照我们的 PostHog 项目控制保留。请参阅 <a href="https://posthog.com/privacy" rel="noopener noreferrer">PostHog 隐私说明</a>。',
      "privacy.section6.title": "6. Strava 连接",
      "privacy.section6.text":
        "如果你连接 Strava，认证流程由 Strava 处理。训练数据可能仅通过我们的中转接口从 Strava 传递到你的设备。中转完成后，我们不会在服务器上存储 Strava 访问数据、训练数据、路线数据或导入的训练历史。",
      "privacy.section7.title": "7. 网站访问统计",
      "privacy.section7.text":
        'PacerMind 网站使用 Umami Cloud 进行注重隐私的汇总访问统计。它可能处理页面访问、来源页面、浏览器与操作系统类型、设备类型、语言以及大致国家或地区。我们当前的网站配置不使用 Cookie、跨网站广告追踪或会话回放。请参阅 <a href="https://umami.is/privacy" rel="noopener noreferrer">Umami 隐私说明</a>。网站统计与 App 内可选的 PostHog 统计相互独立。',
      "privacy.section8.title": "8. 数据存储与保留",
      "privacy.section8.text":
        "你的 PacerMind 个人内容主要保存在设备本地的应用容器中。对于 AI 功能，选定数据可能仅为中转和处理你的请求而经过 Rainlonely Studio 的服务基础设施和相应模型服务商；我们不会把该路径用于长期存储你的训练历史或个人资料。可选的匿名 App 统计由 PostHog 处理，网站汇总统计由 Umami 处理，具体如上所述。删除 App 会删除由 iOS 管理的本地应用数据，但不会自动删除这些服务此前已接收的匿名统计数据。",
      "privacy.section9.title": "9. 用户控制",
      "privacy.section9.item1":
        "你可以随时在 iOS 设置 → 健康 → 数据访问与设备 中撤销 Apple Health 权限。",
      "privacy.section9.item2":
        "你可以在 PacerMind 中断开 Strava，或在 Strava 账号设置中撤销授权。",
      "privacy.section9.item3":
        "你可以拒绝匿名产品统计，或随时在 PacerMind 设置中将其关闭。",
      "privacy.section9.item4":
        "你可以使用应用内可用的删除功能，或从设备中删除 PacerMind，以删除本地应用数据。",
      "privacy.section10.title": "10. 儿童隐私",
      "privacy.section10.text":
        "PacerMind 面向 16 岁及以上用户。我们不会有意收集或处理低于该年龄用户的个人数据。",
      "privacy.section11.title": "11. 政策更新",
      "privacy.section11.text":
        "我们可能会随着 PacerMind 的变化更新本政策。重大变更将体现在本页面，并以下方最新修订日期为准。",
      "privacy.lastUpdated": "最后更新：2026 年 8 月 25 日",
    },
  },
  support: {
    en: {
      "support.eyebrow": "Support Center",
      "support.title": "Talk to the maker of PacerMind.",
      "support.subtitle":
        "Choose any channel below to share feedback, ask questions, or follow product updates.",
      "support.channel.email.label": "Email",
      "support.channel.email.title": "Email the developer",
      "support.channel.xhs.label": "Xiaohongshu",
      "support.channel.xhs.title": "Training notes and updates",
      "support.channel.xhs.meta": "Follow Rain's running and product posts",
      "support.channel.discord.label": "Discord",
      "support.channel.discord.title": "Join the community",
      "support.channel.discord.meta":
        "Discuss training, plans, and product ideas",
      "support.channel.wechat.label": "WeChat",
      "support.channel.wechat.title": "Official account",
      "support.channel.wechat.meta": "Scan the QR code to follow",
    },
    zh: {
      "support.eyebrow": "支持中心",
      "support.title": "和 PacerMind 的开发者聊聊。",
      "support.subtitle":
        "你可以通过下面任意渠道反馈问题、提出想法，或关注产品更新。",
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
      "support.channel.wechat.meta": "微信扫码关注公众号",
    },
  },
};
