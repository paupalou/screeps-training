// Make sure the method has not already been overwritten
if (!StructureSpawn.prototype._spawnCreep) {
    StructureSpawn.prototype._spawnCreep = StructureSpawn.prototype.spawnCreep;

    // The original signature: spawnCreep(body, name, opts)
    // Make a new version with the signature createCreep(body, opts)
    StructureSpawn.prototype.spawnCreep = function (body, name, opts = {}) {
        // Now we need to generate a name and make sure it hasnt been taken
        let creepCounter = 0;
        let nameWithCounter: string;
        let dryRun: ScreepsReturnCode;
        do {
            nameWithCounter = `${name}${creepCounter++}`;
            dryRun = this._spawnCreep(body, nameWithCounter, { ...opts, dryRun: true });
        } while (dryRun !== ERR_NAME_EXISTS);

        // Now we call the original function passing in our generated name and
        // returning the value
        return this._spawnCreep(body, name, opts);
        // return -6;
    };
}
