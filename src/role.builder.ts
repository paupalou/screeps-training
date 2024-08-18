import _ from 'lodash';

import Creeps, { BaseCreep, CreepRole } from './creep';

const BUILDERS = 1;

function somethingToBuild() {
    return Game.rooms['E18S28'].find(FIND_CONSTRUCTION_SITES).length > 0;
}

const Builder: BaseCreep = {
    role: CreepRole.BUILDER,
    spawn: function () {
        const builderCount = Creeps.count(CreepRole.BUILDER);
        if (somethingToBuild() && builderCount >= BUILDERS) {
            return;
        }
        const builder = {
            actions: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            name: `Builder${builderCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.BUILDER
                }
            }
        };
        Creeps.create(builder);
    },
    run: function (creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            const constructionSites = Creeps.get(creep).structure<ConstructionSite[]>();
            if (constructionSites.length) {
                if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                // if there is nothing to build then conver to repairer
                creep.memory.role = 'repairer';
            }
        } else {
            // Check closest containers first
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY)
            });
            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                const extensions = Creeps.get(creep).structure<StructureExtension[]>();

                // Then check extensions
                const extWithEnergy = _.findIndex(
                    extensions,
                    extension => extension.store.energy >= creep.store.getCapacity(RESOURCE_ENERGY)
                );
                if (extWithEnergy > -1) {
                    if (creep.withdraw(extensions[extWithEnergy], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(extensions[extWithEnergy], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                } else {
                    // Then withdraw from SPAWN at the end
                    const spawn = Creeps.get(creep).spawn()[0];
                    if (spawn.store.energy >= creep.store.getCapacity(RESOURCE_ENERGY)) {
                        if (creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(spawn, { visualizePathStyle: { stroke: '#ffaa00' } });
                        }
                    }
                }
            }
        }
    }
};

export default Builder;
