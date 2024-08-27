import _ from 'lodash';

import Creeps, { CreepRole, type BaseCreep } from './creep';

export const EXPANSION_REPAIRERS = 0;

const NON_BLOCKING_POSITION: Record<string, number[]> = {
    E18S27: [15, 32]
};

function nothingToRepair(room: Room) {
    return (
        room.find(FIND_STRUCTURES, {
            filter: structure => structure.hits < structure.hitsMax
        }).length == 0
    );
}

function repair(creep: Creep) {
    const priorityStructures = creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
            (structure.structureType !== STRUCTURE_WALL &&
                structure.structureType !== STRUCTURE_ROAD &&
                structure.structureType !== STRUCTURE_RAMPART &&
                structure.hits < structure.hitsMax) ||
            (structure.structureType === STRUCTURE_RAMPART && structure.hits < 500000)
    });

    if (priorityStructures.length > 0) {
        if (creep.repair(priorityStructures[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(priorityStructures[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    } else {
        const nonPriorityStructures = creep.room.find(FIND_STRUCTURES, {
            filter: structure => {
                if (structure.structureType === STRUCTURE_WALL) {
                    return structure.hits < 1000000;
                }
                return structure.hits < structure.hitsMax;
            }
        });
        if (nonPriorityStructures.length > 0) {
            if (creep.repair(nonPriorityStructures[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nonPriorityStructures[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            // If nothing to repair move to a non blocking position
            const [x, y] = NON_BLOCKING_POSITION[creep.room.name];
            const nonBlockingPos = new RoomPosition(x, y, creep.room.name);
            creep.moveTo(nonBlockingPos);
        }
    }
}

const ExpansionRepairer: BaseCreep = {
    role: CreepRole.EXPANSION_REPAIRER,
    spawn: function () {
        const expansionRepairerCount = Creeps.count(CreepRole.EXPANSION_REPAIRER);
        if (nothingToRepair(Game.rooms['E18S27']) || expansionRepairerCount >= EXPANSION_REPAIRERS) {
            return;
        }

        const expansionRepairer = {
            actions: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            name: `ExpansionRepairer${expansionRepairerCount + 1}`,
            spawn: 'Spawn2',
            opts: {
                memory: {
                    role: CreepRole.EXPANSION_REPAIRER
                }
            }
        };
        Creeps.create(expansionRepairer);
    },
    run: function (creep) {
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
        }
        if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
        }

        if (creep.store.energy === 0 || (!creep.memory.repairing && creep.store.getFreeCapacity() > 0)) {
            const containers = creep.room
                .find<StructureContainer>(FIND_STRUCTURES, {
                    filter: structure =>
                        structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY)
                })
                .sort((sA, sB) => {
                    if (sB.store.energy > sA.store.energy) {
                        return 1;
                    } else if (sA.store.energy > sB.store.energy) {
                        return -1;
                    }
                    return 0;
                });

            const container = _.first(containers);

            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            creep.memory.repairing = true;
            repair(creep);
        }
    }
};

export default ExpansionRepairer;
