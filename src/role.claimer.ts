import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

const MAIN_ROOM = 'E18S28';
const TARGET_ROOM = 'E18S27';

export const CLAIMERS = 2;

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
            const enemyController = creep.room.controller;
            if (enemyController) {
                const attack = creep.attackController(enemyController);
                if (attack == ERR_NOT_IN_RANGE) {
                    creep.moveTo(enemyController);
                } else if (attack == OK) {
                    creep.say(`Controller downgraded`);
                } else {
                    console.log(`Attack controller ${attack}`);
                }
            }
        }
    }
};

export default Claimer;
