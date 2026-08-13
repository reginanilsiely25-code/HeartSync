import { describe, expect, it } from "vitest";
import { selectNotes } from "../../src/domain/notes";

describe("note selection", () => {
  const notes = [
    { id: "old", userId: "u1", syncDate: "2026-08-01", note: "old visible", visibility: "partner_visible" as const },
    { id: "selected", userId: "u1", syncDate: "2026-08-02", note: "selected", visibility: "partner_visible" as const },
    { id: "latest", userId: "u2", syncDate: "2026-08-03", note: "latest visible", visibility: "partner_visible" as const },
    { id: "private", userId: "u1", syncDate: "2026-08-04", note: "private latest", visibility: "private" as const }
  ];

  it("prefers explicitly selected partner-visible notes", () => {
    const selected = selectNotes({
      notes,
      selectedNoteIds: ["selected"],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes).toEqual(["selected"]);
  });

  it("caps selected partner-visible notes at 3 in selected order", () => {
    const selected = selectNotes({
      notes: [
        ...notes,
        { id: "fourth", userId: "u2", syncDate: "2026-08-05", note: "fourth visible", visibility: "partner_visible" as const }
      ],
      selectedNoteIds: ["old", "selected", "latest", "fourth"],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes).toEqual(["old visible", "selected", "latest visible"]);
  });

  it("uses latest 3 partner-visible notes when no explicit selection exists", () => {
    const selected = selectNotes({
      notes,
      selectedNoteIds: [],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes).toEqual(["latest visible", "selected", "old visible"]);
  });

  it("excludes private notes from shared inputs and allows latest current-user private note for private draft", () => {
    const selected = selectNotes({
      notes,
      selectedNoteIds: [],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes).not.toContain("private latest");
    expect(selected.privateDraftNotes).toEqual(["private latest"]);
  });

  it("truncates selected notes to 120 characters", () => {
    const longNote = "x".repeat(140);
    const selected = selectNotes({
      notes: [{ id: "long", userId: "u1", syncDate: "2026-08-05", note: longNote, visibility: "partner_visible" }],
      selectedNoteIds: ["long"],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes[0]).toHaveLength(120);
  });
});
