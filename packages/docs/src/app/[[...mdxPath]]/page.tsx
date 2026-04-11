import { notFound } from 'next/navigation'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

// Reserved paths Next.js normally handles as static files.
// In dev mode these don't exist yet, so the catch-all route
// would try to import them as MDX pages and crash.
const RESERVED_SEGMENTS = new Set(['_pagefind', '_next', '_vercel'])

function isReserved(mdxPath: string[] | undefined): boolean {
  if (!mdxPath || mdxPath.length === 0) return false
  return RESERVED_SEGMENTS.has(mdxPath[0])
}

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  if (isReserved(params.mdxPath)) return {}
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  if (isReserved(params.mdxPath)) notFound()

  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(
    params.mdxPath,
  )
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
