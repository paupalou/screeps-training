import { RoomMap } from './room.map';
import { getAdjacentPositions } from './utils';

export class RoomAnalyst {
    static work(room: Room) {
        RoomAnalyst.findBestHarvestSpots(room);
        RoomAnalyst.findSourceContainerSpots(room);
    }

    static findBestHarvestSpots(room: Room) {
        const roomSources = room.sources;
        const roomSpawn = room.spawn ?? room.unfinishedSpawn;

        _.forEach(roomSources, source => {
            if (!source) {
                return;
            }

            let storedSpots = room.memory.harvestSpots;
            if (storedSpots && Object.keys(storedSpots).length == roomSources.length) {
                return;
            }

            const roomMap = new RoomMap(room.name);
            const miningBestSpot = getAdjacentPositions(source.pos, room.name)
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

            storedSpots = room.memory.containerBestSpots;
            if (storedSpots && Object.keys(storedSpots).length) {
                room.memory.harvestSpots = {
                    ...storedSpots,
                    [source.id]: [miningBestSpot.x, miningBestSpot.y]
                };
            } else {
                room.memory.harvestSpots = { [source.id]: [miningBestSpot.x, miningBestSpot.y] };
            }
        });
    }

    static findSourceContainerSpots(room: Room) {
        RoomAnalyst.findBestHarvestSpots(room);
        const harvestSpots = room.memory.harvestSpots;

        let storedSpots = room.memory.containerSpots;
        if (storedSpots && harvestSpots && Object.keys(storedSpots).length == Object.keys(harvestSpots).length) {
            return;
        }

        const roomSpawn = room.spawn ?? room.unfinishedSpawn;
        _.forEach(Object.keys(harvestSpots), sourceId => {
            const roomMap = new RoomMap(room.name);
            const [x, y] = harvestSpots[sourceId];
            const spotPosition = new RoomPosition(x, y, room.name);
            const containerBestSpot = getAdjacentPositions(spotPosition, room.name)
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

            storedSpots = room.memory.containerBestSpots;
            if (storedSpots && Object.keys(storedSpots).length) {
                room.memory.containerBestSpots = {
                    ...storedSpots,
                    [sourceId]: [containerBestSpot.x, containerBestSpot.y]
                };
            } else {
                room.memory.containerBestSpots = { [sourceId]: [containerBestSpot.x, containerBestSpot.y] };
            }
        });
    }
}
