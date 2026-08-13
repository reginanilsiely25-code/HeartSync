import Foundation

enum APIClientError: Error, Equatable {
    case invalidURL
    case missingDeviceUserId
    case invalidResponse
    case serverStatus(Int)
}

final class APIClient {
    private let baseURL: URL
    private let deviceUserIdProvider: () -> String?
    private let session: URLSession
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    init(
        baseURL: URL,
        deviceUserIdProvider: @escaping () -> String?,
        session: URLSession = .shared,
        encoder: JSONEncoder = JSONEncoder(),
        decoder: JSONDecoder = JSONDecoder()
    ) {
        self.baseURL = baseURL
        self.deviceUserIdProvider = deviceUserIdProvider
        self.session = session
        self.encoder = encoder
        self.decoder = decoder
    }

    func createOrReturnDeviceUser(_ request: DeviceUserRequest) async throws -> UserDTO {
        try await send("POST", path: "/users/device", body: request, requiresDeviceUserId: false)
    }

    func updateUser(userId: String, request: UpdateUserRequest) async throws -> UserDTO {
        try await send("PATCH", path: "/users/\(userId)", body: request)
    }

    func createCouple() async throws -> CoupleDTO {
        try await send("POST", path: "/couples", body: EmptyBody())
    }

    func joinCouple(code: String) async throws -> CoupleDTO {
        try await send("POST", path: "/couples/join", body: ["code": code])
    }

    func couple(id: String) async throws -> CoupleDTO {
        try await send("GET", path: "/couples/\(id)")
    }

    func syncCards(coupleId: String) async throws -> [SyncCardDTO] {
        try await send("GET", path: "/couples/\(coupleId)/sync-cards")
    }

    func createSyncCard(coupleId: String, request: SyncCardRequest) async throws -> SyncCardDTO {
        try await send("POST", path: "/couples/\(coupleId)/sync-cards", body: request)
    }

    func updateSyncCard(cardId: String, request: SyncCardRequest) async throws -> SyncCardDTO {
        try await send("PATCH", path: "/sync-cards/\(cardId)", body: request)
    }

    func deleteSyncCard(cardId: String) async throws {
        let _: EmptyResponse = try await send("DELETE", path: "/sync-cards/\(cardId)")
    }

    func dailySyncs(coupleId: String, from: String, to: String) async throws -> [DailySyncDTO] {
        try await send("GET", path: "/couples/\(coupleId)/daily-syncs", query: [
            URLQueryItem(name: "from", value: from),
            URLQueryItem(name: "to", value: to)
        ])
    }

    func putDailySync(coupleId: String, date: String, request: DailySyncRequest) async throws -> DailySyncDTO {
        try await send("PUT", path: "/couples/\(coupleId)/daily-syncs/\(date)", body: request)
    }

    func today(coupleId: String) async throws -> TodayDTO {
        try await send("GET", path: "/couples/\(coupleId)/today")
    }

    func plans(coupleId: String, from: String? = nil, to: String? = nil, status: PlanStatus? = nil) async throws -> [PlanDTO] {
        let query = [
            URLQueryItem(name: "from", value: from),
            URLQueryItem(name: "to", value: to),
            URLQueryItem(name: "status", value: status?.rawValue)
        ].filter { $0.value != nil }
        return try await send("GET", path: "/couples/\(coupleId)/plans", query: query)
    }

    func createPlan(coupleId: String, request: PlanRequest) async throws -> PlanDTO {
        try await send("POST", path: "/couples/\(coupleId)/plans", body: request)
    }

    func updatePlan(planId: String, request: PlanRequest) async throws -> PlanDTO {
        try await send("PATCH", path: "/plans/\(planId)", body: request)
    }

    func completePlan(planId: String) async throws -> PlanDTO {
        try await send("POST", path: "/plans/\(planId)/complete", body: EmptyBody())
    }

    func postponePlan(planId: String, request: PostponePlanRequest) async throws -> PlanDTO {
        try await send("POST", path: "/plans/\(planId)/postpone", body: request)
    }

    func insights(coupleId: String, period: InsightPeriod) async throws -> InsightDTO {
        try await send("GET", path: "/couples/\(coupleId)/insights", query: [
            URLQueryItem(name: "period", value: period.rawValue)
        ])
    }

    func generateInsight(coupleId: String, request: GenerateInsightRequest) async throws -> InsightDTO {
        try await send("POST", path: "/couples/\(coupleId)/insights/generate", body: request)
    }

    func llmAnalysis(coupleId: String, request: LLMAnalysisRequest) async throws -> LLMAnalysisDTO {
        try await send("POST", path: "/couples/\(coupleId)/llm-analysis", body: request)
    }

    func resetDemo() async throws {
        let _: EmptyResponse = try await send("POST", path: "/demo/reset", body: EmptyBody(), requiresDeviceUserId: false)
    }

    func health() async throws -> HealthDTO {
        try await send("GET", path: "/health", requiresDeviceUserId: false)
    }

    private func send<Response: Decodable>(
        _ method: String,
        path: String,
        query: [URLQueryItem] = [],
        requiresDeviceUserId: Bool = true
    ) async throws -> Response {
        let request = try makeRequest(method, path: path, query: query, requiresDeviceUserId: requiresDeviceUserId)
        return try await perform(request)
    }

    private func send<Body: Encodable, Response: Decodable>(
        _ method: String,
        path: String,
        query: [URLQueryItem] = [],
        body: Body,
        requiresDeviceUserId: Bool = true
    ) async throws -> Response {
        var request = try makeRequest(method, path: path, query: query, requiresDeviceUserId: requiresDeviceUserId)
        request.httpBody = try encoder.encode(body)
        return try await perform(request)
    }

    private func makeRequest(
        _ method: String,
        path: String,
        query: [URLQueryItem],
        requiresDeviceUserId: Bool
    ) throws -> URLRequest {
        guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            throw APIClientError.invalidURL
        }
        let basePath = components.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let endpointPath = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        components.path = "/" + [basePath, endpointPath]
            .filter { !$0.isEmpty }
            .joined(separator: "/")
        if !query.isEmpty {
            components.queryItems = query
        }
        guard let url = components.url else {
            throw APIClientError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if requiresDeviceUserId {
            guard let deviceUserId = deviceUserIdProvider(), !deviceUserId.isEmpty else {
                throw APIClientError.missingDeviceUserId
            }
            request.setValue(deviceUserId, forHTTPHeaderField: "X-Device-User-Id")
        }
        return request
    }

    private func perform<Response: Decodable>(_ request: URLRequest) async throws -> Response {
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            throw APIClientError.serverStatus(httpResponse.statusCode)
        }
        if data.isEmpty, Response.self == EmptyResponse.self {
            return EmptyResponse() as! Response
        }
        return try decoder.decode(Response.self, from: data)
    }
}

private struct EmptyBody: Encodable {}

private struct EmptyResponse: Decodable {}
