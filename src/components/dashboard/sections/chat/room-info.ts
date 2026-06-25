export interface RoomInfo {
  id: string;
  name: string;
  type: 'worker' | 'team' | 'manager' | 'human' | 'unknown';
  members: string[];
  parentTeam?: string;
  matrixUserId?: string;
  phase?: string;
}
