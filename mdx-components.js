import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { Bleed, FileTree, Steps, Tabs } from 'nextra/components'
import * as C from './app/_components'

const themeComponents = getThemeComponents()


export function useMDXComponents(components) {
  return { ...themeComponents, Bleed, FileTree, Steps, Tabs, ...C, blockquote: C.Blockquote, ...components }
}
