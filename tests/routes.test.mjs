import test from "node:test";
import assert from "node:assert/strict";
import { advanceActor, standingActor, walkingRoute } from "../game/actors.ts";
import { canWalk, PLACES, SPAWNS, routeTo, parseStory } from "../game/story.ts";

test("Die neuen Fußwege lassen sich bis zu jedem Ausgang und zurück vollständig laufen", () => {
  for (const place of ["radegast", "zoerbig", "goelzau"]) {
    for (const exit of PLACES[place].exits) {
      for (const [from,to] of [[SPAWNS[place],exit],[exit,SPAWNS[place]]]) {
        let actor = { ...standingActor(from), route: walkingRoute(place,from,to) };
        assert.ok(actor.route.length, `${place}: ${exit.label}`);
        for (let i=0;i<3000 && actor.route.length;i++) {
          actor=advanceActor(place,"route-check",actor,1/60);
          assert.ok(canWalk(place,actor.position.x,actor.position.y),place);
        }
        assert.equal(actor.route.length,0,`${place}: ${exit.label}`);
        assert.ok(Math.hypot(actor.position.x-to.x,actor.position.y-to.y)<.003);
      }
    }
  }
});

test("Schul- und Schießweg führen über die neuen Ankunftsorte; alte Kapitelstände bleiben gültig", () => {
  assert.equal(routeTo("home","school").to,"radegast");
  assert.equal(routeTo("bus","school").to,"zoerbig");
  assert.equal(routeTo("bus","range").to,"goelzau");
  for(const place of ["bedroom","home","kitchen","garden","bus","school","range"]) {
    const old={version:1,chapter:"school",step:4,completed:["dog"],place,bag:["Fahrkarte"]};
    assert.deepEqual(parseStory(JSON.stringify(old)),old);
  }
});
