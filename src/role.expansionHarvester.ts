import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

const MAIN_ROOM = 'E18S28';
const TARGET_ROOM = 'E18S27';

export const EXPANSION_BUILDERS = 2;

const ExpansionBuilder: BaseCreep = {
    role: CreepRole.EXPANSION_BUILDER,
    spawn: function () {
        const expansionBuildersCount = Creeps.count(CreepRole.EXPANSION_BUILDER);
        if (expansionBuildersCount  >= EXPANSION_BUILDERS) {
            return;
        }

        const expansionBuilder = {
            actions: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,  MOVE, MOVE, MOVE, MOVE],
            name: `ExpansionBuilder${expansionBuildersCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.EXPANSION_BUILDER
                }
            }
        };
        Creeps.create(expansionBuilder);
    },
    run: function (creep) {
        if (creep.room == Game.rooms[MAIN_ROOM]) {
            const route = Game.map.findRoute(creep.room, TARGET_ROOM);
            if (route !== -2 && route.length > 0) {
                const exit = creep.pos.findClosestByRange(route[0].exit);
                exit && creep.moveTo(exit);
            }
        } else {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            const constructionSites = Creeps.get(creep).constructionSites();
            if (constructionSites && constructionSites.length) {
                if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
          const sources = creep.room.find(FIND_SOURCES);
            if (sources && sources.length) {
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
          }
        }
    }
};

export default ExpansionBuilder;
