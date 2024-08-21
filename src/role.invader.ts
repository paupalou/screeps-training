import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

const MIDDLE_ROOM = 'E18S26';
const TARGET_ROOM = 'E18S25';

export const INVADERS = 2;

const Invader: BaseCreep = {
    role: CreepRole.INVADER,
    spawn: function () {
        const invaderCount = Creeps.count(CreepRole.INVADER);
        if (invaderCount >= INVADERS) {
            return;
        }

        const invader = {
            actions: [
                ATTACK,
                ATTACK,
                ATTACK,
                ATTACK,
                ATTACK,
                ATTACK,
                ATTACK,
                MOVE,
                MOVE,
                MOVE,
                MOVE,
                MOVE,
                MOVE,
                TOUGH,
                TOUGH,
                TOUGH,
                TOUGH,
                TOUGH,
                TOUGH
            ],
            name: `Invader${invaderCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.INVADER
                }
            }
        };
        Creeps.create(invader);
    },
    run: function (creep) {
        if (creep.room == Game.rooms[MIDDLE_ROOM]) {
            if (creep.pos.x == 13 && creep.pos.y == 22) {
                creep.memory.in_middle_room = true;
            } else if (!creep.memory.in_middle_room) {
                creep.moveTo(13, 22, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            const route = Game.map.findRoute(creep.room, TARGET_ROOM);
            if (route !== -2 && route.length > 0) {
                const exit = creep.pos.findClosestByRange(route[0].exit);
                exit && creep.moveTo(exit.x + 5, exit.y, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else if (creep.room != Game.rooms[TARGET_ROOM]) {
            const route = Game.map.findRoute(creep.room, MIDDLE_ROOM);
            if (route !== -2 && route.length > 0) {
                const exit = creep.pos.findClosestByRange(route[0].exit);
                exit && creep.moveTo(exit);
            }
        } else {
            const hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (hostileCreep) {
                const attack = creep.attack(hostileCreep);
                if (attack == ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostileCreep);
                } else if (attack == OK) {
                    creep.say(`Creep attacked`);
                }
            } else {
                const hostileStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                if (hostileStructure) {
                    const attack = creep.attack(hostileStructure);
                    if (attack == ERR_NOT_IN_RANGE) {
                        creep.moveTo(hostileStructure);
                    } else if (attack == OK) {
                        creep.say(`Structure attacked`);
                    }
                }
            }
        }
    }
};

export default Invader;
