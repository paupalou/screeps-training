const Tower = {
    run: function (room: Room) {
        const towers = room.find(FIND_STRUCTURES, { filter: struc => struc.structureType === STRUCTURE_TOWER });
        towers.forEach(tower => {
            if (tower.store.energy < 500) {
                const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestHostile) {
                    tower.attack(closestHostile);
                }
            } else {
                const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: struc => struc.structureType !== STRUCTURE_WALL && struc.hits < struc.hitsMax
                });

                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                } else {
                    const closestDamagedWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: struc => struc.structureType === STRUCTURE_WALL && struc.hits < 1000000
                    });
                    if (closestDamagedWall) {
                        tower.repair(closestDamagedWall);
                    }
                }
            }
        });
    }
};

export default Tower;
