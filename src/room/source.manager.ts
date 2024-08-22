import Creeps, { CreepRole } from './creep';
import ExpansionHarvester from './role.expansionHarvester';
import { SourceArchitect } from './room.analyst';

// export class SourceManager {
//                 const containerSpots = myRoom.analyst.sourceContainerSpots;
//                 const roomHarvesters = myRoom.harvesters;
//
//                 if (roomHarvesters.length < Object.keys(containerSpots).length) {
//                     const expansionHarvester = {
//                         actions: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
//                         name: `ExpansionHarvester${roomHarvesters.length + 1}`,
//                         spawn: 'Spawn1',
//                         opts: {
//                             memory: {
//                                 role: CreepRole.EXPANSION_HARVESTER
//                             }
//                         }
//                     };
//                     if (!Game.spawns['Spawn1'].spawning) {
//                         Creeps.create(expansionHarvester);
//                         // log(`Spawning ExpansionHarvester${roomHarvesters.length + 1}`);
//                     }
//                 }
//
//                 _.forEach(roomHarvesters, harvester => {
//                     harvester.run();
//                 });
//
//                 // _.forEach(Object.entries(containerSpots), ([sourceId, [x, y]]) => {
//                 //     const position = new RoomPosition(x, y, myRoom.name);
//                     // const containerBuilt = _.find(
//                     //     position.lookFor(LOOK_STRUCTURES),
//                     //     structure => structure.structureType == STRUCTURE_CONTAINER
//                     // );
//
//                     // const roomHarvesters = myRoom.harvesters;
//                     // log(roomHarvesters);
//                 // });
//             }
//         });
//     }
// }
