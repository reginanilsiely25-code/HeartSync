import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            TodayView()
                .tabItem {
                    Label("Today", systemImage: "heart.text.square")
                }

            PromisesView()
                .tabItem {
                    Label("Promises", systemImage: "calendar.badge.heart")
                }

            ReviewView()
                .tabItem {
                    Label("Review", systemImage: "chart.line.uptrend.xyaxis")
                }

            UsView()
                .tabItem {
                    Label("Us", systemImage: "person.2")
                }
        }
    }
}
