import { init } from "@instantdb/react";

// Define the schema types
export interface User {
  id: string;
  email: string;
  username: string;
  initialBalance: number;
  currentCash: number;
  riskProfile?: "low" | "medium" | "high";
  createdAt: number;
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  tradeDate: number;
  simulationDate: number;
}

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  avgCostPerShare: number;
  totalCost: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  addedAt: number;
}

export interface PortfolioSnapshot {
  id: string;
  userId: string;
  totalValue: number;
  cashBalance: number;
  positionsValue: number;
  profitLoss: number;
  profitLossPercent: number;
  snapshotDate: number;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementType: string;
  title: string;
  description: string;
  unlockedAt: number;
}

export interface Tournament {
  id: string;
  name: string;
  startingBalance: number;
  startDate: number;
  endDate: number;
  status: "upcoming" | "active" | "completed";
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  currentBalance: number;
  finalReturn?: number;
  rank?: number;
}

// Define the schema structure
type Schema = {
  users: User;
  trades: Trade;
  positions: Position;
  watchlist: WatchlistItem;
  portfolioSnapshots: PortfolioSnapshot;
  achievements: Achievement;
  tournaments: Tournament;
  tournamentParticipants: TournamentParticipant;
};

// Initialize InstantDB
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "";

if (!APP_ID) {
  console.error("❌ NEXT_PUBLIC_INSTANT_APP_ID is not set!");
}

export const db = init<Schema>({ appId: APP_ID });

