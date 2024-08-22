import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';
import { log } from './utils';

const MAIN_ROOM = 'E18S28';
const TARGET_ROOM = 'E18S27';

export const EXPANSION_BUILDERS = 2;

export class ExpansionHarvester extends Creep {
    run() {
        log('running ExpansionHarvester');
        const creep = this;
        if (creep.room.name != TARGET_ROOM) {
            const route = Game.map.findRoute(creep.room, TARGET_ROOM);
            if (route !== -2 && route.length > 0) {
                const exit = creep.pos.findClosestByRange(route[0].exit);
                exit && creep.moveTo(exit);
            }
        } else {
            if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.transfering = false;
                creep.say('harvest');
            }
            if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
                creep.memory.transfering = true;
                creep.say('transfer');
            }

            const workSpot = creep.memory.workSpot;

            if (creep.memory.transfering) {
            } else if (workSpot && creep.pos.x != workSpot[0] && creep.pos.y != workSpot[1]) {
                creep.moveTo(creep.memory.workSpot, { visualizePathStyle: { stroke: '#ffaa00' } });
            } else if (!workSpot) {
                log('assigning workSpot');
            }
        }
    }
}

export default ExpansionHarvester;
