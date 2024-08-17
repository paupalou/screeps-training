import _ from 'lodash';

const HARVESTER = 'harvester';

interface RoleHarvester {
    role: string;
    count: () => number;
    all: () => Creep[];
    run: (creep: Creep) => void;
}

const Harvester: RoleHarvester = {
    role: HARVESTER,
    all: function () {
        return _.filter(Game.creeps, creep => creep.memory.role === HARVESTER);
    },
    count: function () {
        return _.filter(Game.creeps, creep => creep.memory.role === HARVESTER).length;
    },
    run: function (creep) {
        if (creep.store.getFreeCapacity() > 0) {
            const source = Game.getObjectById<Source>(creep.memory.sourceId);
            if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.energy
            });
            if (container) {
                if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                const extensions = creep.room.find(FIND_STRUCTURES, {
                    filter: structure =>
                        structure.structureType == STRUCTURE_EXTENSION &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.energy
                });
                if (extensions.length > 0) {
                    if (creep.transfer(extensions[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(extensions[0], { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else {
                    const base = creep.room.find(FIND_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_SPAWN
                    })[0];
                    creep.moveTo(base, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    }
};

export default Harvester;
