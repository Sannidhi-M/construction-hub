#!/usr/bin/env node
/**
 * Fails if a list that has to exist in BOTH apps has drifted apart.
 *
 * The storefront and the backend can't share a module, so a few small lists
 * are written out twice — the backend copy is the authoritative one that
 * validates a submission, the storefront copy drives the dropdown. Nothing
 * stopped the two from quietly disagreeing (they did: the quote form's
 * service names and the slider's differed). This compares them, entry by
 * entry — slug AND display name — and names exactly what differs.
 *
 * Run by scripts/check.sh; also runnable on its own:
 *   node scripts/check-synced-lists.js
 */
const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")

// `{ slug: "x", name: "Y" }` entries, on one line or several. Matches only
// quoted literals, so a `slug: string` type declaration or a comment that
// merely mentions "slug" is ignored.
const entriesOf = (relativePath) => {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8")
  return [...source.matchAll(/slug:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g)].map(
    (match) => ({ slug: match[1], name: match[2] })
  )
}

const lists = [
  {
    label: "quote-request services",
    storefront: "apps/storefront/src/lib/data/engineering-services.ts",
    backend: "apps/backend/src/modules/quote-request/service-catalog.ts",
  },
  {
    label: "contact-form subjects",
    storefront: "apps/storefront/src/lib/data/contact-topics.ts",
    backend: "apps/backend/src/modules/contact-message/topics.ts",
  },
]

let problems = 0

for (const list of lists) {
  const storefront = new Map(entriesOf(list.storefront).map((e) => [e.slug, e.name]))
  const backend = new Map(entriesOf(list.backend).map((e) => [e.slug, e.name]))
  const issues = []

  if (storefront.size === 0 || backend.size === 0) {
    issues.push(
      "found no entries to compare in one of the files — has its format changed? (update this script's pattern)"
    )
  }
  for (const [slug, name] of storefront) {
    if (!backend.has(slug)) {
      issues.push(`"${slug}" is in the storefront list but not the backend's`)
    } else if (backend.get(slug) !== name) {
      issues.push(
        `"${slug}" is named differently:\n        storefront: ${name}\n        backend:    ${backend.get(slug)}`
      )
    }
  }
  for (const slug of backend.keys()) {
    if (!storefront.has(slug)) {
      issues.push(`"${slug}" is in the backend list but not the storefront's`)
    }
  }

  if (issues.length === 0) {
    console.log(`  OK    ${list.label} (${storefront.size} entries identical in both apps)`)
  } else {
    problems += issues.length
    console.log(`  FAIL  ${list.label}:`)
    for (const issue of issues) console.log(`      - ${issue}`)
    console.log(`      files: ${list.storefront}\n             ${list.backend}`)
  }
}

// The free-service offer's slugs: a plain string array in each app.
const slugArray = (relativePath, constName) => {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8")
  const block = source.match(new RegExp(`${constName}\\s*=\\s*\\[([^\\]]*)\\]`))
  return block ? [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : []
}
{
  const storefrontFile = "apps/storefront/src/lib/data/free-service.ts"
  const backendFile = "apps/backend/src/modules/quote-request/service-catalog.ts"
  const storefront = slugArray(storefrontFile, "FREE_SERVICE_SLUGS")
  const backend = slugArray(backendFile, "FREE_CLAIM_SERVICE_SLUGS")
  if (storefront.length > 0 && storefront.join() === backend.join()) {
    console.log(`  OK    free-service offer (${storefront.length} slugs identical in both apps)`)
  } else {
    problems += 1
    console.log("  FAIL  free-service offer: slug lists differ (or none found)")
    console.log(`      storefront: ${storefront.join(", ")}\n      backend:    ${backend.join(", ")}`)
  }
}

// The per-booking worker limit: one number in each app.
{
  const read = (relativePath) =>
    fs
      .readFileSync(path.join(root, relativePath), "utf8")
      .match(/MAX_WORKERS_PER_BOOKING\s*=\s*(\d+)/)?.[1]
  const storefront = read("apps/storefront/src/lib/util/labour-booking.ts")
  const backend = read("apps/backend/src/workflows/create-labour-booking.ts")
  if (storefront && storefront === backend) {
    console.log(`  OK    labour worker limit (${storefront} in both apps)`)
  } else {
    problems += 1
    console.log("  FAIL  labour worker limit: differs (or not found)")
    console.log(`      storefront: ${storefront}\n      backend:    ${backend}`)
  }
}

process.exit(problems === 0 ? 0 : 1)
