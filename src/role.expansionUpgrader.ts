import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';
import { log } from './utils';

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

        const otherUpgraders = Creeps.getByRole(CreepRole.EXPANSION_UPGRADER).filter(upg => upg.id != creep.id);

        if (creep.store.energy === 0 || (!creep.memory.upgrading && creep.store.getFreeCapacity() > 0)) {
            const controllerContainer = Game.getObjectById('66c7618b818067966b922da7' as Id<StructureContainer>);

            if (controllerContainer) {
                const withdrawAction = creep.withdraw(controllerContainer, RESOURCE_ENERGY);
                if (withdrawAction == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controllerContainer, { visualizePathStyle: { stroke: '#ffffff' } });
                    return;
                }

                // if (otherUpgraders.every(upg => upg.pos.x != creep.pos.x + 1 && upg.pos.y != creep.pos.y + 1)) {
                //     log(`no creeps in ${creep.pos.x + 1} ${creep.pos.y + 1}`);
                //     creep.moveTo(creep.pos.x + 1, creep.pos.y + 1, { visualizePathStyle: { stroke: '#ffaa00' } });
                // } else if (otherUpgraders.every(upg => upg.pos.x != creep.pos.x && upg.pos.y != creep.pos.y + 1)) {
                //     log(`no creeps in ${creep.pos.x} ${creep.pos.y + 1}`);
                //     creep.moveTo(creep.pos.x, creep.pos.y + 1, { visualizePathStyle: { stroke: '#ffaa00' } });
                // } else if (otherUpgraders.every(upg => upg.pos.x != creep.pos.x - 1 && upg.pos.y != creep.pos.y + 1)) {
                //     log(`no creeps in ${creep.pos.x - 1} ${creep.pos.y + 11}`);
                //     creep.moveTo(creep.pos.x - 1, creep.pos.y + 1, { visualizePathStyle: { stroke: '#ffaa00' } });
                // }
            }
        } else if (creep.room.controller && creep.room.controller.my) {
            creep.memory.upgrading = true;

            const upgradeAction = creep.upgradeController(creep.room.controller);

            if (upgradeAction == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
                return;
            }

            const controllerContainer = Game.getObjectById('66c7618b818067966b922da7' as Id<StructureContainer>);
            if (controllerContainer && creep.pos.y <= controllerContainer.pos.y) {
                log(`creep ${creep.name} is outpositioned ${creep.pos.x} ${creep.pos.y}`);
                log(otherUpgraders.map(upg => `${upg.pos.x},${upg.pos.y}`));
                if (
                    otherUpgraders.every(
                        upg => upg.pos.x != controllerContainer.pos.x + 1 && upg.pos.y != controllerContainer.pos.y + 1
                    )
                ) {
                    log(`no creeps in ${creep.pos.x + 1} ${controllerContainer.pos.y + 1}`);
                    creep.moveTo(creep.pos.x + 1, controllerContainer.pos.y + 1, {
                        visualizePathStyle: { stroke: '#ffaa00' }
                    });
                } else if (
                    otherUpgraders.every(
                        upg => upg.pos.x != controllerContainer.pos.x && upg.pos.y != controllerContainer.pos.y + 1
                    )
                ) {
                    log(`no creeps in ${creep.pos.x} ${controllerContainer.pos.y + 1}`);
                    creep.moveTo(creep.pos.x, controllerContainer.pos.y + 1, {
                        visualizePathStyle: { stroke: '#ffaa00' }
                    });
                } else if (
                    otherUpgraders.every(
                        upg => upg.pos.x != controllerContainer.pos.x - 1 && upg.pos.y != controllerContainer.pos.y + 1
                    )
                ) {
                    log(`no creeps in ${creep.pos.x - 1} ${controllerContainer.pos.y + 1}`);
                    creep.moveTo(creep.pos.x - 1, controllerContainer.pos.y + 1, {
                        visualizePathStyle: { stroke: '#ffaa00' }
                    });
                }
            }
        }
    }
};

export default ExpansionUpgrader;
