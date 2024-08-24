import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

enum RoomEnergySources {
    NORTH = '5bbcae009099fc012e63846e',
    SOUTH = '5bbcae009099fc012e638470'
}

export const HARVESTERS = 2;

function harvest(creep: Creep) {
    const source = Game.getObjectById<Source>(creep.memory.sourceId);
    if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

function transfer(creep: Creep) {
    // let containers: StructureContainer[] = [];

    // const towers = creep.room.find(FIND_STRUCTURES, { filter: struc => struc.structureType === STRUCTURE_TOWER });
    // Creeps.transfer(creep).to(towers[0]);
    // return;

    // const spawn = Creeps.get(creep).spawn();
    // const extensions = Creeps.get(creep).spawnExtensions();
    // const spawnMoney =
    //     (spawn[0] ?? { store: { energy: 0 } }).store.energy +
    //     extensions.reduce((acc, curr) => acc + curr.store.energy, 0);
    //
    // if ((spawn.length === 0 && spawnMoney >= 400) || spawnMoney >= 700) {
    //     containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
    //         filter: structure =>
    //             structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    //     });
    // }
    //
    // const extensionsFilter: FilterOptions<FIND_STRUCTURES, StructureExtension> = {
    //     filter: (structure: AnyStructure) =>
    //         structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    // };
    const containers = creep.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 3, {
        filter: structure =>
            structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
    // const containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
    //     filter: structure =>
    //         structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    // });
    // const closest = creep.pos.findClosestByPath([
    // ...spawn,
    // ...Creeps.get(creep).spawnExtensions(extensionsFilter),
    // ...containers
    // ]);

    containers.length && Creeps.transfer(creep).to(containers[0]);
}

const Harvester: BaseCreep = {
    role: CreepRole.HARVESTER,
    spawn: function () {
        let harvesterCount = Creeps.count(CreepRole.HARVESTER);
        let sourceId;
        const roomCreeps = _.filter(
            Game.creeps,
            creep => creep.memory.role == CreepRole.HARVESTER && creep.room.name == 'E18S28'
        );
        const someHarvesterCloseToDie = _.find(roomCreeps, harvesterCreep => (harvesterCreep.ticksToLive ?? 0) < 50);

        if (someHarvesterCloseToDie && !Game.spawns['Spawn1'].spawning) {
            harvesterCount = harvesterCount - 1;
            sourceId = someHarvesterCloseToDie.memory.sourceId;
        }

        if (harvesterCount >= HARVESTERS) {
            return;
        }

        const harvesterTypes = _.groupBy(Creeps.getByRole(CreepRole.HARVESTER), 'memory.sourceId');

        if (!sourceId) {
            sourceId =
                (harvesterTypes[RoomEnergySources.SOUTH] ?? []).length >
                (harvesterTypes[RoomEnergySources.NORTH] ?? []).length
                    ? RoomEnergySources.NORTH
                    : RoomEnergySources.SOUTH;
        }

        const harvester = {
            actions: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            // actions: [WORK, WORK, CARRY, MOVE, MOVE],
            name: `Harvester${harvesterCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.HARVESTER,
                    sourceId: sourceId
                }
            }
        };
        Creeps.create(harvester);
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

export default Harvester;
