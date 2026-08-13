import Foundation

enum DailySyncVisibility: String, Codable, CaseIterable, Identifiable, Equatable {
    case partnerVisible = "partner_visible"
    case `private` = "private"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .partnerVisible:
            return "伴侣可见"
        case .private:
            return "仅自己可见"
        }
    }
}

enum PlanStatus: String, Codable, CaseIterable, Identifiable, Equatable {
    case notStarted = "not_started"
    case inProgress = "in_progress"
    case completed
    case postponed

    var id: String { rawValue }

    var label: String {
        switch self {
        case .notStarted:
            return "未开始"
        case .inProgress:
            return "进行中"
        case .completed:
            return "已完成"
        case .postponed:
            return "已延期"
        }
    }
}

enum PlanType: String, Codable, CaseIterable, Identifiable, Equatable {
    case date
    case anniversary
    case jointTask = "joint_task"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .date:
            return "约会"
        case .anniversary:
            return "纪念日"
        case .jointTask:
            return "共同任务"
        }
    }
}

enum InsightPeriod: String, Codable, CaseIterable, Identifiable, Equatable {
    case week
    case month

    var id: String { rawValue }

    var label: String {
        switch self {
        case .week:
            return "本周"
        case .month:
            return "本月"
        }
    }
}

enum LLMSettingsStatus: Equatable {
    case configured
    case unconfigured

    var label: String {
        switch self {
        case .configured:
            return "已配置"
        case .unconfigured:
            return "未配置"
        }
    }
}

struct UserDTO: Codable, Identifiable, Equatable {
    let id: String
    let deviceUserId: String
    let displayName: String
    let avatarColor: String
}

struct CoupleDTO: Codable, Identifiable, Equatable {
    let id: String
    let displayName: String?
    let pairingCode: String?
    let members: [UserDTO]
    let serviceStatus: String?
}

struct SyncCardDTO: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let emoji: String
    let colorHex: String
    let tags: [String]
    let defaultMoodScore: Int
    let defaultEnergyScore: Int
    let defaultLongingScore: Int
    let archived: Bool
}

struct DailySyncDTO: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let syncDate: String
    let cardId: String
    let card: SyncCardDTO?
    let moodScore: Int
    let energyScore: Int
    let longingScore: Int
    let tags: [String]
    let note: String?
    let visibility: DailySyncVisibility
}

struct TodayMemberDTO: Codable, Equatable {
    let user: UserDTO
    let hasSynced: Bool
    let sync: DailySyncDTO?
}

struct TodayDTO: Codable, Equatable {
    let date: String
    let currentUserId: String
    let members: [TodayMemberDTO]
    let cards: [SyncCardDTO]
}

struct PlanDTO: Codable, Identifiable, Equatable {
    let id: String
    let coupleId: String
    let title: String
    let type: PlanType
    let scheduledAt: String
    let status: PlanStatus
    let ownerUserId: String
    let completedAt: String?
    let postponedFrom: String?
    let postponeReason: String?
    let startPlaceName: String?
    let startLatitude: Double?
    let startLongitude: Double?
    let destinationName: String?
    let destinationLatitude: Double?
    let destinationLongitude: Double?
    let notes: String?

    var hasCompleteRouteCoordinates: Bool {
        startLatitude != nil &&
            startLongitude != nil &&
            destinationLatitude != nil &&
            destinationLongitude != nil
    }
}

struct InsightMetricsDTO: Codable, Equatable {
    let syncRatePercent: Int
    let averageMood: Double
    let averageEnergy: Double
    let averageLonging: Double
    let lowMoodDays: Int
    let completedPromises: Int
    let postponedPromises: Int
    let syncStabilityScore: Int
    let emotionalTrendScore: Int
    let sharedProgressScore: Int
    let insufficientData: Bool
}

struct LLMAnalysisDTO: Codable, Equatable {
    let sharedSummary: String
    let trendExplanation: String
    let suggestions: [String]
    let privateMessageDraft: String
    let riskFlags: [String]
    let usedUnsafeFallback: Bool
}

struct InsightDTO: Codable, Identifiable, Equatable {
    let id: String
    let coupleId: String
    let periodType: InsightPeriod
    let periodStart: String
    let periodEnd: String
    let temperatureScore: Int
    let metrics: InsightMetricsDTO
    let templateSummary: String
    let analysis: LLMAnalysisDTO
    let generatedAt: String
}

struct DeviceUserRequest: Codable, Equatable {
    let deviceUserId: String
    let displayName: String
    let avatarColor: String
}

struct UpdateUserRequest: Codable, Equatable {
    let displayName: String?
    let avatarColor: String?
}

struct SyncCardRequest: Codable, Equatable {
    let title: String
    let emoji: String
    let colorHex: String
    let tags: [String]
    let defaultMoodScore: Int
    let defaultEnergyScore: Int
    let defaultLongingScore: Int
}

struct DailySyncRequest: Codable, Equatable {
    let cardId: String
    let moodScore: Int
    let energyScore: Int
    let longingScore: Int
    let tags: [String]
    let note: String?
    let visibility: DailySyncVisibility
}

struct PlanRequest: Codable, Equatable {
    let title: String
    let type: PlanType
    let scheduledAt: String
    let status: PlanStatus
    let ownerUserId: String
    let startPlaceName: String?
    let startLatitude: Double?
    let startLongitude: Double?
    let destinationName: String?
    let destinationLatitude: Double?
    let destinationLongitude: Double?
    let notes: String?
}

