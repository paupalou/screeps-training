import { RoomMap } from './room.map';
import { getAdjacentPositions } from '../utils';

interface SourceSpots {
    [key: string]: [number, number];
}

interface ContainerSpots extends SourceSpots {}

export class SourceArchitect {
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

    get harvestSpots(): SourceSpots {
        const roomSources = this.sources;
        const roomSpawn = this.spawn ?? this.unfinishedSpawn;

        _.forEach(roomSources, source => {
            if (!source) {
                return;
            }

            let storedSpots = this.#room.memory.harvestSpots;
            if (storedSpots && Object.keys(storedSpots).length == roomSources.length) {
                return this.#room.memory.harvestSpots;
            }

            const roomMap = new RoomMap(this.#room.name);
            const miningBestSpot = getAdjacentPositions(source.pos, this.#room.name)
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

            storedSpots = this.#room.memory.containerBestSpots;
            if (storedSpots && Object.keys(storedSpots).length) {
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

    get sourceContainerSpots(): ContainerSpots {
        const harvestSpots = this.harvestSpots;

        let storedSpots = this.#room.memory.containerSpots;
        if (storedSpots && harvestSpots && Object.keys(storedSpots).length == Object.keys(harvestSpots).length) {
            return this.#room.memory.containerSpots;
        }

        const roomSpawn = this.spawn ?? this.unfinishedSpawn;
        _.forEach(Object.keys(harvestSpots), sourceId => {
            const roomMap = new RoomMap(this.#room.name);
            const [x, y] = harvestSpots[sourceId];
            const spotPosition = new RoomPosition(x, y, this.#room.name);
            const containerBestSpot = getAdjacentPositions(spotPosition, this.#room.name)
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

            if (!containerBestSpot) {
                return {};
            }

            storedSpots = this.#room.memory.containerBestSpots;
            if (storedSpots && Object.keys(storedSpots).length) {
                this.#room.memory.containerBestSpots = {
                    ...storedSpots,
                    [sourceId]: [containerBestSpot.x, containerBestSpot.y]
                };
            } else {
                this.#room.memory.containerBestSpots = { [sourceId]: [containerBestSpot.x, containerBestSpot.y] };
            }
        });

        return this.#room.memory.containerBestSpots;
    }
}
