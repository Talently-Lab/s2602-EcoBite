import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const shadcnRequire = createRequire(require.resolve("shadcn"));
const registryRequire = createRequire(shadcnRequire.resolve("@shadcn/registry"));
const deepmergePath = shadcnRequire.resolve("deepmerge");
const mergeImplementations = [
  ["shadcn", shadcnRequire("deepmerge")],
  ["registry", registryRequire("deepmerge")],
  ["UMD", require(join(dirname(deepmergePath), "umd.js"))],
];

for (const [name, merge] of mergeImplementations) {
  const payload = JSON.parse('{"__proto__":{"injected":true},"safe":"value"}');
  const targets = [
    {},
    Object.create(null),
    JSON.parse('{"__proto__":{"injected":true}}'),
    null,
    undefined,
    false,
    0,
    "",
  ];
  for (const target of targets) {
    const result = merge(target, payload);
    assert.equal(Object.getPrototypeOf(result), Object.prototype, name);
    assert.equal(result.injected, undefined, name);
    assert.equal(Object.hasOwn(result, "__proto__"), false, name);
    assert.equal(result.safe, "value", name);
  }
  const unsafeTarget = JSON.parse('{"__proto__":{"injected":true},"safe":"value"}');
  assert.deepEqual(merge(unsafeTarget, {}), { safe: "value" }, name);
  const getterPayload = Object.defineProperty({}, "__proto__", {
    enumerable: true,
    get() { throw new Error("Forbidden property was read"); },
  });
  assert.deepEqual(merge(getterPayload, {}), {}, name);
  assert.deepEqual(merge({}, getterPayload), {}, name);
  for (const value of [null, 0, Object.create(null), unsafeTarget]) {
    const result = merge({ settings: value }, { settings: payload });
    assert.equal(Object.getPrototypeOf(result.settings), Object.prototype, name);
    assert.equal(result.settings.injected, undefined, name);
    assert.equal(result.settings.safe, "value", name);
  }
  assert.deepEqual(merge.all([Object.create(null), payload]), { safe: "value" }, name);
  assert.deepEqual(merge([], [payload]), [{ safe: "value" }], name);
  assert.deepEqual(merge(Object.create(null), payload, { clone: false }), { safe: "value" }, name);
  assert.deepEqual(merge({}, {
    constructor: { label: "safe" }, prototype: { label: "safe" },
  }), { prototype: { label: "safe" } }, name);
  assert.deepEqual(merge({ constructor: { one: 1 } }, {
    constructor: { two: 2 },
  }), { constructor: { one: 1, two: 2 } }, name);
  const inheritedTarget = Object.create({ inherited: "blocked" });
  inheritedTarget.own = "before";
  assert.deepEqual(merge(inheritedTarget, {
    inherited: "blocked", own: "after",
  }), { own: "after" }, name);
  const symbol = Symbol("key");
  const target = { nested: { one: 1 }, items: [{ one: 1 }], [symbol]: "before" };
  const source = { nested: { two: 2 }, items: [{ two: 2 }], [symbol]: "after" };
  const result = merge(target, source);
  assert.deepEqual(result, {
    nested: { one: 1, two: 2 }, items: [{ one: 1 }, { two: 2 }], [symbol]: "after",
  }, name);
  assert.notEqual(result.nested, target.nested, name);
  assert.deepEqual(target.nested, { one: 1 }, name);
  assert.deepEqual(source.nested, { two: 2 }, name);
  assert.deepEqual(merge({ items: [1] }, { items: [2] }, {
    arrayMerge: (_target, next) => next,
  }), { items: [2] }, name);
  assert.deepEqual(merge({ name: { first: "one" } }, { name: { second: "two" } }, {
    customMerge: (key) => key === "name" ? (a, b) => ({ label: `${a.first}:${b.second}` }) : undefined,
  }), { name: { label: "one:two" } }, name);
}
assert.equal(Object.prototype.injected, undefined);
console.log("PASS: deepmerge prototype-poisoning regressions and normal merge behavior");

const tsMorphRequire = createRequire(shadcnRequire.resolve("ts-morph"));
const commonRequire = createRequire(tsMorphRequire.resolve("@ts-morph/common"));
assert.equal(commonRequire("minimatch/package.json").version, "11.0.3");
const { Project } = shadcnRequire("ts-morph");
const project = new Project({ useInMemoryFileSystem: true });
for (const path of ["src/a.ts", "src/ui/button.tsx", "src/a.test.ts", "src/a.js"]) {
  project.createSourceFile(path, "export const value = 1;");
}
assert.deepEqual(
  project.getSourceFiles(["src/**/*.{ts,tsx}", "!src/**/*.test.ts"])
    .map((file) => file.getFilePath()).sort(),
  ["/src/a.ts", "/src/ui/button.tsx"],
);
const { minimatch } = commonRequire("minimatch");
for (const [path, pattern, expected] of [
  ["src/ui/button.tsx", "src/**/*.{ts,tsx}", true],
  ["src/ui/button.tsx", "src/**/!(*.test).tsx", true],
  ["src/ui/button.test.tsx", "src/**/!(*.test).tsx", false],
  ["src/a.ts", "src/[ab].ts", true],
  ["src/c.ts", "src/[ab].ts", false],
  ["src/.hidden.ts", "src/*.ts", false],
]) {
  assert.equal(minimatch(path, pattern), expected, `${path}: ${pattern}`);
}
const file = project.getSourceFileOrThrow("src/a.ts");
file.addImportDeclaration({ namedImports: ["useState"], moduleSpecifier: "react" });
assert.match(file.getFullText(), /import \{ useState \} from "react";/);
console.log("PASS: minimatch 11 through ts-morph glob selection and source editing");

const devtoolsRequire = createRequire(require.resolve("@tanstack/react-query-devtools"));
const queryDevtoolsRequire = createRequire(devtoolsRequire.resolve("@tanstack/query-devtools"));
const solidRequire = createRequire(queryDevtoolsRequire.resolve("solid-js"));
const { serialize } = solidRequire("seroval");
assert.equal(solidRequire("seroval/package.json").version, "1.6.11");
assert.equal(serialize(new RegExp("</script>")).includes("</script>"), false);
const array = new Uint8Array([1, 2]);
Object.defineProperty(array, "constructor", { value: { name: "UntrustedConstructor" } });
const serialized = serialize(array);
assert.equal(serialized.includes("UntrustedConstructor"), false);
assert.equal(serialized.includes("Uint8Array"), true);
const dotenvRequire = createRequire(shadcnRequire.resolve("@dotenvx/dotenvx"));
assert.equal(dotenvRequire("systeminformation/package.json").version, "5.33.16");
console.log("PASS: patched seroval serialization and systeminformation resolution");
