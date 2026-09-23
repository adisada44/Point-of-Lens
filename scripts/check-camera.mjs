import assert from 'node:assert/strict';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {ANCHOR_STATE, anglePositionAssets, cameraAngles, cameraPositions, coreLearningAssets, getChoice, parameters, railKeyIndex, requiredCoreAssets, resolvePreview, rollTransforms, selectParameter, shotSizeTransforms, snapIndex, taxonomy, validateCameraPatch} from '../src/data.ts';

const root = new URL('../', import.meta.url);
const allViews = [];
let combinations = 0;
for (const angle of cameraAngles) {
  for (const position of cameraPositions) {
    const expected = `/assets/western/views/${angle}__${position}.webp`;
    allViews.push(expected);
    for (const size of taxonomy.size.choices) {
      for (const roll of taxonomy.roll.choices) {
        const state = {size:size.id, angle, position, roll:roll.id};
        const result = resolvePreview(state, 'combinations');
        assert.equal(result.asset.src, expected, 'Shot size and roll must never change the viewpoint');
        assert.equal(result.asset.filename, `${angle}__${position}.webp`);
        assert.deepEqual(result, resolvePreview({...state}, 'combinations'), 'Resolution must be deterministic');
        assert.equal(result.framing, shotSizeTransforms[size.id]);
        assert.equal(result.roll, rollTransforms[roll.id]);
        assert.ok(Number.isFinite(result.framing.scale) && result.framing.scale >= 1);
        assert.ok(Number.isFinite(result.rollScale) && result.rollScale >= 1);
        assert.ok(!('yaw' in result) && !('pitch' in result));
        combinations++;
      }
    }
  }
}
assert.equal(new Set(allViews).size, 15);
const anchorAsset = resolvePreview(ANCHOR_STATE, 'explore').asset;
assert.equal(anchorAsset, anglePositionAssets.eye['three-quarter']);
assert.ok(existsSync(fileURLToPath(new URL(`public${anchorAsset.src}`, root))), 'The supplied canonical photograph must be installed');
const missing = allViews.filter(src => !existsSync(fileURLToPath(new URL(`public${src}`, root))));
for (const src of missing) assert.notEqual(src, anchorAsset.src, 'Missing views retain their own expected paths');

const coreFilenames = [
  'eye__three-quarter.webp', 'shot-size__extreme-wide.webp', 'shot-size__wide.webp',
  'shot-size__close.webp', 'shot-size__extreme-close.webp', 'birds-eye__three-quarter.webp',
  'high__three-quarter.webp', 'low__three-quarter.webp', 'worms-eye__three-quarter.webp',
  'eye__front.webp', 'eye__profile.webp',
];
assert.deepEqual(requiredCoreAssets.map(asset => asset.filename).sort(), coreFilenames.sort());
for (const asset of requiredCoreAssets) {
  const path = new URL(`public${asset.src}`, root);
  assert.ok(statSync(path).isFile(), `Required lesson photograph: ${asset.filename}`);
  const bytes = readFileSync(path);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
}

// Exercise every individual lesson from a previously combined state, including
// the dedicated size photograph (never its combination crop).
let lessons = 0;
for (const parameter of parameters) {
  for (const choice of taxonomy[parameter].choices) {
    const state = selectParameter({size:'close', angle:'low', position:'profile', roll:'dutch-right'}, 'explore', parameter, choice.id);
    const result = resolvePreview(state, 'explore');
    assert.equal(result.asset, coreLearningAssets[parameter][choice.id]);
    assert.equal(result.framing.scale, 1, 'Individual lessons must not simulate size by zooming');
    assert.equal(result.fit, 'cover', 'Photographs fill the preview without side gaps');
    assert.equal(result.roll, rollTransforms[state.roll]);
    if (parameter === 'roll') assert.equal(result.asset, anchorAsset);
    lessons++;
  }
}
const sameState = {...ANCHOR_STATE, size:'close'};
assert.equal(resolvePreview(sameState, 'explore').asset.filename, 'shot-size__close.webp');
assert.equal(resolvePreview(sameState, 'combinations').asset, anchorAsset);
assert.equal(resolvePreview({size:'close', angle:'low', position:'profile', roll:'dutch-right'}, 'combinations').asset.filename, 'low__profile.webp');

const combined = {size:'close', angle:'low', position:'profile', roll:'dutch-right'};
for (const parameter of parameters) {
  for (const choice of taxonomy[parameter].choices) {
    assert.deepEqual(selectParameter(combined, 'explore', parameter, choice.id), {...ANCHOR_STATE, [parameter]:choice.id});
    assert.deepEqual(selectParameter(combined, 'combinations', parameter, choice.id), {...combined, [parameter]:choice.id});
    assert.ok(getChoice(parameter, choice.id).description);
  }
  const choices = taxonomy[parameter].choices;
  for (let x = -1; x <= 2; x += .013) {
    const snapped = snapIndex(x, choices.length);
    assert.ok(Number.isInteger(snapped) && choices[snapped], 'Every drag position must snap to a valid named setting');
  }
  for (let i = 0; i < choices.length; i++) {
    assert.equal(snapIndex(i / (choices.length - 1), choices.length), i);
    assert.equal(railKeyIndex('ArrowRight', i, choices.length), Math.min(i + 1, choices.length - 1));
    assert.equal(railKeyIndex('ArrowLeft', i, choices.length), Math.max(0, i - 1));
    assert.equal(railKeyIndex('Home', i, choices.length), 0);
    assert.equal(railKeyIndex('End', i, choices.length), choices.length - 1);
    assert.equal(railKeyIndex('Tab', i, choices.length), null);
  }
}
assert.deepEqual(combined, {size:'close', angle:'low', position:'profile', roll:'dutch-right'}, 'Selections must not mutate existing state');
assert.throws(() => selectParameter(combined, 'combinations', 'angle', 'invalid'));
for (const bad of [null, {}, [], {distance:5}, {angle:35}, {angle:'unknown'}, {size:'close', extra:'value'}]) assert.throws(() => validateCameraPatch(bad));
assert.deepEqual(validateCameraPatch({size:'close', angle:'low'}), {size:'close', angle:'low'});

const sourceFiles = ['src/main.tsx', 'src/CinematicPreview.tsx', 'src/CameraPanel.tsx', 'src/DiscreteParameterRail.tsx', 'src/Diagram.tsx', 'src/style.css', 'src/westernAssets.ts', 'src/previewResolver.ts'];
for (const path of sourceFiles) {
  const source = readFileSync(new URL(path, root), 'utf8');
  assert.doesNotMatch(source, /rotate[XY]\s*\(|perspective\s*\(|skew[XY]?\s*\(/, path);
}
const diagram = readFileSync(new URL('src/Diagram.tsx', root), 'utf8');
assert.doesNotMatch(diagram, /onPointer|onKeyDown|role="slider"|tabIndex/, 'The diagram must be read-only');
const rail = readFileSync(new URL('src/DiscreteParameterRail.tsx', root), 'utf8');
assert.match(rail, /aria-valuetext/);
assert.match(rail, /onPointerCancel/);
const preview = readFileSync(new URL('src/CinematicPreview.tsx', root), 'utf8');
assert.doesNotMatch(preview, /ANCHOR_STATE|anchor\.webp|low\.webp|profile\.webp/, 'The preview must not substitute legacy images');
assert.match(preview, /setStatus\('missing'\)/);
console.log(`Passed: 11 core photographs, ${lessons} dedicated individual lessons, 15 distinct view paths, ${combinations} combinations, ${missing.length} explicit missing views, isolation, preservation, semantic snapping, keyboard boundaries, and no viewpoint warping.`);

