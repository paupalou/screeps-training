import { log } from "./utils";

export function byMostEnergy(
    structA: StructureContainer | StructureTower,
    structB: StructureContainer | StructureTower
) {
    if (structB.store.energy > structA.store.energy) {
        return 1;
    } else if (structA.store.energy > structB.store.energy) {
        return -1;
    }
    return 0;
}

export function byLessEnergy(strucA: StructureContainer | StructureTower, strucB: StructureContainer | StructureTower) {
    if (strucA.store.energy > strucB.store.energy) {
        return 1;
    } else if (strucB.store.energy > strucA.store.energy) {
        return -1;
    }
    return 0;
}

export function byMoreDamaged(strucA: Structure, strucB: Structure) {
    const healthPercentageStrucA = Number(((strucA.hits / strucA.hitsMax) * 100).toFixed(2));
    const healthPercentageStrucB = Number(((strucB.hits / strucB.hitsMax) * 100).toFixed(2));

    // log(`============================================================`);
    // log(`struc ${strucA.structureType} has ${healthPercentageStrucA}%`);
    // log(`struc ${strucB.structureType} has ${healthPercentageStrucB}%`);
    // log(`============================================================`);

    if (strucB.structureType == STRUCTURE_RAMPART && strucB.hits > 20000) {
      return -1;
    } else if (strucA.structureType == STRUCTURE_RAMPART && strucA.hits > 20000) {
      return 1;
    }

    if (healthPercentageStrucA > healthPercentageStrucB) {
        return 1;
    } else if (healthPercentageStrucB > healthPercentageStrucA) {
        return -1;
    }
    return 0;
}

export function byFarestTo(posA: RoomPosition, posB: RoomPosition) {
    return {
        spawn(spawn: StructureSpawn) {
            const distanceToSpawnA = posA.getRangeTo(spawn);
            const distanceToSpawnB = posB.getRangeTo(spawn);
            if (distanceToSpawnB > distanceToSpawnA) {
                return 1;
            } else if (distanceToSpawnA > distanceToSpawnB) {
                return -1;
            }
            return 0;
        }
    };
}

export function byLessTicksToLive(creepA: Creep, creepB: Creep) {
    const creepAticks = creepA.ticksToLive ?? 0;
    const creepBticks = creepB.ticksToLive ?? 0;

    if (creepAticks > creepBticks) {
      return 1;
    } else if (creepBticks > creepAticks) {
      return -1;
    }

    return 0;
}

export function byLessDistance([, costA]: [id: string, cost: number], [,costB]: [id: string, cost: number]) {
    if (costA > costB) {
      return 1;
    } else if (costB > costA) {
      return -1;
    }

    return 0;
}
