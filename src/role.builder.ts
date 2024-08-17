import _ from 'lodash';

interface RoleBuilder {
    run: (creep: Creep) => void;
}

const Builder: RoleBuilder = {
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
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: structure => {
                    if (creep.memory.structureType) {
                        return structure.structureType === creep.memory.structureType;
                    }

                    return true;
                }
            });

            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                const roads = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (roads.length) {
                    if (creep.build(roads[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(roads[0], { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
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
                console.log("no container");
                const extensions = creep.room.find(FIND_STRUCTURES, {
                  filter: structure => structure.structureType === STRUCTURE_EXTENSION
                });

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
                    const spawn = creep.room.find(FIND_STRUCTURES, {
                        filter: structure => structure.structureType === STRUCTURE_SPAWN
                    })[0];
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
