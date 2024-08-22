import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';
import { log } from './utils';

const MAIN_ROOM = 'E18S28';
const TARGET_ROOM = 'E18S27';

export const EXPANSION_BUILDERS = 1;

const ExpansionBuilder: BaseCreep = {
    role: CreepRole.EXPANSION_BUILDER,
    spawn: function () {
        const expansionBuildersCount = Creeps.count(CreepRole.EXPANSION_BUILDER);
        if (expansionBuildersCount >= EXPANSION_BUILDERS) {
            return;
        }

        const expansionBuilder = {
            actions: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
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

            if (creep.store.energy === 0 || (!creep.memory.building && creep.store.getFreeCapacity() > 0)) {
                const source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                creep.memory.building = true;
                const constructionSites = Creeps.get(creep).constructionSites();
                if (constructionSites && constructionSites.length) {
                    log(constructionSites);
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
    }
};

export default ExpansionBuilder;
