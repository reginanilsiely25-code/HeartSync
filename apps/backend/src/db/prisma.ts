export type DailySyncVisibility = "partner_visible" | "private";
export type PlanType = "date" | "anniversary" | "joint_task";
export type PlanStatus = "not_started" | "in_progress" | "completed" | "postponed" | "overdue";

export type User = {
  id: string;
  deviceUserId: string;
  displayName: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
};

export type Couple = {
  id: string;
  pairingCode: string;
  pairingCodeExpiresAt: string;
  startedAt: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type CoupleMember = {
  coupleId: string;
  userId: string;
  role: "creator" | "partner";
  joinedAt: string;
};

export type SyncCard = {
  id: string;
  coupleId: string;
  title: string;
  emoji: string;
  color: string;
  tags: string[];
  defaultMoodScore: number;
  defaultEnergyScore: number;
  defaultLongingScore: number;
  isArchived: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type DailySync = {
  id: string;
  coupleId: string;
  userId: string;
  syncDate: string;
  cardId: string;
  moodScore: number;
  energyScore: number;
  longingScore: number;
  tags: string[];
  note: string;
  visibility: DailySyncVisibility;
  createdAt: string;
  updatedAt: string;
};

export type Plan = {
  id: string;
  coupleId: string;
  title: string;
  type: PlanType;
  scheduledAt: string;
  status: PlanStatus;
  ownerUserId: string;
  completedAt: string | null;
  postponedFrom: string | null;
  postponeReason: string | null;
  startPlaceName: string;
  startLatitude: number | null;
  startLongitude: number | null;
  destinationName: string;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type InsightReport = {
  id: string;
  coupleId: string;
  periodType: "week" | "month";
  periodStart: string;
  periodEnd: string;
  temperatureScore: number;
  metrics: unknown;
  sharedSummary: string;
  trendExplanation: string;
  suggestions: string[];
  privateSuggestions: Array<{ userId: string; messageDraft: string }>;
  riskFlags: string[];
  fallbackUsed: boolean;
  generatedAt: string;
};

export type HeartSyncState = {
  users: User[];
  couples: Couple[];
  members: CoupleMember[];
  syncCards: SyncCard[];
  dailySyncs: DailySync[];
  plans: Plan[];
  insightReports: InsightReport[];
};

export class InMemoryPrisma {
  state: HeartSyncState = this.emptyState();
  private counters = new Map<string, number>();

  resetAll(nextState?: HeartSyncState) {
    this.state = nextState ?? this.emptyState();
    this.counters = new Map<string, number>();
  }

  id(prefix: string) {
    const next = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, next);
    return `${prefix}_${next.toString().padStart(4, "0")}`;
  }

  now() {
    return new Date().toISOString();
  }

  userByDevice(deviceUserId: string) {
    return this.state.users.find((user) => user.deviceUserId === deviceUserId);
  }

  userById(userId: string) {
    return this.state.users.find((user) => user.id === userId);
  }

  coupleById(coupleId: string) {
    return this.state.couples.find((couple) => couple.id === coupleId);
  }

  member(coupleId: string, userId: string) {
    return this.state.members.find((member) => member.coupleId === coupleId && member.userId === userId);
  }

  coupleForUser(userId: string) {
    const membership = this.state.members.find((member) => member.userId === userId);
    return membership ? this.coupleById(membership.coupleId) : undefined;
  }

  membersForCouple(coupleId: string) {
    return this.state.members
      .filter((member) => member.coupleId === coupleId)
      .map((member) => ({ ...member, user: this.userById(member.userId) }))
      .filter((member): member is CoupleMember & { user: User } => Boolean(member.user));
  }

  emptyState(): HeartSyncState {
    return {
      users: [],
      couples: [],
      members: [],
      syncCards: [],
      dailySyncs: [],
      plans: [],
      insightReports: []
    };
  }
}

export const prisma = new InMemoryPrisma();
