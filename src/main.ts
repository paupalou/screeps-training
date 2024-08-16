import Harvester from './role.harvester';
import Builder from './role.builder';
import Upgrader from './role.upgrader';

function noCreeps() {
    return Object.keys(Game.creeps).length === 0;
}

function createCreep(creep = { actions: [WORK, CARRY, MOVE], name: 'Harvester1', spawn: 'Spawn1' }) {
    Game.spawns[creep.spawn].spawnCreep(creep.actions, creep.name, { memory: { role: 'harvester' } });
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
    if (noCreeps()) {
        createCreep();
    } else {
        cleanUp();
    }

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
