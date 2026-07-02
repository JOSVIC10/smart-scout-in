import { TacticalSlot } from './gameModelApi'

// Helper to define slots easily. 
// y=0 is opponent's goal, y=100 is our goal.
// x=0 is left sideline, x=100 is right sideline.
function createSlot(id: string, position: string, x: number, y: number): TacticalSlot {
  return { id, position, x, y, playerId: null }
}

export const FORMATIONS: Record<string, TacticalSlot[]> = {
  '4-3-3': [
    createSlot('GK-1', 'GK', 50, 95),
    createSlot('LB-1', 'FB', 15, 75),
    createSlot('CB-1', 'CB', 35, 80),
    createSlot('CB-2', 'CB', 65, 80),
    createSlot('RB-1', 'FB', 85, 75),
    createSlot('DM-1', 'DM', 50, 60),
    createSlot('CM-1', 'CM', 30, 45),
    createSlot('CM-2', 'CM', 70, 45),
    createSlot('LW-1', 'W',  15, 25),
    createSlot('ST-1', 'ST', 50, 15),
    createSlot('RW-1', 'W',  85, 25),
  ],
  '4-2-3-1': [
    createSlot('GK-1', 'GK', 50, 95),
    createSlot('LB-1', 'FB', 15, 75),
    createSlot('CB-1', 'CB', 35, 80),
    createSlot('CB-2', 'CB', 65, 80),
    createSlot('RB-1', 'FB', 85, 75),
    createSlot('DM-1', 'DM', 35, 60),
    createSlot('DM-2', 'DM', 65, 60),
    createSlot('LW-1', 'W',  15, 35),
    createSlot('AM-1', 'AM', 50, 35),
    createSlot('RW-1', 'W',  85, 35),
    createSlot('ST-1', 'ST', 50, 15),
  ],
  '4-4-2': [
    createSlot('GK-1', 'GK', 50, 95),
    createSlot('LB-1', 'FB', 15, 75),
    createSlot('CB-1', 'CB', 35, 80),
    createSlot('CB-2', 'CB', 65, 80),
    createSlot('RB-1', 'FB', 85, 75),
    createSlot('LM-1', 'W',  15, 45),
    createSlot('CM-1', 'CM', 35, 45),
    createSlot('CM-2', 'CM', 65, 45),
    createSlot('RM-1', 'W',  85, 45),
    createSlot('ST-1', 'ST', 35, 15),
    createSlot('ST-2', 'ST', 65, 15),
  ],
  '3-5-2': [
    createSlot('GK-1', 'GK', 50, 95),
    createSlot('CB-1', 'CB', 25, 80),
    createSlot('CB-2', 'CB', 50, 80),
    createSlot('CB-3', 'CB', 75, 80),
    createSlot('LWB-1', 'FB', 15, 55),
    createSlot('DM-1', 'DM', 50, 55),
    createSlot('RWB-1', 'FB', 85, 55),
    createSlot('CM-1', 'CM', 35, 40),
    createSlot('CM-2', 'CM', 65, 40),
    createSlot('ST-1', 'ST', 35, 15),
    createSlot('ST-2', 'ST', 65, 15),
  ],
  '5-4-1': [
    createSlot('GK-1', 'GK', 50, 95),
    createSlot('LB-1', 'FB', 10, 75),
    createSlot('CB-1', 'CB', 30, 80),
    createSlot('CB-2', 'CB', 50, 80),
    createSlot('CB-3', 'CB', 70, 80),
    createSlot('RB-1', 'FB', 90, 75),
    createSlot('LM-1', 'W',  15, 45),
    createSlot('CM-1', 'CM', 35, 45),
    createSlot('CM-2', 'CM', 65, 45),
    createSlot('RM-1', 'W',  85, 45),
    createSlot('ST-1', 'ST', 50, 15),
  ],
  '3-4-3': [
    createSlot('GK-1', 'GK', 50, 95),
    createSlot('CB-1', 'CB', 25, 80),
    createSlot('CB-2', 'CB', 50, 80),
    createSlot('CB-3', 'CB', 75, 80),
    createSlot('LM-1', 'FB', 15, 55),
    createSlot('CM-1', 'CM', 35, 50),
    createSlot('CM-2', 'CM', 65, 50),
    createSlot('RM-1', 'FB', 85, 55),
    createSlot('LW-1', 'W',  20, 25),
    createSlot('ST-1', 'ST', 50, 15),
    createSlot('RW-1', 'W',  80, 25),
  ],
}

// Relocate players when formation changes
export function relocatePlayers(oldSlots: TacticalSlot[], newFormation: string): TacticalSlot[] {
  const newSlots = JSON.parse(JSON.stringify(FORMATIONS[newFormation] || FORMATIONS['4-3-3'])) as TacticalSlot[]
  
  // We want to map players to the new slots.
  // 1. Try to map by exact ID (e.g. "CB-1" -> "CB-1")
  // 2. Map remaining by position requirement (e.g. "CB" -> "CB-2")
  // 3. Keep remaining players unassigned (they will be pushed back to the pool in the parent state)

  const playersToAssign = oldSlots.filter(s => s.playerId !== null)
  
  // First pass: exact id match
  for (const oldSlot of [...playersToAssign]) {
    const matchingNewSlot = newSlots.find(ns => ns.id === oldSlot.id && ns.playerId === null)
    if (matchingNewSlot) {
      matchingNewSlot.playerId = oldSlot.playerId
      // Remove from list
      const idx = playersToAssign.indexOf(oldSlot)
      if (idx > -1) playersToAssign.splice(idx, 1)
    }
  }

  // Second pass: position match
  for (const oldSlot of [...playersToAssign]) {
    const matchingNewSlot = newSlots.find(ns => ns.position === oldSlot.position && ns.playerId === null)
    if (matchingNewSlot) {
      matchingNewSlot.playerId = oldSlot.playerId
      const idx = playersToAssign.indexOf(oldSlot)
      if (idx > -1) playersToAssign.splice(idx, 1)
    }
  }

  // Any players left in playersToAssign are "orphaned". 
  // We'll return orphaned players separately or the caller handles it.
  // We'll just return the mapped slots here. Caller can compute orphaned by checking oldSlots vs newSlots.
  return newSlots
}
