import SwiftUI

final class TodayViewModel: ObservableObject {
    @Published var dto: TodayDTO
    @Published var selectedCardId: String
    @Published var moodScore: Double
    @Published var energyScore: Double
    @Published var longingScore: Double
    @Published var note: String
    @Published var visibility: DailySyncVisibility

    init(dto: TodayDTO = HeartSyncPreviewData.today) {
        self.dto = dto
        let firstCard = dto.cards.first
        self.selectedCardId = firstCard?.id ?? ""
        self.moodScore = Double(firstCard?.defaultMoodScore ?? 3)
        self.energyScore = Double(firstCard?.defaultEnergyScore ?? 3)
        self.longingScore = Double(firstCard?.defaultLongingScore ?? 3)
        self.note = ""
        self.visibility = .partnerVisible
    }

    var state: State {
        State(
            dto: dto,
            selectedCardId: selectedCardId,
            note: note,
            visibility: visibility
        )
    }

    func selectCard(id: String) {
        selectedCardId = id
        guard let card = dto.cards.first(where: { $0.id == id }) else {
            return
        }
        moodScore = Double(card.defaultMoodScore)
        energyScore = Double(card.defaultEnergyScore)
        longingScore = Double(card.defaultLongingScore)
    }

    struct State: Equatable {
        let date: String
        let memberStates: [TodayMemberState]
        let cards: [SyncCardDTO]
        let form: DailySyncFormState

        init(
            dto: TodayDTO,
            selectedCardId: String,
            note: String = "",
            visibility: DailySyncVisibility = .partnerVisible
        ) {
            let selectedCard = dto.cards.first(where: { $0.id == selectedCardId }) ?? dto.cards.first
            self.date = dto.date
            self.memberStates = dto.members.map(TodayMemberState.init)
            self.cards = dto.cards
            self.form = DailySyncFormState(
                selectedCardId: selectedCard?.id ?? "",
                moodScore: selectedCard?.defaultMoodScore ?? 3,
                energyScore: selectedCard?.defaultEnergyScore ?? 3,
                longingScore: selectedCard?.defaultLongingScore ?? 3,
                note: note,
                visibility: visibility
            )
        }
    }
}

struct TodayMemberState: Equatable, Identifiable {
    enum Status: Equatable {
        case waiting
        case syncedVisible
        case syncedPrivate
    }

    let id: String
    let displayName: String
    let status: Status
    let statusText: String
    let cardTitle: String
    let moodScore: Int?
    let energyScore: Int?
    let longingScore: Int?
    let note: String?

    init(member: TodayMemberDTO) {
        self.id = member.user.id
        self.displayName = member.user.displayName

        guard member.hasSynced, let sync = member.sync else {
            self.status = .waiting
            self.statusText = "Waiting"
            self.cardTitle = "No check-in yet"
            self.moodScore = nil
            self.energyScore = nil
            self.longingScore = nil
            self.note = nil
            return
        }

        if sync.visibility == .private {
            self.status = .syncedPrivate
            self.statusText = "Synced privately"
            self.cardTitle = "Private check-in"
            self.moodScore = nil
            self.energyScore = nil
            self.longingScore = nil
            self.note = nil
        } else {
            self.status = .syncedVisible
            self.statusText = "Synced"
            self.cardTitle = sync.card?.title ?? "Shared check-in"
            self.moodScore = sync.moodScore
            self.energyScore = sync.energyScore
            self.longingScore = sync.longingScore
            self.note = sync.note
        }
    }
}

struct DailySyncFormState: Equatable {
    let selectedCardId: String
    let moodScore: Int
    let energyScore: Int
    let longingScore: Int
    let note: String
    let visibility: DailySyncVisibility
}

struct TodayView: View {
    @StateObject private var viewModel = TodayViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    memberStatusSection
                    syncFormSection
                }
                .padding()
            }
            .navigationTitle("Today")
        }
    }

    private var memberStatusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Daily rhythm")
                .font(.headline)

            ForEach(viewModel.state.memberStates) { member in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(member.displayName)
                            .font(.subheadline.weight(.semibold))
                        Spacer()
                        Text(member.statusText)
                            .font(.caption.weight(.medium))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(statusColor(member.status).opacity(0.14))
                            .foregroundStyle(statusColor(member.status))
                            .clipShape(Capsule())
                    }

                    Text(member.cardTitle)
                        .font(.body)

                    if let mood = member.moodScore,
                       let energy = member.energyScore,
                       let longing = member.longingScore {
                        HStack(spacing: 12) {
                            scorePill("Mood", mood)
                            scorePill("Energy", energy)
                            scorePill("Longing", longing)
                        }
                    }

                    if let note = member.note, !note.isEmpty {
                        Text(note)
                            .font(.callout)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
                .background(.thinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            }
        }
    }

    private var syncFormSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Your check-in")
                .font(.headline)

            Picker("Card", selection: Binding(
                get: { viewModel.selectedCardId },
                set: { viewModel.selectCard(id: $0) }
            )) {
                ForEach(viewModel.dto.cards) { card in
                    Text("\(card.emoji) \(card.title)").tag(card.id)
                }
            }
            .pickerStyle(.menu)

            scoreSlider("Mood", value: $viewModel.moodScore)
            scoreSlider("Energy", value: $viewModel.energyScore)
            scoreSlider("Longing", value: $viewModel.longingScore)

            TextEditor(text: $viewModel.note)
                .frame(minHeight: 92)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(.quaternary)
                )
                .accessibilityLabel("Note")

            Picker("Visibility", selection: $viewModel.visibility) {
                ForEach(DailySyncVisibility.allCases) { visibility in
                    Text(visibility.label).tag(visibility)
                }
            }
            .pickerStyle(.segmented)

            Button {
            } label: {
                Label("Save check-in", systemImage: "heart.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private func scoreSlider(_ title: String, value: Binding<Double>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                Spacer()
                Text("\(Int(value.wrappedValue.rounded()))")
                    .font(.subheadline.monospacedDigit())
            }
            Slider(value: value, in: 1...5, step: 1)
        }
    }

    private func scorePill(_ title: String, _ value: Int) -> some View {
        Label("\(title) \(value)", systemImage: "circle.fill")
            .font(.caption)
            .foregroundStyle(.secondary)
    }

    private func statusColor(_ status: TodayMemberState.Status) -> Color {
        switch status {
        case .waiting:
            return .orange
        case .syncedVisible:
            return .green
        case .syncedPrivate:
            return .blue
        }
    }
}
