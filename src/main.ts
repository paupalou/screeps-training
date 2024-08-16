export function loop(): void {
  for (const name in Game.creeps) {
    console.log(`Creep ${name}`);
    const creep = Game.creeps[name];
 }
}
