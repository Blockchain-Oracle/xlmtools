import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: {
    template: '%s - PULSAR Docs',
    default: 'PULSAR Docs',
  },
  description:
    'PULSAR — Stellar-native MCP tools with pay-per-call micropayments',
  applicationName: 'PULSAR',
}

function Logo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="2,12 6,12 8,4 12,20 16,8 18,12 22,12" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PULSAR</span>
    </span>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="⚡" />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={<Logo />}
              projectLink="https://github.com/Blockchain-Oracle/pulsar"
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/Blockchain-Oracle/pulsar/tree/main/packages/docs"
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          footer={
            <Footer>
              {`\u00A9 ${new Date().getFullYear()} PULSAR \u2014 Stellar-native MCP tools`}
            </Footer>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
