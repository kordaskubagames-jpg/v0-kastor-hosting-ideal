// Server-side Lua obfuscation engine.
// Takes raw Lua source and produces a protected build that:
//   1. Encrypts the source into XOR-encoded byte chunks (string crypto)
//   2. Renames the loader internals with random identifiers each build
//   3. Wraps the payload in a runtime decryptor + loadstring VM
//   4. Injects optional anti-tamper / anti-dump / anti-logger guards
// The output is valid Lua that runs inside Roblox executors.

export type ProtectionOptions = {
  antiTamper: boolean
  antiDump: boolean
  antiLogger: boolean
}

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
    // XOR + position-dependent rotation
    bytes.push((code ^ k ^ (i % 251)) & 0xff)
  }
  return "{" + bytes.join(",") + "}"
}

function header(scriptName: string): string {
  return [
    "-- =====================================================================",
    `--  Protected build :: ${scriptName}`,
    "--  Obfuscated & guarded by LuaForge. Do not redistribute.",
    `--  Build: ${new Date().toISOString()}`,
    "-- =====================================================================",
  ].join("\n")
}

export function obfuscate(source: string, opts: ProtectionOptions, scriptName = "script"): string {
  // Random identifiers so each build differs.
  const V = {
    keys: randName(),
    data: randName(),
    decode: randName(),
    out: randName(),
    i: randName(),
    b: randName(),
    chunk: randName(),
    loader: randName(),
    env: randName(),
    guard: randName(),
    sb: randName(),
    real: randName(),
  }

  const keys = Array.from({ length: 6 }, randByte)
  const encrypted = encryptSource(source, keys)
  const keyTable = "{" + keys.join(",") + "}"

  // --- Anti-logger guard ---------------------------------------------------
  // Detects hooked print / common console-logger spies and metamethod hooks.
  const antiLogger = opts.antiLogger
    ? `
  do
    local ${V.real} = (typeof and typeof(print) == "function")
    -- A hooked print usually loses its native C signature.
    if ${V.real} then
      local ok = pcall(function()
        local info = debug and debug.info and debug.info(print, "s")
        if info and tostring(info):find("Logger") then error("envlog") end
      end)
      if not ok then return end
    end
    -- Block known environment loggers / spy globals.
    local spies = { "EnvLogger", "logEnv", "__logger", "hookmetamethod_spy" }
    for _, n in ipairs(spies) do
      if (rawget and rawget(getfenv and getfenv(0) or {}, n)) ~= nil then return end
    end
  end`
    : ""

  // --- Anti-tamper guard ---------------------------------------------------
  // Checks the loader bytecode hasn't been hooked/edited at runtime.
  const antiTamper = opts.antiTamper
    ? `
  do
    -- Detect function hooks on critical primitives.
    local watched = { loadstring or load, pcall, tostring, table.concat }
    for _, fn in ipairs(watched) do
      if type(fn) ~= "function" then return end
      if debug and debug.info then
        local src = debug.info(fn, "s")
        -- Native functions report "[C]"; a hook moves them to Lua source.
        if src and src ~= "[C]" and src ~= "=[C]" and not src:find("=%[C%]") then
          return
        end
      end
    end
  end`
    : ""

  // --- Anti-dump guard -----------------------------------------------------
  // Scrub the decrypted payload from memory after load and refuse known dumpers.
  const antiDump = opts.antiDump
    ? `
    -- Wipe decrypted source so dumpers can't lift it from upvalues.
    ${V.out} = nil
    ${V.data} = nil
    if collectgarbage then pcall(collectgarbage, "collect") end
    -- Refuse if a saveinstance / dex-style dumper is present.
    local d = getfenv and getfenv(0) or {}
    if rawget and (rawget(d, "saveinstance") or rawget(d, "decompile")) then return end`
    : ""

  const body = `${header(scriptName)}
local ${V.guard}; ${V.guard} = function()${antiLogger}${antiTamper}
  return true
end
if ${V.guard}() == false then return end

return (function(...)
  local ${V.keys} = ${keyTable}
  local ${V.data} = ${encrypted}
  local ${V.decode} = function(${V.b})
    local ${V.out} = {}
    local xor = bit32 and bit32.bxor
    for ${V.i} = 1, #${V.b} do
      local k = ${V.keys}[((${V.i} - 1) % #${V.keys}) + 1]
      local v = ${V.b}[${V.i}]
      -- reverse: byte = enc ^ key ^ ((i-1) % 251)
      local r
      if xor then
        r = xor(xor(v, k), (${V.i} - 1) % 251)
      else
        -- manual XOR fallback for runtimes without bit32
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
end)(...)
`

  return body
}

// Lightweight syntax sanity check (balanced keywords). Not a full parser, but
// catches obvious paste mistakes before a build is stored.
export function checkSyntax(source: string): { ok: boolean; message: string } {
  if (!source.trim()) return { ok: false, message: "Source is empty." }
  const opens = (source.match(/\b(function|if|for|while|do|repeat)\b/g) || []).length
  const closes = (source.match(/\b(end|until)\b/g) || []).length
  // function/if/for/while/do close with `end`; repeat closes with `until`.
  if (closes < opens - 2) {
    return { ok: false, message: `Possible missing 'end' (${opens} blocks, ${closes} closers).` }
  }
  const parens = (source.match(/\(/g) || []).length - (source.match(/\)/g) || []).length
  if (parens !== 0) return { ok: false, message: "Unbalanced parentheses." }
  const braces = (source.match(/{/g) || []).length - (source.match(/}/g) || []).length
  if (braces !== 0) return { ok: false, message: "Unbalanced braces." }
  return { ok: true, message: "Looks valid." }
}