struct PostponePlanRequest: Codable, Equatable {
    let newScheduledAt: String
    let postponeReason: String?
}

struct GenerateInsightRequest: Codable, Equatable {
    let period: InsightPeriod
}

struct LLMProviderConfigDTO: Codable, Equatable {
    let baseURL: String
    let model: String
    let apiKey: String
}

struct LLMAnalysisRequest: Codable, Equatable {
    let period: InsightPeriod
    let providerConfig: LLMProviderConfigDTO?
}

struct HealthDTO: Codable, Equatable {
    let status: String
}

enum HeartSyncPreviewData {
    static let currentUser = UserDTO(
        id: "user-a",
        deviceUserId: "device-a",
        displayName: "小晴",
        avatarColor: "#E85D75"
    )

    static let partner = UserDTO(
        id: "user-b",
        deviceUserId: "device-b",
        displayName: "阿屿",
        avatarColor: "#2F80ED"
    )

    static let cards = [
        SyncCardDTO(
            id: "card-glow",
            title: "今天亮晶晶",
            emoji: "✨",
            colorHex: "#FFE7A3",
            tags: ["开心", "敞亮"],
            defaultMoodScore: 5,
            defaultEnergyScore: 4,
            defaultLongingScore: 3,
            archived: false
        ),
        SyncCardDTO(
            id: "card-hug",
            title: "想要一个抱抱",
            emoji: "🤍",
            colorHex: "#FFD6E0",
            tags: ["柔软", "疲惫"],
            defaultMoodScore: 3,
            defaultEnergyScore: 2,
            defaultLongingScore: 5,
            archived: false
        )
    ]

    static let today = TodayDTO(
        date: "2026-08-13",
        currentUserId: currentUser.id,
        members: [
            TodayMemberDTO(
                user: currentUser,
                hasSynced: true,
                sync: DailySyncDTO(
                    id: "sync-a",
                    userId: currentUser.id,
                    syncDate: "2026-08-13",
                    cardId: cards[0].id,
                    card: cards[0],
                    moodScore: 5,
                    energyScore: 4,
                    longingScore: 3,
                    tags: cards[0].tags,
                    note: "今天很适合一起短短散个步。",
                    visibility: .partnerVisible
                )
            ),
            TodayMemberDTO(
                user: partner,
                hasSynced: true,
                sync: DailySyncDTO(
                    id: "sync-b",
                    userId: partner.id,
                    syncDate: "2026-08-13",
                    cardId: cards[1].id,
                    card: cards[1],
                    moodScore: 3,
                    energyScore: 2,
                    longingScore: 5,
                    tags: cards[1].tags,
                    note: nil,
                    visibility: .private
                )
            )
        ],
        cards: cards
    )

    static let plans = [
        PlanDTO(
            id: "plan-route",
            coupleId: "couple-1",
            title: "博物馆下午",
            type: .date,
            scheduledAt: "2026-08-14T10:00:00Z",
            status: .inProgress,
            ownerUserId: currentUser.id,
            completedAt: nil,
            postponedFrom: nil,
            postponeReason: nil,
            startPlaceName: "家",
            startLatitude: 31.2304,
            startLongitude: 121.4737,
            destinationName: "博物馆",
            destinationLatitude: 31.2397,
            destinationLongitude: 121.4998,
            notes: "记得带茶"
        ),
        PlanDTO(
            id: "plan-fallback",
            coupleId: "couple-1",
            title: "周五电话",
            type: .jointTask,
            scheduledAt: "2026-08-16T12:30:00Z",
            status: .notStarted,
            ownerUserId: partner.id,
            completedAt: nil,
            postponedFrom: nil,
            postponeReason: nil,
            startPlaceName: nil,
            startLatitude: nil,
            startLongitude: nil,
            destinationName: "视频房间",
            destinationLatitude: nil,
            destinationLongitude: nil,
            notes: "轻松一点聊"
        )
    ]

    static let insight = InsightDTO(
        id: "insight-week",
        coupleId: "couple-1",
        periodType: .week,
        periodStart: "2026-08-07",
        periodEnd: "2026-08-13",
        temperatureScore: 78,
        metrics: InsightMetricsDTO(
            syncRatePercent: 86,
            averageMood: 4.1,
            averageEnergy: 3.4,
            averageLonging: 4.7,
            lowMoodDays: 1,
            completedPromises: 2,
            postponedPromises: 1,
            syncStabilityScore: 86,
            emotionalTrendScore: 75,
            sharedProgressScore: 70,
            insufficientData: false
        ),
        templateSummary: "这一周你们大体保持了同步节奏，有一天慢了一些，但想念很稳定。",
        analysis: LLMAnalysisDTO(
            sharedSummary: "你们的同步稳定又温柔。",
            trendExplanation: "能量略有下降，但想念保持在比较高的位置。",
            suggestions: [
                "安排一个低负担的共同片刻。",
                "能量低的时候，用一句短笔记也可以。"
            ],
            privateMessageDraft: "我今天有一点累，但还是想和你靠近一点。",
            riskFlags: [],
            usedUnsafeFallback: false
        ),
        generatedAt: "2026-08-13T09:00:00Z"
    )

    static let couple = CoupleDTO(
        id: "couple-1",
        displayName: "小晴和阿屿",
        pairingCode: "AB2CDE",
        members: [currentUser, partner],
        serviceStatus: "健康"
    )
}
