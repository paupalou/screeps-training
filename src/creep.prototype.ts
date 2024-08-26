Object.defineProperty(Creep.prototype, 'closestContainer', {
    get() {
        return this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure: Structure) => structure.structureType == STRUCTURE_CONTAINER
        })[0];
    },
    enumerable: false,
    configurable: true
});
