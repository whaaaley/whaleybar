import { walk } from '@std/fs'

const SKIP_PATTERNS: RegExp[] = [
  /node_modules/,
  /dist/,
  /_trash/,
  /\.git/,
  /\.claude/,
]

interface MetaTree {
  [key: string]: MetaTree | null
}

const getMetaPaths = async (root: string) => {
  const entries = walk(root, { skip: SKIP_PATTERNS, includeDirs: false })
  const paths: string[] = []

  for await (const entry of entries) {
    paths.push(entry.path)
  }

  return paths
}

const buildMetaTree = (paths: string[]): MetaTree => paths.reduce((meta, path) => {
  return path.split('/').reduce((node, part, i, parts) => {
    if (i === parts.length - 1) return { ...node, [part]: null }
    return { ...node, [part]: node[part] || {} }
  }, meta as MetaTree)
}, {})

const writeMetaFile = async (meta: MetaTree) => {
  await Deno.mkdir('.claude', { recursive: true })
  await Deno.writeTextFile(
    '.claude/project-meta.json',
    JSON.stringify(meta, null, 2)
  )
}

if (import.meta.main) {
  const root = Deno.cwd()
  const paths = await getMetaPaths(root)
  const meta = buildMetaTree(paths)
  await writeMetaFile(meta)
}