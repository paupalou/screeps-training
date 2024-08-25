import { RoomAnalyst } from './room.analyst';
import { SourceManager } from './source.manager';
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
    sourceManager: SourceManager | null;

    constructor(room: Room) {
        this.#room = room;
        this.analyst = new RoomAnalyst(this);
        log(`====== Room ${room.name} ======`); 
        log(this.analyst.sourceContainerSpots);
        log(`=====================`); 
        this.sourceManager = room.name == 'E18S28' ? null : new SourceManager(room);
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
}

function itsMyRoom(room: Room) {
    return room.controller?.my;
}

export class RoomManager {
    static start() {
        _.forEach(Game.rooms, room => itsMyRoom(room) && new MyRoom(room));
    }
}
