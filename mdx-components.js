import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { Bleed, FileTree, Steps, Tabs, withGitHubAlert } from 'nextra/components'
import * as C from './app/_components'

const themeComponents = getThemeComponents()

// GitHub alerts (> [!WARNING]) render through our own Alert so every callout shares one token set.
const blockquote = withGitHubAlert(C.AlertFromBlockquote)

export function useMDXComponents(components) {
  return { ...themeComponents, Bleed, FileTree, Steps, Tabs, ...C, blockquote, ...components }
}
