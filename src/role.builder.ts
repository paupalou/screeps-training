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
                filter: structure => structure.structureType !== STRUCTURE_ROAD
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
            const sources = creep.room.find(FIND_SOURCES);
            for (const source in sources) {
                if (sources[source].id === '5bbcae009099fc012e638470') {
                    if (creep.harvest(sources[source]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[source], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        }
    }
};

export default Builder;
