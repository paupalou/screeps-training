import _ from 'lodash';

import { BaseCreep, CreepRole } from './creep';

const Repairer: BaseCreep = {
    role: CreepRole.REPAIRER,
    run: function (creep) {
        if (creep.store.energy === 0 || (!creep.memory.reparing && creep.store.getFreeCapacity() > 0)) {
            creep.memory.reparing = false;
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.energy
            });
            if (container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            creep.memory.reparing = true;
            const nonRoadStructures = creep.room.find(FIND_STRUCTURES, {
                filter: structure => structure.structureType !== STRUCTURE_ROAD && structure.hits < structure.hitsMax
            });

            if (nonRoadStructures.length > 0) {
                if (creep.repair(nonRoadStructures[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nonRoadStructures[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                const damagedStructures = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.hits < structure.hitsMax
                });
                if (damagedStructures.length > 0) {
                    if (creep.repair(damagedStructures[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(damagedStructures[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        }
    }
};

export default Repairer;
