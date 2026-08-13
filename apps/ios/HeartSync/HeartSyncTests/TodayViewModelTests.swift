import XCTest
@testable import HeartSync

final class TodayViewModelTests: XCTestCase {
    func testDailySyncVisibilityUsesBackendRawValues() throws {
        XCTAssertEqual(DailySyncVisibility.partnerVisible.rawValue, "partner_visible")
        XCTAssertEqual(DailySyncVisibility.private.rawValue, "private")

        let decoded = try JSONDecoder().decode(
            DailySyncVisibility.self,
            from: Data(#""partner_visible""#.utf8)
        )

        XCTAssertEqual(decoded, .partnerVisible)
    }

    func testTodayStateMapsSyncedPrivateAndWaitingStatuses() {
        let currentUser = UserDTO(
            id: "user-a",
            deviceUserId: "device-a",
            displayName: "Ava",
            avatarColor: "#E85D75"
        )
        let partner = UserDTO(
            id: "user-b",
            deviceUserId: "device-b",
            displayName: "Bo",
            avatarColor: "#3E8EDE"
        )
        let card = SyncCardDTO(
            id: "card-1",
            title: "Need a hug",
            emoji: "hug",
            colorHex: "#FFE0E6",
            tags: ["tired"],
            defaultMoodScore: 2,
            defaultEnergyScore: 2,
            defaultLongingScore: 5,
            archived: false
        )
        let privateSync = DailySyncDTO(
            id: "sync-1",
            userId: partner.id,
            syncDate: "2026-08-13",
            cardId: card.id,
            card: card,
            moodScore: 2,
            energyScore: 2,
            longingScore: 5,
            tags: ["tired"],
            note: "Hidden from shared surfaces",
            visibility: .private
        )
        let dto = TodayDTO(
            date: "2026-08-13",
            currentUserId: currentUser.id,
            members: [
                TodayMemberDTO(user: currentUser, hasSynced: false, sync: nil),
                TodayMemberDTO(user: partner, hasSynced: true, sync: privateSync)
            ],
            cards: [card]
        )

        let state = TodayViewModel.State(dto: dto, selectedCardId: card.id)

        XCTAssertEqual(state.memberStates.map(\.status), [.waiting, .syncedPrivate])
        XCTAssertEqual(state.memberStates[1].cardTitle, "Private check-in")
        XCTAssertNil(state.memberStates[1].note)
        XCTAssertEqual(state.form.moodScore, 2)
        XCTAssertEqual(state.form.energyScore, 2)
        XCTAssertEqual(state.form.longingScore, 5)
        XCTAssertEqual(state.form.visibility, .partnerVisible)
    }
}
