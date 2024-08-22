import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

export const EXPANSION_UPGRADERS = 3;

const ExpansionUpgrader: BaseCreep = {
    role: CreepRole.EXPANSION_UPGRADER,
    spawn: function () {
        const expansionUpgradersCount = Creeps.count(CreepRole.EXPANSION_UPGRADER);
        if (expansionUpgradersCount >= EXPANSION_UPGRADERS) {
            return;
        }

        const expansionUpgrader = {
            actions: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
            name: `ExpansionUpgrader${expansionUpgradersCount + 1}`,
            spawn: 'Spawn2',
            opts: {
                memory: {
                    role: CreepRole.EXPANSION_UPGRADER
                }
            }
        };
        Creeps.create(expansionUpgrader);
    },
    run: function (creep) {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
        }

        if (creep.store.energy === 0 || (!creep.memory.upgrading && creep.store.getFreeCapacity() > 0)) {
            const controllerContainer = Game.getObjectById('66c7618b818067966b922da7' as Id<StructureContainer>);

            if (controllerContainer) {
                if (creep.withdraw(controllerContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controllerContainer, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else if (creep.room.controller && creep.room.controller.my) {
            creep.memory.upgrading = true;

            const upgradeAction = creep.upgradeController(creep.room.controller);
            const controllerContainer = Game.getObjectById('66c7618b818067966b922da7' as Id<StructureContainer>);

            if (upgradeAction == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
            } else if (upgradeAction == OK && controllerContainer && creep.pos.y <= controllerContainer.pos.y) {
                creep.moveTo(creep.pos.x, creep.pos.y + 1, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

export default ExpansionUpgrader;
