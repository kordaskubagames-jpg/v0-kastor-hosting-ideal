// Server-side Lua obfuscation engine.
// Takes raw Lua source and produces a protected build that:
//   1. Encrypts the source into XOR-encoded byte chunks (string crypto)
//   2. Renames the loader internals with random identifiers each build
//   3. Wraps the payload in a runtime decryptor + loadstring VM
//   4. Injects optional anti-tamper / anti-dump / anti-logger guards
//   5. Optionally re-wraps the build N times (layering) per preset
// The output is valid Lua that runs inside Roblox executors.

export type ObfPreset = "luraph" | "smilehub" | "prometheus" | "25ms"

export type ProtectionOptions = {
  preset: ObfPreset
  antiTamper: boolean
  antiDump: boolean
  antiLogger: boolean
}

// Per-preset tuning. keyCount = XOR key rotation length, layers = how many times
// the build is re-wrapped, junk = decoy locals injected, forceGuards = guards on
// regardless of toggles (the heavy presets always ship protected).
const PRESETS: Record<ObfPreset, { keyCount: number; layers: number; junk: number; forceGuards: boolean; label: string }> = {
  "25ms": { keyCount: 4, layers: 1, junk: 2, forceGuards: false, label: "25ms" },
  smilehub: { keyCount: 6, layers: 1, junk: 6, forceGuards: false, label: "Smile Hub" },
  prometheus: { keyCount: 8, layers: 2, junk: 10, forceGuards: true, label: "Prometheus" },
  luraph: { keyCount: 12, layers: 3, junk: 16, forceGuards: true, label: "Luraph" },
}

export const PRESET_META: { value: ObfPreset; label: string; desc: string }[] = [
  { value: "25ms", label: "25ms", desc: "Fast & light — minimal overhead" },
  { value: "smilehub", label: "Smile Hub", desc: "Balanced string encryption" },
  { value: "prometheus", label: "Prometheus", desc: "Strong — 2 layers + forced guards" },
  { value: "luraph", label: "Luraph", desc: "Maximum — 3 layers, heavy junk" },
]

const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

function randName(len = 8): string {
  let s = "_"
  for (let i = 0; i < len; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]
  return s
}

function randByte(): number {
  return Math.floor(Math.random() * 255) + 1
}

// Encrypt the source string into a Lua numeric array using rotating XOR keys.
function encryptSource(src: string, keys: number[]): string {
  const bytes: number[] = []
  for (let i = 0; i < src.length; i++) {
    const code = src.charCodeAt(i)
    const k = keys[i % keys.length]
    bytes.push((code ^ k ^ (i % 251)) & 0xff)
  }
  return "{" + bytes.join(",") + "}"
}

// Decoy local declarations that do nothing but bloat/confuse static analysis.
function junkLines(n: number): string {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const v = randName()
    const kind = Math.random()
    if (kind < 0.4) out.push(`  local ${v} = ${randByte()} * ${randByte()}`)
    else if (kind < 0.7) out.push(`  local ${v} = "${randName(12)}"`)
    else out.push(`  local ${v} = function() return ${randByte()} end`)
  }
  return out.join("\n")
}

function header(scriptName: string, preset: ObfPreset): string {
  return [
    "-- =====================================================================",
    `--  Protected build :: ${scriptName}`,
    `--  Engine: LuaForge [${PRESETS[preset].label}]  -  https://discord.gg/kastorhub`,
    "--  Obfuscated & guarded. Unauthorized redistribution is prohibited.",
    `--  Build: ${new Date().toISOString()}`,
    "-- =====================================================================",
  ].join("\n")
}

// One obfuscation pass: encrypt + wrap + guard a chunk of Lua source.
function wrapOnce(
  source: string,
  opts: ProtectionOptions,
  cfg: { keyCount: number; junk: number; guards: boolean },
): string {
  const V = {
    keys: randName(),
    data: randName(),
    decode: randName(),
    out: randName(),
    i: randName(),
    b: randName(),
    chunk: randName(),
    loader: randName(),
    guard: randName(),
    sb: randName(),
    real: randName(),
  }

  const keys = Array.from({ length: cfg.keyCount }, randByte)
  const encrypted = encryptSource(source, keys)
  const keyTable = "{" + keys.join(",") + "}"

  const antiLogger =
    cfg.guards && opts.antiLogger
      ? `
  do
    local ${V.real} = (typeof and typeof(print) == "function")
    if ${V.real} then
      local ok = pcall(function()
        local info = debug and debug.info and debug.info(print, "s")
        if info and tostring(info):find("Logger") then error("envlog") end
      end)
      if not ok then return end
    end
    local spies = { "EnvLogger", "logEnv", "__logger", "hookmetamethod_spy" }
    for _, n in ipairs(spies) do
      if (rawget and rawget(getfenv and getfenv(0) or {}, n)) ~= nil then return end
    end
  end`
      : ""

  const antiTamper =
    cfg.guards && opts.antiTamper
      ? `
  do
    local watched = { loadstring or load, pcall, tostring, table.concat }
    for _, fn in ipairs(watched) do
      if type(fn) ~= "function" then return end
      if debug and debug.info then
        local src = debug.info(fn, "s")
        if src and src ~= "[C]" and src ~= "=[C]" and not src:find("=%[C%]") then
          return
        end
      end
    end
  end`
      : ""

  const antiDump =
    cfg.guards && opts.antiDump
      ? `
    ${V.out} = nil
    ${V.data} = nil
    if collectgarbage then pcall(collectgarbage, "collect") end
    local d = getfenv and getfenv(0) or {}
    if rawget and (rawget(d, "saveinstance") or rawget(d, "decompile")) then return end`
      : ""

  return `local ${V.guard}; ${V.guard} = function()${antiLogger}${antiTamper}
  return true
end
if ${V.guard}() == false then return end
${junkLines(cfg.junk)}
return (function(...)
  local ${V.keys} = ${keyTable}
  local ${V.data} = ${encrypted}
  local ${V.decode} = function(${V.b})
    local ${V.out} = {}
    local xor = bit32 and bit32.bxor
    for ${V.i} = 1, #${V.b} do
      local k = ${V.keys}[((${V.i} - 1) % #${V.keys}) + 1]
      local v = ${V.b}[${V.i}]
      local r
      if xor then
        r = xor(xor(v, k), (${V.i} - 1) % 251)
      else
        local a, bb, res, bitv = v, k, 0, 1
        for _ = 1, 8 do
          local x, y = a % 2, bb % 2
          if x ~= y then res = res + bitv end
          a, bb, bitv = (a - x) / 2, (bb - y) / 2, bitv * 2
        end
        local p = (${V.i} - 1) % 251
        local a2, res2, bitv2 = res, 0, 1
        for _ = 1, 8 do
          local x, y = a2 % 2, p % 2
          if x ~= y then res2 = res2 + bitv2 end
          a2, p, bitv2 = (a2 - x) / 2, (p - y) / 2, bitv2 * 2
        end
        r = res2
      end
      ${V.out}[${V.i}] = string.char(r % 256)
    end
    local ${V.sb} = table.concat(${V.out})
    ${antiDump}
    return ${V.sb}
  end
  local ${V.chunk} = ${V.decode}(${V.data})
  local ${V.loader} = (loadstring or load)(${V.chunk}, "=protected")
  if type(${V.loader}) ~= "function" then return end
  return ${V.loader}(...)
end)(...)`
}

