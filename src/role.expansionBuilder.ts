import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

export const EXPANSION_BUILDERS = 1;

const ExpansionBuilder: BaseCreep = {
    role: CreepRole.EXPANSION_BUILDER,
    spawn: function () {
        const expansionBuildersCount = Creeps.count(CreepRole.EXPANSION_BUILDER);
        if (expansionBuildersCount >= EXPANSION_BUILDERS) {
            return;
        }

        const constructionSites = Game.spawns['Spawn2'].room.find(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length == 0) {
            return;
        }

        const expansionBuilder = {
            actions: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            name: `ExpansionBuilder${expansionBuildersCount + 1}`,
            spawn: 'Spawn2',
            opts: {
                memory: {
                    role: CreepRole.EXPANSION_BUILDER
                }
            }
        };
        Creeps.create(expansionBuilder);
    },
    run: function (creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }

        if (creep.store.energy === 0 || (!creep.memory.building && creep.store.getFreeCapacity() > 0)) {
            const containers = creep.room
                .find<StructureContainer>(FIND_STRUCTURES, {
                    filter: structure =>
                        structure.structureType == STRUCTURE_CONTAINER &&
                        // structure.id != '66c7618b818067966b922da7' && // controller container
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
            creep.memory.building = true;
            const constructionSites = Creeps.get(creep).constructionSites();
            if (constructionSites && constructionSites.length) {
                if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else if (creep.room.controller && creep.room.controller.my) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    }
};

export default ExpansionBuilder;
