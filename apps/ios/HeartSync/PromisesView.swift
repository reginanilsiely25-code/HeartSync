import SwiftUI

@MainActor
final class PromisesViewModel: ObservableObject {
    @Published var plans: [PlanDTO]
    @Published var snapshots: [String: RouteSnapshotResult] = [:]
    private let routeSnapshotService: RouteSnapshotServing

    init(
        plans: [PlanDTO] = HeartSyncPreviewData.plans,
        routeSnapshotService: RouteSnapshotServing = RouteSnapshotService()
    ) {
        self.plans = plans
        self.routeSnapshotService = routeSnapshotService
    }

    func loadRouteSnapshots() async {
        for plan in plans where plan.hasCompleteRouteCoordinates {
            if let result = try? await routeSnapshotService.snapshot(for: plan, size: CGSize(width: 640, height: 320)) {
                snapshots[plan.id] = result
            }
        }
    }

    func hasRouteSnapshotRequest(for plan: PlanDTO) -> Bool {
        RouteSnapshotRequest(plan: plan) != nil
    }
}

struct PromisesView: View {
    @StateObject private var viewModel = PromisesViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 14) {
                    ForEach(viewModel.plans) { plan in
                        PromiseCard(
                            plan: plan,
                            snapshot: viewModel.snapshots[plan.id],
                            canOpenMaps: viewModel.hasRouteSnapshotRequest(for: plan)
                        )
                    }
                }
                .padding()
            }
            .navigationTitle("Promises")
            .task {
                await viewModel.loadRouteSnapshots()
            }
        }
    }
}

private struct PromiseCard: View {
    let plan: PlanDTO
    let snapshot: RouteSnapshotResult?
    let canOpenMaps: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            routeCover

            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(plan.title)
                        .font(.headline)
                    Text("\(plan.type.label) - \(formattedDate(plan.scheduledAt))")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text(plan.status.label)
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 9)
                    .padding(.vertical, 5)
                    .background(.pink.opacity(0.12))
                    .foregroundStyle(.pink)
                    .clipShape(Capsule())
            }

            if let notes = plan.notes, !notes.isEmpty {
                Text(notes)
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }

            Button {
                AppleMapsOpenHelper.openRoute(for: plan)
            } label: {
                Label("Open in Maps", systemImage: "map")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .disabled(!canOpenMaps)
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    @ViewBuilder
    private var routeCover: some View {
        if let image = snapshot?.image {
            #if canImport(UIKit)
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(height: 150)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            #elseif canImport(AppKit)
            Image(nsImage: image)
                .resizable()
                .scaledToFill()
                .frame(height: 150)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            #endif
        } else {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: canOpenMaps ? "map" : "mappin.slash")
                    .font(.title2)
                Text(canOpenMaps ? "Route snapshot loading" : "Add all route coordinates for a map cover")
                    .font(.subheadline.weight(.medium))
                Text(routeText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, minHeight: 150, alignment: .leading)
            .padding()
            .background(.pink.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
    }

    private var routeText: String {
        let start = plan.startPlaceName ?? "Start not set"
        let destination = plan.destinationName ?? "Destination not set"
        return "\(start) to \(destination)"
    }

    private func formattedDate(_ value: String) -> String {
        value.replacingOccurrences(of: "T", with: " ").replacingOccurrences(of: "Z", with: "")
    }
}