export function obfuscate(source: string, opts: ProtectionOptions, scriptName = "script"): string {
  const cfg = PRESETS[opts.preset] ?? PRESETS.prometheus
  const guards = cfg.forceGuards ? true : opts.antiTamper || opts.antiDump || opts.antiLogger

  // First pass wraps the real source (always with the requested/forced guards).
  let build = wrapOnce(source, opts, { keyCount: cfg.keyCount, junk: cfg.junk, guards })

  // Additional layers re-encrypt the previous output. Guards only on the outer
  // shell of inner layers would be redundant, so inner re-wraps skip guards.
  for (let layer = 1; layer < cfg.layers; layer++) {
    build = wrapOnce(build, opts, {
      keyCount: Math.max(3, cfg.keyCount - layer),
      junk: Math.max(1, Math.floor(cfg.junk / 2)),
      guards: false,
    })
  }

  return `${header(scriptName, opts.preset)}\n${build}\n`
}

// ---------------------------------------------------------------------------
// Syntax sanity check. Strips comments + string literals, then balances Lua
// block keywords. NOTE: `for ... do` and `while ... do` open their block with
// `do`, so we count `do` (not `for`/`while`) as the opener — counting both
// double-counts and produces false "missing end" errors.
// ---------------------------------------------------------------------------
function stripCommentsAndStrings(src: string): string {
  let s = src
  // Long-bracket strings/comments: [[ ... ]], [=[ ... ]=], --[[ ... ]]
  s = s.replace(/--\[(=*)\[[\s\S]*?\]\1\]/g, " ") // block comments
  s = s.replace(/\[(=*)\[[\s\S]*?\]\1\]/g, '""') // long strings
  // Line comments
  s = s.replace(/--[^\n]*/g, " ")
  // Quoted strings (handles escaped quotes)
  s = s.replace(/"(?:\\.|[^"\\])*"/g, '""')
  s = s.replace(/'(?:\\.|[^'\\])*'/g, "''")
  return s
}

export function checkSyntax(source: string): { ok: boolean; message: string } {
  if (!source.trim()) return { ok: false, message: "Source is empty." }

  const clean = stripCommentsAndStrings(source)

  // Openers that each close with `end`: function, if, do (covers for/while), plus
  // `repeat` which closes with `until`.
  const openers = (clean.match(/\b(function|if|do|repeat)\b/g) || []).length
  const ends = (clean.match(/\bend\b/g) || []).length
  const untils = (clean.match(/\buntil\b/g) || []).length
  const repeats = (clean.match(/\brepeat\b/g) || []).length

  // `repeat` is closed by `until`; everything else by `end`.
  const endOpeners = openers - repeats
  if (untils !== repeats) {
    return { ok: false, message: `Unbalanced repeat/until (${repeats} repeat, ${untils} until).` }
  }
  if (ends !== endOpeners) {
    return {
      ok: false,
      message:
        ends < endOpeners
          ? `Possible missing 'end' (${endOpeners} blocks, ${ends} ends).`
          : `Too many 'end' keywords (${endOpeners} blocks, ${ends} ends).`,
    }
  }

  const parens = (clean.match(/\(/g) || []).length - (clean.match(/\)/g) || []).length
  if (parens !== 0) return { ok: false, message: "Unbalanced parentheses." }
  const braces = (clean.match(/{/g) || []).length - (clean.match(/}/g) || []).length
  if (braces !== 0) return { ok: false, message: "Unbalanced braces { }." }
  const brackets = (clean.match(/\[/g) || []).length - (clean.match(/\]/g) || []).length
  if (brackets !== 0) return { ok: false, message: "Unbalanced brackets [ ]." }

  return { ok: true, message: "Looks valid." }
}
