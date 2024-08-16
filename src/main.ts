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

    if (harvesterCount < 4) {
        const nextHarvesterNumber = harvesterCount + 1;
        const harvester = {
            actions: [WORK, CARRY, MOVE],
            name: `Harvester${nextHarvesterNumber}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: 'harvester',
                    sourceId: nextHarvesterNumber % 2 === 0 ? RoomEnergySources.SOUTH : RoomEnergySources.NORTH
                }
            }
        };
        createCreep(harvester);
    }

    if (creeps.builder.length === 0) {
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
        const nextCreepName = creep.name.slice(0, -1) + String(duplicatedCreepNumber + 1);
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
        if (name.startsWith('Harvester')) {
            Harvester.run(creep);
            continue;
        }

        if (name.startsWith('Builder')) {
            Builder.run(creep);
            continue;
        }

        if (creep.memory.role === 'upgrader') {
            Upgrader.run(creep);
            continue;
        }
    }
}
