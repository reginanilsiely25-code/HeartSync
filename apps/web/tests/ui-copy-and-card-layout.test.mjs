import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("today sync cards use separated content and score rows", () => {
  const todayView = read("src/components/TodayView.tsx");
  const styles = read("src/styles/tokens.css");

  assert.match(todayView, /className="sync-card-main"/);
  assert.match(todayView, /className="sync-card-meta"/);
  assert.match(styles, /\.sync-card-main/);
  assert.match(styles, /\.sync-card-meta/);
});

test("core Web UI copy is localized to Chinese", () => {
  const source = [
    read("src/components/AppShell.tsx"),
    read("src/components/TodayView.tsx"),
    read("src/components/PromisesView.tsx"),
    read("src/components/ReviewView.tsx"),
    read("src/components/UsView.tsx"),
    read("src/state/demoSession.ts")
  ].join("\n");

  for (const phrase of ["今日同步", "约定计划", "关系回顾", "我们的空间", "提交今日状态", "添加约定"]) {
    assert.match(source, new RegExp(phrase));
  }

  for (const phrase of ["Daily sync", "Today", "Promises", "Review", "Sync today", "Add promise"]) {
    assert.doesNotMatch(source, new RegExp(`["'>]${phrase}["'<]`));
  }
});
