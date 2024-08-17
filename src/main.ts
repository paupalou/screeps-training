import _ from 'lodash';

import Harvester from './role.harvester';
import Builder from './role.builder';
import Upgrader from './role.upgrader';

enum RoomEnergySources {
    NORTH = '5bbcae009099fc012e63846e',
    SOUTH = '5bbcae009099fc012e638470'
}

function log(something: unknown) {
    if (typeof something === 'string') {
        console.log(something);
        return;
    }

    if (typeof something === 'object') {
        console.log(JSON.stringify(something, null, 2));
        return;
    }
}

function respawnCreeps() {
    const creeps: Record<string, Creep[]> = {
        harvester: [],
        builder: [],
        upgrader: []
    };

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        creeps[creep.memory.role] && creeps[creep.memory.role].push(creep);
    }

    const harvesterCount = creeps.harvester.length;
    const builderCount = creeps.builder.length;
    const upgraderCount = creeps.upgrader.length;

    if (harvesterCount < 4) {
        const nextHarvesterNumber = harvesterCount + 1;
        const harvesterTypes = _.groupBy(Harvester.all(), 'memory.sourceId');
        log(harvesterTypes);

        const harvester = {
            actions: [WORK, CARRY, MOVE],
            name: `Harvester${nextHarvesterNumber}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: 'harvester',
                    sourceId:
                        harvesterTypes[RoomEnergySources.SOUTH].length > harvesterTypes[RoomEnergySources.NORTH].length
                            ? RoomEnergySources.NORTH
                            : RoomEnergySources.SOUTH
                }
            }
        };
        createCreep(harvester);
    }

    if (builderCount < 4) {
        const nextBuilderNumber = builderCount + 1;
        const builder = {
            actions: [WORK, CARRY, MOVE],
            name: `Builder${nextBuilderNumber}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: 'builder',
                    structureType: STRUCTURE_ROAD
                }
            }
        };
        createCreep(builder);
    } else if (builderCount < 1) {
        const builder = {
            actions: [WORK, CARRY, MOVE],
            name: 'Builder1',
            spawn: 'Spawn1',
            opts: {
                memory: { role: 'builder' }
            }
        };
        createCreep(builder);
    }

    if (upgraderCount < 1) {
        const upgrader = {
            actions: [WORK, CARRY, MOVE],
            name: 'Upgrader1',
            spawn: 'Spawn1',
            opts: {
                memory: { role: 'upgrader' }
            }
        };
        createCreep(upgrader);
    }
}

function createCreep(
    creep = {
        actions: [WORK, CARRY, MOVE],
        name: 'Harvester1',
        spawn: 'Spawn1',
        opts: { memory: { role: 'harvester' } }
    }
) {
    const result = Game.spawns[creep.spawn].spawnCreep(creep.actions, creep.name, creep.opts);
    if (result === ERR_NOT_ENOUGH_ENERGY) {
        log(`Not enough energy to create ${creep.name}`);
    } else if (result === ERR_NAME_EXISTS) {
        const duplicatedCreepNumber = Number(creep.name.slice(-1));
        const nextCreepName = creep.name.slice(0, -1) + String(duplicatedCreepNumber + 2);
        log(`Creep named ${creep.name} already exists, trying with ${nextCreepName}`);
        const nextCreep = { ...creep, name: nextCreepName };
        createCreep(nextCreep);
    }
}

function cleanUp() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

export function loop(): void {
    cleanUp();
    respawnCreeps();

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === Harvester.role) {
            Harvester.run(creep);
            continue;
        }

        if (Upgrader.count() > 0 && Harvester.count() >= 4 && creep.memory.role === 'builder') {
            Builder.run(creep);
            continue;
        }

        if (creep.memory.role === 'upgrader') {
            Upgrader.run(creep);
            continue;
        }
    }
}
