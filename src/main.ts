import Creeps, { CreepRole } from './creep';
import Towers from './structure.tower';
import Builder from './role.builder';
import Harvester, { HARVESTERS } from './role.harvester';
import Upgrader from './role.upgrader';
import Repairer from './role.repairer';
import Transporter, { TRANSPORTERS } from './role.transporter';
import Stealer from './role.stealer';
import Claimer from './role.claimer';
import Invader from './role.invader';
import ExpansionBuilder from './role.expansionBuilder';
import { MyRoom } from './room';

enum RoomType {
    EXPANSION,
    MAIN
}

interface MyRooms {
    [key: string]: {
        type: RoomType;
    };
}

const MY_ROOMS: MyRooms = {
    E18S27: {
        type: RoomType.EXPANSION
    },
    E18S28: {
        type: RoomType.MAIN
    }
};

function itsMyRoom(room: Room) {
    return room.controller?.my;
}

function respawnCreeps() {
    Transporter.spawn();
    if (Creeps.count(CreepRole.TRANSPORTER) < TRANSPORTERS) {
        // do not create any other creep if we dont have expected transporter alive
        return;
    }

    Harvester.spawn();
    if (Creeps.count(CreepRole.HARVESTER) < HARVESTERS) {
        // do not create any other creep if we dont have expected harvesters alive
        return;
    }

    Upgrader.spawn();
    Builder.spawn();
    Repairer.spawn();
    Stealer.spawn();
    Claimer.spawn();
    Invader.spawn();
    ExpansionBuilder.spawn();
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

    // START ROOM MANAGEMENT
    _.forEach(Game.rooms, room => {
        if (itsMyRoom(room)) {
            if (MY_ROOMS[room.name].type == RoomType.MAIN) {
                return;
            }

            const myRoom = new MyRoom(room);

            // const containerSpots = myRoom.analyst.sourceContainerSpots;
            // const roomHarvesters = myRoom.harvesters;
            //
            // if (roomHarvesters.length < Object.keys(containerSpots).length) {
            //     const expansionHarvester = {
            //         actions: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            //         name: `ExpansionHarvester${roomHarvesters.length + 1}`,
            //         spawn: 'Spawn1',
            //         opts: {
            //             memory: {
            //                 role: CreepRole.EXPANSION_HARVESTER
            //             }
            //         }
            //     };
            //     if (!Game.spawns['Spawn1'].spawning) {
            //         Creeps.create(expansionHarvester);
            //         // log(`Spawning ExpansionHarvester${roomHarvesters.length + 1}`);
            //     }
            // }
            //
            // _.forEach(roomHarvesters, harvester => {
            //     harvester.run();
            // });

            // _.forEach(Object.entries(containerSpots), ([sourceId, [x, y]]) => {
            //     const position = new RoomPosition(x, y, myRoom.name);
            // const containerBuilt = _.find(
            //     position.lookFor(LOOK_STRUCTURES),
            //     structure => structure.structureType == STRUCTURE_CONTAINER
            // );

            // const roomHarvesters = myRoom.harvesters;
            // log(roomHarvesters);
            // });
        }
    });
    // END ROOM MANAGEMENT
    respawnCreeps();

    Towers.run(Game.rooms['E18S28']);

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === CreepRole.HARVESTER) {
            Harvester.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.BUILDER) {
            Builder.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.UPGRADER) {
            Upgrader.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.REPAIRER) {
            Repairer.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.TRANSPORTER) {
            Transporter.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.STEALER) {
            Stealer.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.CLAIMER) {
            Claimer.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.INVADER) {
            Invader.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.EXPANSION_BUILDER) {
            ExpansionBuilder.run(creep);
            continue;
        }
    }
}
