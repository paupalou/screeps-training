import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

const MAIN_ROOM = 'E18S28';
const TARGET_ROOM = 'E18S27';

export const CLAIMERS = 0;

const Claimer: BaseCreep = {
    role: CreepRole.CLAIMER,
    spawn: function () {
        const claimersCount = Creeps.count(CreepRole.CLAIMER);
        if (claimersCount >= CLAIMERS) {
            return;
        }

        const claimer = {
            actions: [CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            name: `claimer${claimersCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.CLAIMER
                }
            }
        };
        Creeps.create(claimer);
    },
    run: function (creep) {
        if (creep.room == Game.rooms[MAIN_ROOM]) {
            const route = Game.map.findRoute(creep.room, TARGET_ROOM);
            if (route !== -2 && route.length > 0) {
                const exit = creep.pos.findClosestByRange(route[0].exit);
                exit && creep.moveTo(exit);
            }
        } else {
            const roomController = creep.room.controller;
            if (roomController && roomController.owner && !roomController.my) {
                const attack = creep.attackController(roomController);
                if (attack == ERR_NOT_IN_RANGE) {
                    creep.moveTo(roomController);
                } else if (attack == OK) {
                    creep.say(`Controller downgraded`);
                }
            } else if (roomController && !roomController.owner) {
                const claim = creep.claimController(roomController);
                if (claim == ERR_NOT_IN_RANGE) {
                    creep.moveTo(roomController);
                } else if (claim == OK) {
                    creep.say(`Controller claimed`);
                }
            }
        }
    }
};

export default Claimer;
