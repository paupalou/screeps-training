import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';
import { log } from './utils';

export const EXPANSION_UPGRADERS = 3;

function takePositionRelativeToContainer(creep: Creep) {
    const controllerContainer = Game.getObjectById('66c7618b818067966b922da7' as Id<StructureContainer>);

    if (controllerContainer && creep.pos.y > controllerContainer.pos.y) {
        return;
    }

    const otherUpgraders = Creeps.getByRole(CreepRole.EXPANSION_UPGRADER).filter(upg => upg.id != creep.id);
    if (controllerContainer && creep.pos.y <= controllerContainer.pos.y) {
        const containerBottomRight = new RoomPosition(
            controllerContainer.pos.x + 1,
            controllerContainer.pos.y + 1,
            creep.room.name
        );
        let creepInPosition = otherUpgraders.some(
            upg => upg.pos.x == containerBottomRight.x && upg.pos.y == containerBottomRight.y
        );

        if (!creepInPosition) {
            creep.moveTo(containerBottomRight);

            return;
        }

        const containerBottomCenter = new RoomPosition(
            controllerContainer.pos.x,
            controllerContainer.pos.y + 1,
            creep.room.name
        );
        creepInPosition = otherUpgraders.some(
            upg => upg.pos.x == containerBottomCenter.x && upg.pos.y == containerBottomCenter.y
        );

        if (!creepInPosition) {
            creep.moveTo(containerBottomCenter);

            return;
        }

        const containerBottomLeft = new RoomPosition(
            controllerContainer.pos.x - 1,
            controllerContainer.pos.y + 1,
            creep.room.name
        );
        creepInPosition = otherUpgraders.some(
            upg => upg.pos.x == containerBottomLeft.x && upg.pos.y == containerBottomLeft.y
        );

        if (!creepInPosition) {
            creep.moveTo(containerBottomLeft);
        }
    }
}

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
                const withdrawAction = creep.withdraw(controllerContainer, RESOURCE_ENERGY);
                if (withdrawAction == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controllerContainer, { visualizePathStyle: { stroke: '#ffffff' } });
                    return;
                }

                takePositionRelativeToContainer(creep);
            }
        } else if (creep.room.controller && creep.room.controller.my) {
            creep.memory.upgrading = true;

            const upgradeAction = creep.upgradeController(creep.room.controller);

            if (upgradeAction == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
                return;
            }

            takePositionRelativeToContainer(creep);
        }
    }
};

export default ExpansionUpgrader;
