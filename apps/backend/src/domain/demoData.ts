import {
  prisma,
  type Couple,
  type CoupleMember,
  type DailySync,
  type HeartSyncState,
  type Plan,
  type SyncCard,
  type User
} from "../db/prisma";
import { pairingCodeExpiresAt } from "./pairing";

const demoUsersInput = [
  { deviceUserId: "alice-device", displayName: "Alice", avatarColor: "#E86A92" },
  { deviceUserId: "bao-device", displayName: "Bao", avatarColor: "#5B8DEF" }
];

export const demoCardsInput = [
  { title: "想你爆炸", emoji: "💗", color: "#E86A92", tags: ["miss"], defaultMoodScore: 4, defaultEnergyScore: 3, defaultLongingScore: 5 },
  { title: "电量不足", emoji: "🔋", color: "#7C8797", tags: ["tired"], defaultMoodScore: 2, defaultEnergyScore: 1, defaultLongingScore: 3 },
  { title: "需要抱抱", emoji: "🫂", color: "#B779E8", tags: ["comfort"], defaultMoodScore: 3, defaultEnergyScore: 2, defaultLongingScore: 4 },
  { title: "今天发光", emoji: "✨", color: "#F0B84A", tags: ["bright"], defaultMoodScore: 5, defaultEnergyScore: 5, defaultLongingScore: 2 }
];

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function resetDemoData(now = new Date()) {
  const createdAt = now.toISOString();
  const users: User[] = demoUsersInput.map((user, index) => ({
    id: index === 0 ? "demo_alice" : "demo_bao",
    ...user,
    createdAt,
    updatedAt: createdAt
  }));
  const couple: Couple = {
    id: "demo_couple",
    pairingCode: "HEART2",
    pairingCodeExpiresAt: pairingCodeExpiresAt(now).toISOString(),
    startedAt: createdAt,
    createdByUserId: users[0].id,
    createdAt,
    updatedAt: createdAt
  };
  const members: CoupleMember[] = [
    { coupleId: couple.id, userId: users[0].id, role: "creator", joinedAt: createdAt },
    { coupleId: couple.id, userId: users[1].id, role: "partner", joinedAt: createdAt }
  ];
  const syncCards: SyncCard[] = demoCardsInput.map((card, index) => ({
    id: `demo_card_${index + 1}`,
    coupleId: couple.id,
    ...card,
    isArchived: false,
    createdByUserId: users[index % 2].id,
    createdAt,
    updatedAt: createdAt
  }));

  const dailySyncs: DailySync[] = [];
  for (let dayOffset = -6; dayOffset <= 0; dayOffset += 1) {
    const syncDate = dateOnly(addDays(now, dayOffset));
    for (const [userIndex, user] of users.entries()) {
      const card = syncCards[(dayOffset + 6 + userIndex) % syncCards.length];
      const privateDay = (dayOffset === -5 && userIndex === 0) || (dayOffset === -2 && userIndex === 1);
      dailySyncs.push({
        id: `demo_sync_${dailySyncs.length + 1}`,
        coupleId: couple.id,
        userId: user.id,
        syncDate,
        cardId: card.id,
        moodScore: Math.max(1, Math.min(5, card.defaultMoodScore + (userIndex === 0 ? 0 : -1))),
        energyScore: card.defaultEnergyScore,
        longingScore: card.defaultLongingScore,
        tags: card.tags,
        note: privateDay ? "A quieter private reflection for myself." : `${user.displayName} checked in with ${card.title}.`,
        visibility: privateDay ? "private" : "partner_visible",
        createdAt,
        updatedAt: createdAt
      });
    }
  }

  const plans: Plan[] = [
    {
      id: "demo_plan_completed",
      coupleId: couple.id,
      title: "Finished tea date",
      type: "date",
      scheduledAt: addDays(now, -4).toISOString(),
      status: "completed",
      ownerUserId: users[0].id,
      completedAt: addDays(now, -4).toISOString(),
      postponedFrom: null,
      postponeReason: null,
      startPlaceName: "Alice home",
      startLatitude: null,
      startLongitude: null,
      destinationName: "Tea shop",
      destinationLatitude: null,
      destinationLongitude: null,
      notes: "A small completed promise.",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "demo_plan_postponed",
      coupleId: couple.id,
      title: "Postponed movie night",
      type: "joint_task",
      scheduledAt: addDays(now, 2).toISOString(),
      status: "postponed",
      ownerUserId: users[1].id,
      completedAt: null,
      postponedFrom: addDays(now, -1).toISOString(),
      postponeReason: "Work ran late",
      startPlaceName: "Home",
      startLatitude: null,
      startLongitude: null,
      destinationName: "Online room",
      destinationLatitude: null,
      destinationLongitude: null,
      notes: "Keep it gentle.",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "demo_plan_route",
      coupleId: couple.id,
      title: "Riverside walk",
      type: "date",
      scheduledAt: addDays(now, 5).toISOString(),
      status: "not_started",
      ownerUserId: users[0].id,
      completedAt: null,
      postponedFrom: null,
      postponeReason: null,
      startPlaceName: "People's Square",
      startLatitude: 31.2304,
      startLongitude: 121.4737,
      destinationName: "The Bund",
      destinationLatitude: 31.2401,
      destinationLongitude: 121.4908,
      notes: "Route-enabled demo plan.",
      createdAt,
      updatedAt: createdAt
    }
  ];

  const state: HeartSyncState = { users, couples: [couple], members, syncCards, dailySyncs, plans, insightReports: [] };
  prisma.resetAll(state);
  return {
    users,
    couple,
    members: prisma.membersForCouple(couple.id).map(({ user, ...member }) => ({ ...member, user })),
    syncCards,
    dailySyncs,
    plans
  };
}
