import SwiftUI

@MainActor
final class UsSettingsViewModel: ObservableObject {
    @Published var couple: CoupleDTO
    @Published var baseURL: String = ""
    @Published var model: String = ""
    @Published var apiKey: String = ""
    @Published private(set) var llmStatus: LLMSettingsStatus = .unconfigured
    @Published var saveMessage: String?

    private let settingsStore: LLMSettingsStore

    init(
        couple: CoupleDTO = HeartSyncPreviewData.couple,
        settingsStore: LLMSettingsStore = LLMSettingsStore()
    ) {
        self.couple = couple
        self.settingsStore = settingsStore
        refreshStatus()
    }

    func refreshStatus() {
        llmStatus = (try? settingsStore.status()) ?? .unconfigured
    }

    func saveLLMSettings() {
        do {
            try settingsStore.save(baseURL: baseURL, model: model, apiKey: apiKey)
            apiKey = ""
            refreshStatus()
            saveMessage = "LLM setting saved"
        } catch {
            saveMessage = "Could not save LLM setting"
        }
    }

    func clearLLMSettings() {
        do {
            try settingsStore.clear()
            baseURL = ""
            model = ""
            apiKey = ""
            refreshStatus()
            saveMessage = "LLM setting cleared"
        } catch {
            saveMessage = "Could not clear LLM setting"
        }
    }
}

struct UsView: View {
    @StateObject private var viewModel = UsSettingsViewModel()

    var body: some View {
        NavigationStack {
            Form {
                Section("Couple") {
                    LabeledContent("Space", value: viewModel.couple.displayName ?? "HeartSync")
                    LabeledContent("Pairing code", value: viewModel.couple.pairingCode ?? "Unavailable")
                    LabeledContent("Service", value: viewModel.couple.serviceStatus ?? "Unknown")
                }

                Section("Members") {
                    ForEach(viewModel.couple.members) { member in
                        HStack {
                            Circle()
                                .fill(Color(hex: member.avatarColor))
                                .frame(width: 14, height: 14)
                            Text(member.displayName)
                            Spacer()
                        }
                    }
                }

                Section("LLM") {
                    LabeledContent("Status", value: viewModel.llmStatus.label)
                    TextField("Base URL", text: $viewModel.baseURL)
                        .textContentType(.URL)
                    TextField("Model", text: $viewModel.model)
                    SecureField("API key", text: $viewModel.apiKey)

                    HStack {
                        Button("Save") {
                            viewModel.saveLLMSettings()
                        }
                        Button("Clear", role: .destructive) {
                            viewModel.clearLLMSettings()
                        }
                    }

                    if let saveMessage = viewModel.saveMessage {
                        Text(saveMessage)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Us")
        }
    }
}

private extension Color {
    init(hex: String) {
        let sanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&value)

        let red: Double
        let green: Double
        let blue: Double

        switch sanitized.count {
        case 6:
            red = Double((value & 0xFF0000) >> 16) / 255
            green = Double((value & 0x00FF00) >> 8) / 255
            blue = Double(value & 0x0000FF) / 255
        default:
            red = 0.8
            green = 0.2
            blue = 0.35
        }

        self.init(red: red, green: green, blue: blue)
    }
}
