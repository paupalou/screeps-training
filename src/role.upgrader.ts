import _ from 'lodash';

import Creeps, { BaseCreep, CreepRole } from './creep';

const Upgrader: BaseCreep = {
    role: CreepRole.UPGRADER,
    spawn: () => {
        const upgraderCount = Creeps.count(CreepRole.UPGRADER);
        if (upgraderCount >= 1) {
            return;
        }

        const nextUpgraderNumber = upgraderCount + 1;
        const upgrader = {
            actions: [WORK, WORK, WORK, WORK, CARRY, MOVE],
            name: `Upgrader${nextUpgraderNumber}`,
            spawn: 'Spawn1',
            opts: {
                memory: { role: CreepRole.UPGRADER }
            }
        };
        Creeps.create(upgrader);
    },
    run: function (creep) {
        if (creep.store.energy === 0 || (!creep.memory.upgrading && creep.store.getFreeCapacity() > 0)) {
            creep.memory.upgrading = false;
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.energy
            });
            if (container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else if (creep.room.controller) {
            creep.memory.upgrading = true;
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

export default Upgrader;
