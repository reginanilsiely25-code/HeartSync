import SwiftUI

final class ReviewViewModel: ObservableObject {
    @Published var insight: InsightDTO
    @Published var selectedPeriod: InsightPeriod

    init(insight: InsightDTO = HeartSyncPreviewData.insight) {
        self.insight = insight
        self.selectedPeriod = insight.periodType
    }
}

struct ReviewView: View {
    @StateObject private var viewModel = ReviewViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    periodPicker
                    temperatureCard
                    metricsGrid
                    analysisSection
                    privateDraftSection
                }
                .padding()
            }
            .navigationTitle("Review")
        }
    }

    private var periodPicker: some View {
        Picker("Period", selection: $viewModel.selectedPeriod) {
            ForEach(InsightPeriod.allCases) { period in
                Text(period.rawValue.capitalized).tag(period)
            }
        }
        .pickerStyle(.segmented)
    }

    private var temperatureCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Relationship temperature")
                .font(.headline)
            HStack(alignment: .lastTextBaseline, spacing: 6) {
                Text("\(viewModel.insight.temperatureScore)")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                Text("/ 100")
                    .foregroundStyle(.secondary)
            }
            Text(viewModel.insight.templateSummary)
                .font(.callout)
                .foregroundStyle(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var metricsGrid: some View {
        let metrics = viewModel.insight.metrics
        return LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
            metricTile("Sync rate", "\(metrics.syncRatePercent)%")
            metricTile("Mood", String(format: "%.1f", metrics.averageMood))
            metricTile("Energy", String(format: "%.1f", metrics.averageEnergy))
            metricTile("Longing", String(format: "%.1f", metrics.averageLonging))
            metricTile("Low mood days", "\(metrics.lowMoodDays)")
            metricTile("Promises done", "\(metrics.completedPromises)")
        }
    }

    private var analysisSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Shared reflection")
                .font(.headline)

            if viewModel.insight.analysis.usedUnsafeFallback {
                Label(
                    "We used a safer local reflection because AI output was unavailable or unsuitable.",
                    systemImage: "shield.lefthalf.filled"
                )
                .font(.callout)
                .foregroundStyle(.orange)
            }

            Text(viewModel.insight.analysis.sharedSummary)
                .font(.body)
            Text(viewModel.insight.analysis.trendExplanation)
                .font(.callout)
                .foregroundStyle(.secondary)

            ForEach(viewModel.insight.analysis.suggestions, id: \.self) { suggestion in
                Label(suggestion, systemImage: "sparkle")
                    .font(.callout)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var privateDraftSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Private draft")
                .font(.headline)
            Text(viewModel.insight.analysis.privateMessageDraft)
                .font(.body)
                .foregroundStyle(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.blue.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private func metricTile(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3.weight(.semibold))
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}
