import _ from 'lodash';

const HARVESTER = 'harvester';

interface RoleHarvester {
    role: string;
    count: () => number;
    run: (creep: Creep) => void;
}

const Harvester: RoleHarvester = {
    role: HARVESTER,
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
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: structure => {
                    return (
                        (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    );
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                const base = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_SPAWN
                })[0];
                creep.moveTo(base, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    }
};

export default Harvester;
