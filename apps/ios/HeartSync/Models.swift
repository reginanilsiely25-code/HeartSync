import Foundation

enum DailySyncVisibility: String, Codable, CaseIterable, Identifiable, Equatable {
    case partnerVisible = "partner_visible"
    case `private` = "private"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .partnerVisible:
            return "Partner visible"
        case .private:
            return "Private"
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
            return "Not started"
        case .inProgress:
            return "In progress"
        case .completed:
            return "Completed"
        case .postponed:
            return "Postponed"
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
            return "Date"
        case .anniversary:
            return "Anniversary"
        case .jointTask:
            return "Joint task"
        }
    }
}

enum InsightPeriod: String, Codable, CaseIterable, Identifiable, Equatable {
    case week
    case month

    var id: String { rawValue }
}

enum LLMSettingsStatus: Equatable {
    case configured
    case unconfigured

    var label: String {
        switch self {
        case .configured:
            return "Configured"
        case .unconfigured:
            return "Unconfigured"
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
        displayName: "Ava",
        avatarColor: "#E85D75"
    )

    static let partner = UserDTO(
        id: "user-b",
        deviceUserId: "device-b",
        displayName: "Bo",
        avatarColor: "#2F80ED"
    )

    static let cards = [
        SyncCardDTO(
            id: "card-glow",
            title: "Glowing today",
            emoji: "sun",
            colorHex: "#FFE7A3",
            tags: ["light", "open"],
            defaultMoodScore: 5,
            defaultEnergyScore: 4,
            defaultLongingScore: 3,
            archived: false
        ),
        SyncCardDTO(
            id: "card-hug",
            title: "Need a hug",
            emoji: "hug",
            colorHex: "#FFD6E0",
            tags: ["tender", "tired"],
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
                    note: "A good day for a short walk together.",
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
            title: "Museum afternoon",
            type: .date,
            scheduledAt: "2026-08-14T10:00:00Z",
            status: .inProgress,
            ownerUserId: currentUser.id,
            completedAt: nil,
            postponedFrom: nil,
            postponeReason: nil,
            startPlaceName: "Home",
            startLatitude: 31.2304,
            startLongitude: 121.4737,
            destinationName: "Museum",
            destinationLatitude: 31.2397,
            destinationLongitude: 121.4998,
            notes: "Bring tea"
        ),
        PlanDTO(
            id: "plan-fallback",
            coupleId: "couple-1",
            title: "Friday call",
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
            destinationName: "Video room",
            destinationLatitude: nil,
            destinationLongitude: nil,
            notes: "Keep it low pressure"
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
        templateSummary: "You stayed mostly in rhythm this week, with one slower day and steady longing.",
        analysis: LLMAnalysisDTO(
            sharedSummary: "Your check-ins are consistent and gentle.",
            trendExplanation: "Energy dipped slightly while longing stayed high.",
            suggestions: [
                "Plan one low-effort shared moment.",
                "Use a short note when energy is low."
            ],
            privateMessageDraft: "I am a little tired today, but I still want to be close to you.",
            riskFlags: [],
            usedUnsafeFallback: false
        ),
        generatedAt: "2026-08-13T09:00:00Z"
    )

    static let couple = CoupleDTO(
        id: "couple-1",
        displayName: "Ava and Bo",
        pairingCode: "AB2CDE",
        members: [currentUser, partner],
        serviceStatus: "healthy"
    )
}
