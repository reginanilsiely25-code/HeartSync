import XCTest
@testable import HeartSync

final class KeychainStoreTests: XCTestCase {
    func testInMemoryKeychainStoreRoundTripsAndDeletesValues() throws {
        let store = InMemoryKeychainStore()

        try store.set("sk-test-value", for: .llmAPIKey)

        XCTAssertEqual(try store.string(for: .llmAPIKey), "sk-test-value")

        try store.delete(.llmAPIKey)

        XCTAssertNil(try store.string(for: .llmAPIKey))
    }

    func testLLMSettingsReportConfiguredStateWithoutExposingRawKey() throws {
        let keychain = InMemoryKeychainStore()
        let settings = LLMSettingsStore(keychain: keychain)

        XCTAssertEqual(try settings.status(), .unconfigured)

        try settings.save(baseURL: "https://api.example.com/v1", model: "gpt-test", apiKey: "sk-secret")

        XCTAssertEqual(try settings.status(), .configured)
        XCTAssertEqual(try keychain.string(for: .llmBaseURL), "https://api.example.com/v1")
        XCTAssertEqual(try keychain.string(for: .llmModel), "gpt-test")
        XCTAssertEqual(settings.displayStatus, "Configured")

        try settings.clear()

        XCTAssertEqual(try settings.status(), .unconfigured)
    }
}
