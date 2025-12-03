import { DDRAGON_VERSION } from '../config/constants';

export const PICK_ORDER = [
  { side: 'left', index: 0 },
  { side: 'right', index: 0 },
  { side: 'right', index: 1 },
  { side: 'left', index: 1 },
  { side: 'left', index: 2 },
  { side: 'right', index: 2 },
  { side: 'right', index: 3 },
  { side: 'left', index: 3 },
  { side: 'left', index: 4 },
  { side: 'right', index: 4 },
] as const;

export const CDN_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/`;
export const STORAGE_KEY = 'draft_planner_state_simple_v1';
