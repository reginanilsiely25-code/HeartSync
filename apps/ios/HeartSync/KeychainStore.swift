import Foundation
import Security

enum KeychainKey: String, CaseIterable {
    case deviceUserId = "heartsync.deviceUserId"
    case llmBaseURL = "heartsync.llm.baseURL"
    case llmModel = "heartsync.llm.model"
    case llmAPIKey = "heartsync.llm.apiKey"
}

protocol KeychainStoring: AnyObject {
    func set(_ value: String, for key: KeychainKey) throws
    func string(for key: KeychainKey) throws -> String?
    func delete(_ key: KeychainKey) throws
}

enum KeychainStoreError: Error, Equatable {
    case unexpectedStatus(OSStatus)
    case invalidData
}

final class KeychainStore: KeychainStoring {
    private let service: String

    init(service: String = "HeartSync") {
        self.service = service
    }

    func set(_ value: String, for key: KeychainKey) throws {
        let data = Data(value.utf8)
        let query = baseQuery(for: key)
        SecItemDelete(query as CFDictionary)

        var attributes = query
        attributes[kSecValueData as String] = data
        attributes[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly

        let status = SecItemAdd(attributes as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainStoreError.unexpectedStatus(status)
        }
    }

    func string(for key: KeychainKey) throws -> String? {
        var query = baseQuery(for: key)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecItemNotFound {
            return nil
        }
        guard status == errSecSuccess else {
            throw KeychainStoreError.unexpectedStatus(status)
        }
        guard let data = result as? Data, let value = String(data: data, encoding: .utf8) else {
            throw KeychainStoreError.invalidData
        }
        return value
    }

    func delete(_ key: KeychainKey) throws {
        let status = SecItemDelete(baseQuery(for: key) as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainStoreError.unexpectedStatus(status)
        }
    }

    private func baseQuery(for key: KeychainKey) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key.rawValue
        ]
    }
}

final class InMemoryKeychainStore: KeychainStoring {
    private var values: [KeychainKey: String] = [:]

    func set(_ value: String, for key: KeychainKey) throws {
        values[key] = value
    }

    func string(for key: KeychainKey) throws -> String? {
        values[key]
    }

    func delete(_ key: KeychainKey) throws {
        values.removeValue(forKey: key)
    }
}

final class LLMSettingsStore {
    private let keychain: KeychainStoring

    init(keychain: KeychainStoring = KeychainStore()) {
        self.keychain = keychain
    }

    var displayStatus: String {
        (try? status().label) ?? LLMSettingsStatus.unconfigured.label
    }

    func status() throws -> LLMSettingsStatus {
        let baseURL = try keychain.string(for: .llmBaseURL)
        let model = try keychain.string(for: .llmModel)
        let apiKey = try keychain.string(for: .llmAPIKey)

        if [baseURL, model, apiKey].allSatisfy({ value in
            guard let value else { return false }
            return !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }) {
            return .configured
        }
        return .unconfigured
    }

    func save(baseURL: String, model: String, apiKey: String) throws {
        try keychain.set(baseURL, for: .llmBaseURL)
        try keychain.set(model, for: .llmModel)
        try keychain.set(apiKey, for: .llmAPIKey)
    }

    func clear() throws {
        try keychain.delete(.llmBaseURL)
        try keychain.delete(.llmModel)
        try keychain.delete(.llmAPIKey)
    }

    func providerConfigForRequest() throws -> LLMProviderConfigDTO? {
        guard try status() == .configured,
              let baseURL = try keychain.string(for: .llmBaseURL),
              let model = try keychain.string(for: .llmModel),
              let apiKey = try keychain.string(for: .llmAPIKey) else {
            return nil
        }
        return LLMProviderConfigDTO(baseURL: baseURL, model: model, apiKey: apiKey)
    }
}
