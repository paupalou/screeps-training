import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';
import { log } from 'utils/log';

enum RoomEnergySources {
    WEST = '5bbcadf29099fc012e6382e9'
}

const MAIN_ROOM = 'E18S28';
const MAIN_ROOM_EXIT = [0, 27];
const TARGET_ROOM = 'E17S28';
const TARGET_ROOM_EXIT = [49, 27];

export const STEALERS = 0;

function harvest(creep: Creep) {
    if (creep.room == Game.rooms[MAIN_ROOM]) {
        const [x, y] = MAIN_ROOM_EXIT;
        creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffffff' } });
        return;
    }

    const source = Game.getObjectById<Source>(creep.memory.sourceId);
    if (!source) {
        return;
    }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

function transfer(creep: Creep) {
    if (creep.room != Game.rooms[MAIN_ROOM]) {
        const [x, y] = TARGET_ROOM_EXIT;
        creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffffff' } });
        return;
    }

    let containers: StructureContainer[] = [];

    const spawn = Creeps.get(creep).spawn();
    const extensions = Creeps.get(creep).spawnExtensions();
    const spawnMoney =
        (spawn[0] ?? { store: { energy: 0 } }).store.energy +
        extensions.reduce((acc, curr) => acc + curr.store.energy, 0);

    if ((spawn.length === 0 && spawnMoney >= 400) || spawnMoney >= 700) {
        containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
    }

    const extensionsFilter: FilterOptions<FIND_STRUCTURES, StructureExtension> = {
        filter: (structure: AnyStructure) =>
            structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    };
    const closest = creep.pos.findClosestByPath([
        ...spawn,
        ...Creeps.get(creep).spawnExtensions(extensionsFilter),
        ...containers
    ]);
    Creeps.transfer(creep).to(closest);
}

const Stealer: BaseCreep = {
    role: CreepRole.STEALER,
    spawn: function () {
        const stealersCount = Creeps.count(CreepRole.STEALER);
        if (stealersCount >= STEALERS) {
            return;
        }

        const stealer = {
            actions: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            name: `Stealer${stealersCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.STEALER,
                    sourceId: RoomEnergySources.WEST
                }
            }
        };
        Creeps.create(stealer);
    },
    run: function (creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
        }

        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
        }

        if (creep.memory.transfering) {
            transfer(creep);
        } else {
            harvest(creep);
        }
    }
};

export default Stealer;
