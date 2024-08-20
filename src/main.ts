import { ErrorMapper } from "utils/ErrorMapper";
import _ from "lodash";

import Creeps, { CreepRole } from "creep";
import Builder from "role.builder";
import Harvester, { HARVESTERS } from "role.harvester";
import Upgrader from "role.upgrader";
import Repairer from "role.repairer";
import Transporter, { TRANSPORTERS } from "role.transporter";
import Stealer from "role.stealer";
import Towers from "structure.tower";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    sourceId: string;
    transfering: boolean;
    upgrading: boolean;
    building: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

function respawnCreeps() {
  Transporter.spawn();
  if (Creeps.count(CreepRole.TRANSPORTER) < TRANSPORTERS) {
    // do not create any other creep if we dont have expected transporter alive
    return;
  }

  Harvester.spawn();
  if (Creeps.count(CreepRole.HARVESTER) < HARVESTERS) {
    // do not create any other creep if we dont have expected harvesters alive
    return;
  }

  Upgrader.spawn();
  Builder.spawn();
  Repairer.spawn();
  Stealer.spawn();
}

function cleanUp() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log("Clearing non-existing creep memory:", name);
    }
  }
}
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  cleanUp();
  respawnCreeps();

  Towers.run(Game.rooms["E18S28"]);

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role === CreepRole.HARVESTER) {
      Harvester.run(creep);
      continue;
    }

    if (creep.memory.role === CreepRole.BUILDER) {
      Builder.run(creep);
      continue;
    }

    if (creep.memory.role === CreepRole.UPGRADER) {
      Upgrader.run(creep);
      continue;
    }

    if (creep.memory.role === CreepRole.REPAIRER) {
      Repairer.run(creep);
      continue;
    }

    if (creep.memory.role === CreepRole.TRANSPORTER) {
      Transporter.run(creep);
      continue;
    }

    if (creep.memory.role === CreepRole.STEALER) {
      Stealer.run(creep);
      continue;
    }
  }
});
