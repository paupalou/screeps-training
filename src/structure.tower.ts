const IGNORE_TARGETS = ['66c0c80069234a10ee2015f6'];

const Tower = {
    run: function (room: Room) {
        const towers = room.find(FIND_STRUCTURES, { filter: struc => struc.structureType === STRUCTURE_TOWER });
        towers.forEach(tower => {
            const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
                return;
            }

            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: struc =>
                    (!IGNORE_TARGETS.includes(struc.id) &&
                        struc.structureType !== STRUCTURE_WALL &&
                        struc.structureType !== STRUCTURE_RAMPART &&
                        struc.hits < struc.hitsMax) ||
                    (struc.structureType === STRUCTURE_RAMPART && struc.hits < 500000)
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
        });
    }
};

export default Tower;
