import _ from 'lodash';

import Creeps, { BaseCreep, CreepRole } from './creep';

const BUILDERS = 1;

function nothingToBuild() {
    return Game.rooms['E18S28'].find(FIND_CONSTRUCTION_SITES).length == 0;
}

const DISMANTLE_TARGET = '66c46950cb7941730df11d52';
const ENERGY_FROM = '66cb141f9d107301af33c924';

function dismantle(creep: Creep) {
    const structure = Game.getObjectById(DISMANTLE_TARGET as Id<Structure>);
    const storage = creep.room.storage;

    if (structure) {
        if (creep.dismantle(structure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    } else if (storage && storage.store.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    } else {
        const closestContainer = creep.closestContainer;
        if (!closestContainer || closestContainer.store.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
            return;
        }
        if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestContainer, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }
    // } else {
    //     const source = Game.getObjectById('5bbcae009099fc012e63846e' as Id<Source>);
    //     if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
    //         creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    //     }
    // }
}

function withdrawResources(creep: Creep) {
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
        // const extensions = Creeps.get(creep).structure<StructureExtension[]>();
        const extensions = Creeps.get(creep).spawnExtensions();

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
            const spawn = Creeps.get(creep).spawn();
            if (spawn.length && spawn[0].store.energy >= creep.store.getCapacity(RESOURCE_ENERGY)) {
                if (creep.withdraw(spawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    }
}

const Builder: BaseCreep = {
    role: CreepRole.BUILDER,
    spawn: function () {
        const builderCount = Creeps.count(CreepRole.BUILDER);
        if (nothingToBuild() || builderCount >= BUILDERS) {
            return;
        }

        const builder = {
            actions: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
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
            // if (!creep.memory.containerId) {
            //     const containerId = creep.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 6, {
            //         filter: s => s.structureType == STRUCTURE_CONTAINER && s.id != DISMANTLE_TARGET
            //     });
            //     console.log(containerId)
            //     if (containerId.length) {
            //         creep.memory.containerId = _.first(containerId)?.id;
            //     }
            // }
            const constructionSites = Creeps.get(creep).constructionSites();
            if (constructionSites && constructionSites.length) {
                if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            // const container = Game.getObjectById(creep.memory.containerId as Id<StructureContainer>);
            // if (container) {
            //     if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
            //     }
            // }
        } else {
            // const source = Game.getObjectById('5bbcae009099fc012e638470' as Id<Source>);
            // if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
            //     creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            // }
            dismantle(creep);
            // withdrawResources(creep);
        }
    }
};

export default Builder;
