import Foundation
import MapKit
import SwiftUI

#if canImport(UIKit)
import UIKit
typealias HeartSyncImage = UIImage
#elseif canImport(AppKit)
import AppKit
typealias HeartSyncImage = NSImage
#endif

struct RouteCoordinate: Equatable {
    let latitude: Double
    let longitude: Double

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

struct RouteSnapshotRequest: Equatable {
    let start: RouteCoordinate
    let destination: RouteCoordinate

    init?(plan: PlanDTO) {
        guard let startLatitude = plan.startLatitude,
              let startLongitude = plan.startLongitude,
              let destinationLatitude = plan.destinationLatitude,
              let destinationLongitude = plan.destinationLongitude else {
            return nil
        }
        self.start = RouteCoordinate(latitude: startLatitude, longitude: startLongitude)
        self.destination = RouteCoordinate(latitude: destinationLatitude, longitude: destinationLongitude)
    }
}

struct RouteSnapshotResult {
    let request: RouteSnapshotRequest
    let image: HeartSyncImage?
}

protocol RouteSnapshotServing {
    func snapshot(for plan: PlanDTO, size: CGSize) async throws -> RouteSnapshotResult?
}

final class RouteSnapshotService: RouteSnapshotServing {
    func snapshot(for plan: PlanDTO, size: CGSize) async throws -> RouteSnapshotResult? {
        guard let request = RouteSnapshotRequest(plan: plan) else {
            return nil
        }

        let options = MKMapSnapshotter.Options()
        options.size = size
        options.region = MKCoordinateRegion(
            center: midpoint(start: request.start.coordinate, destination: request.destination.coordinate),
            span: MKCoordinateSpan(latitudeDelta: routeSpanDelta(request), longitudeDelta: routeSpanDelta(request))
        )

        let snapshot = try await MKMapSnapshotter(options: options).start()

        #if canImport(UIKit)
        let rendered = drawRoute(request: request, snapshot: snapshot, size: size)
        return RouteSnapshotResult(request: request, image: rendered)
        #else
        return RouteSnapshotResult(request: request, image: snapshot.image)
        #endif
    }

    private func midpoint(start: CLLocationCoordinate2D, destination: CLLocationCoordinate2D) -> CLLocationCoordinate2D {
        CLLocationCoordinate2D(
            latitude: (start.latitude + destination.latitude) / 2,
            longitude: (start.longitude + destination.longitude) / 2
        )
    }

    private func routeSpanDelta(_ request: RouteSnapshotRequest) -> CLLocationDegrees {
        let latitudeDelta = abs(request.start.latitude - request.destination.latitude)
        let longitudeDelta = abs(request.start.longitude - request.destination.longitude)
        return max(latitudeDelta, longitudeDelta, 0.02) * 1.8
    }

    #if canImport(UIKit)
    private func drawRoute(
        request: RouteSnapshotRequest,
        snapshot: MKMapSnapshotter.Snapshot,
        size: CGSize
    ) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            snapshot.image.draw(at: .zero)

            let startPoint = snapshot.point(for: request.start.coordinate)
            let destinationPoint = snapshot.point(for: request.destination.coordinate)
            let path = UIBezierPath()
            path.move(to: startPoint)
            path.addLine(to: destinationPoint)
            UIColor.systemPink.setStroke()
            path.lineWidth = 4
            path.stroke()

            UIColor.white.setFill()
            UIColor.systemPink.setStroke()
            [startPoint, destinationPoint].forEach { point in
                let marker = CGRect(x: point.x - 6, y: point.y - 6, width: 12, height: 12)
                context.cgContext.fillEllipse(in: marker)
                context.cgContext.strokeEllipse(in: marker)
            }
        }
    }
    #endif
}

enum AppleMapsOpenHelper {
    static func openRoute(for plan: PlanDTO) {
        #if os(iOS)
        guard let request = RouteSnapshotRequest(plan: plan) else {
            return
        }

        let startPlacemark = MKPlacemark(coordinate: request.start.coordinate)
        let destinationPlacemark = MKPlacemark(coordinate: request.destination.coordinate)
        let start = MKMapItem(placemark: startPlacemark)
        let destination = MKMapItem(placemark: destinationPlacemark)
        start.name = plan.startPlaceName ?? "Start"
        destination.name = plan.destinationName ?? "Destination"

        MKMapItem.openMaps(
            with: [start, destination],
            launchOptions: [MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeTransit]
        )
        #else
        _ = plan
        #endif
    }
}

final class FakeRouteSnapshotService: RouteSnapshotServing {
    private(set) var requestedPlanIds: [String] = []

    func snapshot(for plan: PlanDTO, size: CGSize) async throws -> RouteSnapshotResult? {
        guard let request = RouteSnapshotRequest(plan: plan) else {
            return nil
        }
        requestedPlanIds.append(plan.id)
        return RouteSnapshotResult(request: request, image: nil)
    }
}
