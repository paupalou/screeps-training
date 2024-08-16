import _ from 'lodash';

const BUILDER = 'builder';

interface RoleUpgrader {
    run: (creep: Creep) => void;
    count: () => number;
}

const Upgrader: RoleUpgrader = {
    count: function () {
        return _.filter(Game.creeps, creep => creep.memory.role === BUILDER).length;
    },
    run: function (creep) {
        if (creep.store.energy === 0 || (!creep.memory.upgrading && creep.store.getFreeCapacity() > 0)) {
            creep.memory.upgrading = false;
            const sources = creep.room.find(FIND_SOURCES);
            for (const source in sources) {
                if (sources[source].id === '5bbcae009099fc012e638470') {
                    if (creep.harvest(sources[source]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[source], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        } else if (creep.room.controller) {
            creep.memory.upgrading = true;
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

export default Upgrader;
