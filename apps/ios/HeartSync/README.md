# HeartSync iOS Native Slice

This directory contains the Swift source and XCTest files for Task 5, the iOS Native Excellence Slice.

No `.xcodeproj` or `.xcworkspace` is committed in this worktree because the repository currently contains only source/spec files and Xcode project metadata is normally generated and owned locally by Xcode. To run this slice in Xcode:

1. Create a new iOS App project named `HeartSync`.
2. Add the Swift files in this directory to the app target:
   - `HeartSyncApp.swift`
   - `Models.swift`
   - `APIClient.swift`
   - `KeychainStore.swift`
   - `RouteSnapshotService.swift`
   - `ContentView.swift`
   - `TodayView.swift`
   - `PromisesView.swift`
   - `ReviewView.swift`
   - `UsView.swift`
3. Add files under `HeartSyncTests/` to the test target.
4. Ensure the app target links `SwiftUI`, `MapKit`, and `Security`.
5. Run tests with a simulator, for example:

```sh
xcodebuild test -scheme HeartSync -destination 'platform=iOS Simulator,name=iPhone 16'
```

The source includes preview data so the app can launch before the backend from the broader HeartSync plan is available.
