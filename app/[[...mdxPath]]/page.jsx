import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'
import { toMarkdown } from '../../scripts/lib/to-markdown.mjs'

const SITE = process.env.SITE_URL || 'https://frappesaas.tridz.in'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props) {
  const params = await props.params
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(params.mdxPath)
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={toMarkdown(sourceCode, { site: SITE })}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
