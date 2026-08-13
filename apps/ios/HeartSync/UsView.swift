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
            saveMessage = "LLM 设置已保存"
        } catch {
            saveMessage = "LLM 设置保存失败"
        }
    }

    func clearLLMSettings() {
        do {
            try settingsStore.clear()
            baseURL = ""
            model = ""
            apiKey = ""
            refreshStatus()
            saveMessage = "LLM 设置已清除"
        } catch {
            saveMessage = "LLM 设置清除失败"
        }
    }
}

struct UsView: View {
    @StateObject private var viewModel = UsSettingsViewModel()

    var body: some View {
        NavigationStack {
            Form {
                Section("情侣空间") {
                    LabeledContent("空间", value: viewModel.couple.displayName ?? "HeartSync")
                    LabeledContent("配对码", value: viewModel.couple.pairingCode ?? "不可用")
                    LabeledContent("服务", value: viewModel.couple.serviceStatus ?? "未知")
                }

                Section("成员") {
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
                    LabeledContent("状态", value: viewModel.llmStatus.label)
                    TextField("服务地址", text: $viewModel.baseURL)
                        .textContentType(.URL)
                    TextField("模型", text: $viewModel.model)
                    SecureField("API 密钥", text: $viewModel.apiKey)

                    HStack {
                        Button("保存") {
                            viewModel.saveLLMSettings()
                        }
                        Button("清除", role: .destructive) {
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
            .navigationTitle("我们的空间")
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
