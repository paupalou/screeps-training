interface RoleHarvester {
    run: (creep: Creep) => void;
}

const Harvester: RoleHarvester = {
    run: function (creep) {
        if (creep.store.getFreeCapacity() > 0) {
            const sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: structure => {
                    console.log(structure.structureType);
                    // console.log(structure.store);
                    if (structure.structureType === STRUCTURE_SPAWN) {
                        console.log(structure.store);
                        console.log(structure.store.getFreeCapacity('energy'));
                    }

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
