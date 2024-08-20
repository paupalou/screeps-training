import _ from 'lodash';

import Creeps, { BaseCreep, CreepRole } from './creep';

const REPAIRERS = 2;

const Repairer: BaseCreep = {
    role: CreepRole.REPAIRER,
    spawn: function () {
        const repairerCount = Creeps.count(CreepRole.REPAIRER);
        if (repairerCount >= REPAIRERS) {
            return;
        }

        const repairer = {
            actions: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            name: `Repairer${repairerCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.REPAIRER
                }
            }
        };
        Creeps.create(repairer);
    },
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
            const priorityStructures = creep.room.find(FIND_STRUCTURES, {
                filter: structure =>
                    (structure.structureType !== STRUCTURE_WALL &&
                        structure.structureType !== STRUCTURE_ROAD &&
                        structure.structureType !== STRUCTURE_RAMPART &&
                        structure.hits < structure.hitsMax) ||
                    (structure.structureType === STRUCTURE_RAMPART && structure.hits < 500000)
            });

            console.log(priorityStructures[0]);

            if (priorityStructures.length > 0) {
                if (creep.repair(priorityStructures[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(priorityStructures[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                const nonPriorityStructures = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.hits < structure.hitsMax
                });
                if (nonPriorityStructures.length > 0) {
                    if (creep.repair(nonPriorityStructures[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(nonPriorityStructures[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        }
    }
};

export default Repairer;
