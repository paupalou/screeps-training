export class RoomMap {
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
