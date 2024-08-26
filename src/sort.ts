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

export function byMoreDamaged(
    strucA: Structure,
    strucB: Structure
) {
    const healthPercentageStrucA = Math.floor((strucA.hits / strucA.hitsMax) * 100);
    const healthPercentageStrucB = Math.floor((strucB.hits / strucB.hitsMax) * 100);
    if (healthPercentageStrucA > healthPercentageStrucB) {
        return 1;
    } else if (healthPercentageStrucB > healthPercentageStrucA) {
        return -1;
    }
    return 0;
}
