import test from "node:test";
import assert from "node:assert/strict";
import { advanceActor, availableSeat, initialActors, requestPose, SCHOOL_ROUTES } from "../game/actors.ts";
import { canWalk, ENTITIES } from "../game/story.ts";
import { POSE_ATLASES } from "../game/graphics.ts";

test("Schulfreunde laufen mit echten Zwischenbildern auf begehbaren Wegen", () => {
  for (const id of Object.keys(SCHOOL_ROUTES)) {
    let actor = initialActors()[id];
    const frames = new Set(), positions = new Set();
    for (let i = 0; i < 2400; i++) {
      actor = advanceActor("school", id, actor, 1 / 60);
      assert.ok(canWalk("school", actor.position.x, actor.position.y), id);
      if (actor.moving) frames.add(actor.frame);
      positions.add(`${actor.position.x.toFixed(2)},${actor.position.y.toFixed(2)}`);
    }
    assert.ok(frames.has(1) && frames.has(2), id);
    assert.ok(positions.size > 10, id);
  }
});

test("Jeder Freund erreicht Sitz- und Liegeplatz, steht auf und gibt den Platz frei", () => {
  for (const place of ["school", "range", "home", "bus", "kitchen"]) {
    for (const entity of ENTITIES[place].filter(e => initialActors()[e.id])) {
      for (const pose of ["sitting", "lying"]) {
        let actors = initialActors();
        const seat = availableSeat(place, pose, actors[entity.id].position, actors);
        assert.ok(seat, `${place}: ${entity.id} ${pose}`);
        let actor = requestPose(place, actors[entity.id], pose, seat);
        assert.equal(actor.pose, "standing", "Geht erst zum Ruheplatz");
        for (let i = 0; i < 3000 && actor.pose !== pose; i++) actor = advanceActor(place, entity.id, actor, 1 / 60);
        assert.equal(actor.pose, pose, `${place}: ${entity.id} ${pose}`);
        assert.deepEqual(actor.position, seat.position);
        assert.equal(actor.moving, false);
        actor = requestPose(place, actor, "standing");
        assert.equal(actor.restId, undefined);
        for (let i = 0; i < 600 && actor.route.length; i++) actor = advanceActor(place, entity.id, actor, 1 / 60);
        assert.equal(actor.route.length, 0, `${entity.id}: Aufstehen`);
        assert.ok(canWalk(place, actor.position.x, actor.position.y));
      }
    }
  }
});

test("Ruheplätze werden während des Hinlaufens reserviert; Felices Platz bleibt frei", () => {
  const actors = initialActors();
  const seat = availableSeat("school", "sitting", actors.friends.position, actors);
  actors.friends = requestPose("school", actors.friends, "sitting", seat);
  assert.notEqual(availableSeat("school", "sitting", actors.jason.position, actors).id, seat.id);
  assert.notEqual(availableSeat("school", "sitting", actors.jason.position, actors, seat.spot.id).spot.id, seat.spot.id);
});

test("Haltungswechsel verlassen zuerst die alte Bank und führen zur Decke und zurück", () => {
  for (const place of ["school", "range", "home", "bus", "kitchen"]) for (const entity of ENTITIES[place].filter(e => initialActors()[e.id])) {
    const actors = initialActors();
    for (const pose of ["sitting", "lying", "sitting", "standing"]) {
      const seat = pose === "standing" ? undefined : availableSeat(place, pose, actors[entity.id].position, actors);
      let actor = requestPose(place, actors[entity.id], pose, seat);
      for (let i = 0; i < 3000 && (actor.pose !== pose || actor.route.length); i++) actor = advanceActor(place, entity.id, actor, 1 / 60);
      assert.equal(actor.pose, pose, `${place}: ${entity.id} ${pose}`);
      assert.equal(actor.route.length, 0, `${place}: ${entity.id} ${pose} angekommen`);
      actors[entity.id] = actor;
    }
  }
});

test("Alle neuen Lauf- und Ruhebilder liegen vollständig innerhalb ihres Atlasses", () => {
  for (const atlas of Object.values(POSE_ATLASES)) for (const row of atlas.frames) for (const [x, y, w, h] of row) {
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= atlas.size[0] && y + h <= atlas.size[1]);
  }
});

test("Eine neue Haltung während des Aufstehens ersetzt das alte Ziel zuverlässig", () => {
  const actors = initialActors();
  let actor = requestPose("school", actors.friends, "sitting", availableSeat("school", "sitting", actors.friends.position, actors));
  for (let i = 0; i < 3000 && actor.pose !== "sitting"; i++) actor = advanceActor("school", "friends", actor, 1 / 60);
  actor = requestPose("school", actor, "lying", availableSeat("school", "lying", actor.position, { ...actors, friends: actor }));
  for (let i = 0; i < 3; i++) actor = advanceActor("school", "friends", actor, 1 / 60);
  actor = requestPose("school", actor, "sitting", availableSeat("school", "sitting", actor.position, { ...actors, friends: actor }));
  for (let i = 0; i < 3000 && actor.pose !== "sitting"; i++) actor = advanceActor("school", "friends", actor, 1 / 60);
  assert.equal(actor.pose, "sitting");
});
