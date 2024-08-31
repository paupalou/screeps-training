import { RoomMap } from './room.map';
import { byFarestTo } from './sort';
import { getAdjacentPositions, log } from './utils';

export class RoomAnalyst {
    static work(room: Room) {
        // controller
        RoomAnalyst.findControllerUpgraderSpots(room);

        // sources
        RoomAnalyst.findBestHarvestEnergySpots(room);
        RoomAnalyst.findSourceContainerSpots(room);

        // minerals
        RoomAnalyst.findBestExtractMineralSpots(room);
    }

    static findControllerUpgraderSpots(room: Room) {
        if (room.memory.upgraderSpots || !room.controller || !room.controller.my) {
            return;
        }

        log(`setting controller upgrader spots for room ${room.name}`);

        const controllerPosition = room.controller.pos;
        const controllerContainer = controllerPosition.findInRange(FIND_STRUCTURES, 4, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
        })[0];

        if (!controllerContainer) {
            return;
        }

        const upgraderPositions = getAdjacentPositions(controllerContainer.pos, room.name)
            .filter(pos => {
                if (new Room.Terrain(room.name).get(pos.x, pos.y) == TERRAIN_MASK_WALL) {
                    return false;
                }
                const harvestSpots: [number, number][] = Object.values(room.memory.harvestSpots);
                const collisionWithHarvestSpot = harvestSpots.some(
                    ([spotX, spotY]) => spotX == pos.x && spotY == pos.y
                );
                if (collisionWithHarvestSpot) {
                    return false;
                }

                return pos.getRangeTo(controllerPosition) <= 3;
            })
            .sort((posA, posB) => byFarestTo(posA, posB).spawn(room.spawn))
            .slice(0, 3);

        room.memory.upgraderSpots = upgraderPositions.map(pos => [pos.x, pos.y]);
    }

    static findBestHarvestEnergySpots(room: Room) {
        if (room.memory.harvestSpots) {
            return;
        }

        log(`setting harvest spots for room ${room.name}`);

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
            const miningBestSpots = getAdjacentPositions(source.pos, room.name)
                .filter(
                    adjacentSpot =>
                        roomMap.isNotWallPosition(adjacentSpot) &&
                        adjacentSpot.lookFor(LOOK_STRUCTURES).filter(s => s.structureType == STRUCTURE_WALL).length == 0
                )
                // .reduce((acc, position) => {
                //     if (!acc) {
                //         return position;
                //     }
                //
                //     if (PathFinder.search(acc, roomSpawn.pos).cost > PathFinder.search(position, roomSpawn.pos).cost) {
                //         return position;
                //     }
                //
                //     return acc;
                // });
                .map(position => {
                    const costToSpawn = PathFinder.search(position, roomSpawn.pos).cost;
                    return [costToSpawn, [position.x, position.y]];
                })
                .sort(([positionCostA], [positionCostB]) => {
                    if (positionCostA > positionCostB) {
                        return 1;
                    } else if (positionCostB > positionCostA) {
                        return -1;
                    }

                    return 0;
                });

            if (miningBestSpots.length == 0) {
                return;
            }

            storedSpots = room.memory.harvestSpots;
            const positions = miningBestSpots.map(([, position]) => position);
            if (storedSpots && Object.keys(storedSpots).length) {
                room.memory.harvestSpots = {
                    ...storedSpots,
                    [source.id]: positions
                };
            } else {
                room.memory.harvestSpots = positions;
            }
        });
    }

    static findBestExtractMineralSpots(room: Room) {
        if (room.memory.extractSpots) {
            return;
        }

        log(`setting mineral extract spots for room ${room.name}`);

        const roomMinerals = room.minerals;
        const roomSpawn = room.spawn ?? room.unfinishedSpawn;

        _.forEach(roomMinerals, mineral => {
            if (!mineral) {
                return;
            }

            let storedSpots = room.memory.extractSpots;
            if (storedSpots && Object.keys(storedSpots).length == roomMinerals.length) {
                return;
            }

            const roomMap = new RoomMap(room.name);
            const extractBestSpot = getAdjacentPositions(mineral.pos, room.name)
                .filter(
                    adjacentSpot =>
                        roomMap.isNotWallPosition(adjacentSpot) &&
                        adjacentSpot.lookFor(LOOK_STRUCTURES).filter(s => s.structureType == STRUCTURE_WALL).length == 0
                )
                .reduce((acc, position) => {
                    if (!acc) {
                        return position;
                    }

                    if (PathFinder.search(acc, roomSpawn.pos).cost > PathFinder.search(position, roomSpawn.pos).cost) {
                        return position;
                    }

                    return acc;
                });

            if (!extractBestSpot) {
                return;
            }

            storedSpots = room.memory.extracSpots;
            if (storedSpots && Object.keys(storedSpots).length) {
                room.memory.extractSpots = {
                    ...storedSpots,
                    [mineral.id]: [extractBestSpot.x, extractBestSpot.y]
                };
            } else {
                room.memory.extractSpots = { [mineral.id]: [extractBestSpot.x, extractBestSpot.y] };
            }
        });
    }

    static findSourceContainerSpots(room: Room) {
        const harvestSpots = room.memory.harvestSpots;

        let storedSpots = room.memory.containerSpots;
        if (storedSpots && harvestSpots && Object.keys(storedSpots).length == Object.keys(harvestSpots).length) {
            return;
        }

        log(`setting source container spots for room ${room.name}`);

        const roomSpawn = room.spawn ?? room.unfinishedSpawn;
        _.forEach(Object.keys(harvestSpots), sourceId => {
            const roomMap = new RoomMap(room.name);
            const [x, y] = harvestSpots[sourceId][0];
            const spotPosition = new RoomPosition(x, y, room.name);
            const containerBestSpot = getAdjacentPositions(spotPosition, room.name)
                .filter(adjacentSpot => roomMap.isNotWallPosition(adjacentSpot))
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
                return;
            }

            storedSpots = room.memory.containerSpots;
            if (storedSpots && Object.keys(storedSpots).length) {
                room.memory.containerSpots = {
                    ...storedSpots,
                    [sourceId]: [containerBestSpot.x, containerBestSpot.y]
                };
            } else {
                room.memory.containerSpots = { [sourceId]: [containerBestSpot.x, containerBestSpot.y] };
            }
        });
    }
}
