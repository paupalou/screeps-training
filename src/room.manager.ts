import { log } from './utils';

class MyRoom {
    #room: Room;
    constructor(room: Room) {
        this.#room = room;
    }

    get spawn() {
        const storedSpawn: string | undefined = this.#room.memory.spawn;
        if (storedSpawn) {
            Game.getObjectById<StructureSpawn>(storedSpawn as Id<StructureSpawn>);
        }
        return this.#room.find(FIND_MY_SPAWNS)[0];
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

    get sourceContainers() {
        const roomSources = this.sources;
        _.forEach(roomSources, source => {
            if (!source) {
                return;
            }
            log(`checking mining spot for source ${source.pos.x},${source.pos.y})`);

            const bottomLeftSpot = RoomPosition(source.pos.x - 1, source.pos.y + 1, this.#room.name);
            const bottomRightSpot = RoomPosition(source.pos.x + 1, source.pos.y + 1, this.#room.name);
            const topLeftSpot = RoomPosition(source.pos.x - 1, source.pos.y - 1, this.#room.name);
            const topRightSpot = RoomPosition(source.pos.x + 1, source.pos.y - 1, this.#room.name);
        });

        return '';
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
                log(myRoom.sourceContainers);
            }
        });
    }
}
