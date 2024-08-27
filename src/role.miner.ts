import Creeps from './creep';

export default {
    work(creep: Creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
            creep.say('⛏️ harvest');
        }
        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
            creep.say('🫳 store');
        }

        const workSpot = creep.memory.workSpot;

        if (creep.memory.transfering) {
            const labs = creep.room.find(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_LAB
            });
            const cargo = Object.keys(creep.store) as ResourceConstant[];
            if (labs.length && (labs[0].store.getFreeCapacity() ?? 0) > 0) {
                _.forEach(cargo, resource => {
                    Creeps.transfer(creep, resource).to(labs[0]);
                });
            } else if (creep.room.storage) {
                _.forEach(cargo, resource => {
                    Creeps.transfer(creep, resource).to(creep.room.storage);
                });
            }
        } else if (workSpot && (creep.pos.x != workSpot[0] || creep.pos.y != workSpot[1])) {
            creep.moveTo(workSpot[0], workSpot[1], { visualizePathStyle: { stroke: '#ffaa00' } });
        } else if (!workSpot) {
            const mineralId = creep.room.memory.minerals[0];
            creep.memory.mineralId = mineralId;
            creep.memory.workSpot = creep.room.memory.extractSpots[mineralId];
        } else {
            const mineral = Game.getObjectById(creep.memory.mineralId as Id<Mineral>);
            mineral && creep.harvest(mineral);
        }
    }
};
