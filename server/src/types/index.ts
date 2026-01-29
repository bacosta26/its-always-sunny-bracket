import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

export type BracketGroup = 'early' | 'late';
export type BracketStatus = 'active' | 'completed';
export type MatchupStatus = 'pending' | 'active' | 'completed';
export type LeagueStatus = 'setup' | 'drafting' | 'active' | 'completed';
export type ScoringType = 'bracket_based' | 'custom';
