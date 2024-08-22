import Creeps, { CreepRole } from './creep';
import ExpansionHarvester from './role.expansionHarvester';
import { RoomAnalyst } from './room.analyst';
import { log } from './utils';

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

export class MyRoom {
    #room: Room;
    analyst: RoomAnalyst;

    constructor(room: Room) {
        this.#room = room;
        this.analyst = new RoomAnalyst(this);
    }

    get name() {
        return this.#room.name;
    }

    get memory() {
        return this.#room.memory;
    }

    get spawn() {
        const storedSpawn: string | undefined = this.#room.memory.spawn;
        if (storedSpawn) {
            Game.getObjectById<StructureSpawn>(storedSpawn as Id<StructureSpawn>);
        }
        return this.#room.find(FIND_MY_SPAWNS)[0];
    }

    get unfinishedSpawn() {
        return this.#room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: structure => structure.structureType === STRUCTURE_SPAWN
        })[0];
    }

    get sources() {
        const storedSources: string[] | undefined = this.#room.memory.sources;
        if (storedSources) {
            return _.map(storedSources, sourceId => Game.getObjectById<Source>(sourceId as Id<Source>));
        }

        const roomSources = _.map(this.#room.find(FIND_SOURCES), source => source.id);
        this.#room.memory.sources = roomSources;
        return _.map(roomSources, sourceId => Game.getObjectById<Source>(sourceId as Id<Source>));
    }

    get harvesters(): ExpansionHarvester[] {
        // return _.filter(
        //     Game.creeps,
        //     creep => creep.room.name == this.name && creep.memory.role == CreepRole.EXPANSION_HARVESTER
        // );
        return _.filter(Game.creeps, creep => creep.memory.role == CreepRole.EXPANSION_HARVESTER).map(
            creep => new ExpansionHarvester(creep.id)
        );
    }
}

function itsMyRoom(room: Room) {
    return room.controller?.my;
}

export class RoomManager {
    static start() {
        _.forEach(Game.rooms, room => {
            if (itsMyRoom(room)) {
                const myRoom = new MyRoom(room);

                if (MY_ROOMS[room.name].type == RoomType.MAIN) {
                    return;
                }

                myRoom.analyst.sourceContainerSpots;

                const containerSpots = myRoom.analyst.sourceContainerSpots;
                const roomHarvesters = myRoom.harvesters;

                if (roomHarvesters.length < Object.keys(containerSpots).length) {
                    const expansionHarvester = {
                        actions: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
                        name: `ExpansionHarvester${roomHarvesters.length + 1}`,
                        spawn: 'Spawn1',
                        opts: {
                            memory: {
                                role: CreepRole.EXPANSION_HARVESTER
                            }
                        }
                    };
                    if (!Game.spawns['Spawn1'].spawning) {
                        Creeps.create(expansionHarvester);
                        // log(`Spawning ExpansionHarvester${roomHarvesters.length + 1}`);
                    }
                }

                _.forEach(roomHarvesters, harvester => {
                    harvester.run();
                });

                _.forEach(Object.entries(containerSpots), ([sourceId, [x, y]]) => {
                    const position = new RoomPosition(x, y, myRoom.name);
                    // const containerBuilt = _.find(
                    //     position.lookFor(LOOK_STRUCTURES),
                    //     structure => structure.structureType == STRUCTURE_CONTAINER
                    // );

                    const roomHarvesters = myRoom.harvesters;
                    // log(roomHarvesters);
                });
            }
        });
    }
}
