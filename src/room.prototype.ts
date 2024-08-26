Object.defineProperty(Room.prototype, 'spawn', {
    get() {
        const storedSpawn: string | undefined = this.memory.spawnId;
        if (storedSpawn) {
            return Game.getObjectById<StructureSpawn>(storedSpawn as Id<StructureSpawn>);
        }

        const spawn: StructureSpawn = this.find(FIND_MY_SPAWNS)[0];
        this.memory.spawnId = spawn.id;

        return spawn;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'unfinishedSpawn', {
    get() {
        return this.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (structure: Structure) => structure.structureType === STRUCTURE_SPAWN
        })[0];
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'sources', {
    get() {
        const storedSources: string[] | undefined = this.memory.sources;
        if (storedSources) {
            return _.map(storedSources, sourceId => Game.getObjectById<Source>(sourceId as Id<Source>));
        }

        const roomSources = _.map(this.find(FIND_SOURCES), source => source.id);
        this.memory.sources = roomSources;
        return _.map(roomSources, sourceId => Game.getObjectById<Source>(sourceId as Id<Source>));
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'towers', {
    get() {
        return this.find(FIND_STRUCTURES, {
            filter: (structure: Structure) => structure.structureType === STRUCTURE_TOWER
        })[0];
    },
    enumerable: false,
    configurable: true
});
