export type SelectableNote = {
  id: string;
  userId: string;
  syncDate: string;
  note: string;
  visibility: "partner_visible" | "private";
};

export type NoteSelectionInput = {
  notes: SelectableNote[];
  selectedNoteIds: string[];
  currentUserId: string;
};

export type SelectedNotes = {
  sharedNotes: string[];
  privateDraftNotes: string[];
};

function truncateNote(note: string): string {
  return note.slice(0, 120);
}

function newestFirst(a: SelectableNote, b: SelectableNote): number {
  return b.syncDate.localeCompare(a.syncDate);
}

export function selectNotes(input: NoteSelectionInput): SelectedNotes {
  const visibleNotes = input.notes.filter((note) => note.visibility === "partner_visible" && note.note.length > 0);
  const selectedVisibleNotes = input.selectedNoteIds
    .map((id) => visibleNotes.find((note) => note.id === id))
    .filter((note): note is SelectableNote => Boolean(note));

  const sharedSource = selectedVisibleNotes.length > 0
    ? selectedVisibleNotes
    : [...visibleNotes].sort(newestFirst);

  const privateDraftNotes = [...input.notes]
    .filter((note) => note.visibility === "private" && note.userId === input.currentUserId && note.note.length > 0)
    .sort(newestFirst)
    .slice(0, 1)
    .map((note) => truncateNote(note.note));

  return {
    sharedNotes: sharedSource.slice(0, 3).map((note) => truncateNote(note.note)),
    privateDraftNotes
  };
}
