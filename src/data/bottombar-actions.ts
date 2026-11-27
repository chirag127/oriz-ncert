import type { BottomBarAction } from '~/components/BottomBar.astro'

export const bottomBarActions: BottomBarAction[] = [
  { icon: '⌂', label: 'Home', href: '/' },
  { icon: '⌕', label: 'Search', href: '/search/' },
  { icon: '❏', label: 'Browse', href: '/browse/' },
  { icon: '☰', label: 'Classes', href: '#sb-toggle' },
]
