Object.defineProperty(Creep.prototype, 'closestContainer', {
    get: function () {
        return this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure: Structure) => structure.structureType == STRUCTURE_CONTAINER
        })[0];
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'isFull', {
    get: function () {
        return this.store.getFreeCapacity() == 0;
    },
    enumerable: false,
    configurable: true
});
