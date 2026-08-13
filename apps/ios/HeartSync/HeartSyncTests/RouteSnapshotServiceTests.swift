import XCTest
@testable import HeartSync

final class RouteSnapshotServiceTests: XCTestCase {
    func testPlanStatusUsesBackendRawValues() throws {
        XCTAssertEqual(PlanStatus.notStarted.rawValue, "not_started")
        XCTAssertEqual(PlanStatus.inProgress.rawValue, "in_progress")
        XCTAssertEqual(PlanStatus.completed.rawValue, "completed")
        XCTAssertEqual(PlanStatus.postponed.rawValue, "postponed")

        let decoded = try JSONDecoder().decode(PlanStatus.self, from: Data(#""in_progress""#.utf8))
        XCTAssertEqual(decoded, .inProgress)
    }

    func testRouteSnapshotRequestIsNilWhenAnyCoordinateIsMissing() {
        let plan = PlanDTO.fixture(
            startLatitude: 31.2304,
            startLongitude: 121.4737,
            destinationLatitude: nil,
            destinationLongitude: 121.4998
        )

        XCTAssertNil(RouteSnapshotRequest(plan: plan))
        XCTAssertFalse(plan.hasCompleteRouteCoordinates)
    }

    func testRouteSnapshotRequestExistsWhenAllCoordinatesArePresent() {
        let plan = PlanDTO.fixture(
            startLatitude: 31.2304,
            startLongitude: 121.4737,
            destinationLatitude: 31.2397,
            destinationLongitude: 121.4998
        )

        let request = RouteSnapshotRequest(plan: plan)

        XCTAssertNotNil(request)
        XCTAssertEqual(request?.start.latitude, 31.2304, accuracy: 0.0001)
        XCTAssertEqual(request?.destination.longitude, 121.4998, accuracy: 0.0001)
        XCTAssertTrue(plan.hasCompleteRouteCoordinates)
    }
}

private extension PlanDTO {
    static func fixture(
        startLatitude: Double?,
        startLongitude: Double?,
        destinationLatitude: Double?,
        destinationLongitude: Double?
    ) -> PlanDTO {
        PlanDTO(
            id: "plan-1",
            coupleId: "couple-1",
            title: "Riverside walk",
            type: .date,
            scheduledAt: "2026-08-14T10:00:00Z",
            status: .notStarted,
            ownerUserId: "user-a",
            completedAt: nil,
            postponedFrom: nil,
            postponeReason: nil,
            startPlaceName: "Home",
            startLatitude: startLatitude,
            startLongitude: startLongitude,
            destinationName: "Museum",
            destinationLatitude: destinationLatitude,
            destinationLongitude: destinationLongitude,
            notes: "Bring tea"
        )
    }
}
