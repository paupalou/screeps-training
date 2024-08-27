export function log(something: string | object) {
    if (typeof something === 'string') {
        console.log(something);
        return;
    }

    if (typeof something === 'object') {
        console.log(JSON.stringify(something, null, 2));
        return;
    }
}

export function getAdjacentPositions(point: RoomPosition, roomName: string) {
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

    return _.map(possibleSpots, ([x, y]) => new RoomPosition(point.x + x, point.y + y, roomName));
}
