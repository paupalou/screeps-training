import { log } from './utils';

class RoomMap {
    #terrain: RoomTerrain;
    constructor(room: string) {
        this.#terrain = new Room.Terrain(room);
    }

    public isPositionPlain(pos: RoomPosition) {
        return this.#terrain.get(pos.x, pos.y) == 0;
    }

    public canBuildInPosition(pos: RoomPosition) {
        return this.#terrain.get(pos.x, pos.y) != TERRAIN_MASK_WALL;
    }
}

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

    get harvestSpots() {
        const roomSources = this.sources;
        const roomSpawn = this.spawn ?? this.unfinishedSpawn;

        _.forEach(roomSources, source => {
            if (!source) {
                return;
            }

            const storedSpots = this.#room.memory.harvestSpots;
            if (storedSpots && Object.keys(storedSpots).length == roomSources.length) {
                return this.#room.memory.harvestSpots;
            }

            const roomMap = new RoomMap(this.#room.name);

            // Starting from top left
            // [ (-1, -1), (0, -1), (1, -1) ]
            // [ (-1,  0), SOURCE,  (1,  0) ]
            // [ (-1,  1), (0, 1),  (1,  1) ]
            const possibleSpots = [
                [-1, -1],
                [0, -1],
                [1, -1],
                [-1, 0],
                [1, 0],
                [-1, 1],
                [0, 1],
                [1, 1]
            ];

            const miningBestSpot = _.map(
                possibleSpots,
                ([x, y]) => new RoomPosition(source.pos.x + x, source.pos.y + y, this.#room.name)
            )
                .filter(adjacentSpot => roomMap.canBuildInPosition(adjacentSpot))
                .reduce((acc, position) => {
                    if (!acc) {
                        return position;
                    }

                    if (PathFinder.search(acc, roomSpawn.pos).cost > PathFinder.search(position, roomSpawn.pos).cost) {
                        return position;
                    }

                    return acc;
                });

            if (!miningBestSpot) {
                return {};
            }

            if (storedSpots) {
                this.#room.memory.harvestSpots = {
                    ...storedSpots,
                    [source.id]: [miningBestSpot.x, miningBestSpot.y]
                };
            } else {
                this.#room.memory.harvestSpots = { [source.id]: [miningBestSpot.x, miningBestSpot.y] };
            }
        });

        return this.#room.memory.harvestSpots;
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
                log(myRoom.harvestSpots);
            }
        });
    }
}
