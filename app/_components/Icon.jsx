import {
  ArrowRight, BookOpen, Bot, Cloud, CircleAlert, CreditCard, FileText, FlaskConical, Github, Info, Laptop,
  Layers, LayoutDashboard, Lightbulb, MailCheck, MonitorSmartphone, OctagonAlert, Plug, Puzzle, RefreshCw,
  RotateCcw, Server, ShieldCheck, Terminal, TriangleAlert, UserPlus, Wallet
} from 'lucide-react'

// Named icons only (tree-shaken). Content refers to icons by string name: <Icon name="Terminal" />.
const icons = {
  ArrowRight, BookOpen, Bot, Cloud, CircleAlert, CreditCard, FileText, FlaskConical, Github, Info, Laptop,
  Layers, LayoutDashboard, Lightbulb, MailCheck, MonitorSmartphone, OctagonAlert, Plug, Puzzle, RefreshCw,
  RotateCcw, Server, ShieldCheck, Terminal, TriangleAlert, UserPlus, Wallet
}

export function Icon({ name, size = 18 }) {
  const C = icons[name]
  if (!C) throw new Error(`Unknown icon "${name}". Add it to app/_components/Icon.jsx`)
  return <C size={size} strokeWidth={1.75} aria-hidden="true" focusable="false" />
}
