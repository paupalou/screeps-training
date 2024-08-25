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
