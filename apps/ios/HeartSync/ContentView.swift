import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            TodayView()
                .tabItem {
                    Label("今日同步", systemImage: "heart.text.square")
                }

            PromisesView()
                .tabItem {
                    Label("约定计划", systemImage: "calendar.badge.heart")
                }

            ReviewView()
                .tabItem {
                    Label("关系回顾", systemImage: "chart.line.uptrend.xyaxis")
                }

            UsView()
                .tabItem {
                    Label("我们的空间", systemImage: "person.2")
                }
        }
    }
}
