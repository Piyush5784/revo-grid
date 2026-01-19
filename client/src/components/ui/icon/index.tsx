import { cn } from '~client/utils/utils'
import { icons } from 'lucide-react'
import { memo } from 'react'
import type { IconType } from 'react-icons'

export type IconProps = {
  name: keyof typeof icons
  className?: string
  strokeWidth?: number
}

export const Icon = memo(({ name, className, strokeWidth }: IconProps) => {
  const IconComponent = icons[name]

  if (!IconComponent) {
    return null
  }

  return <IconComponent className={cn('w-4 h-4', className)} strokeWidth={strokeWidth || 2.5} />
})

Icon.displayName = 'Icon'

export type ReactIconProps = {
  icon: IconType
  className?: string
  size?: number
}

export const ReactIcon = memo(({ icon: IconComponent, className, size }: ReactIconProps) => {
  return <IconComponent className={cn('w-4 h-4', className)} size={size} />
})

ReactIcon.displayName = 'ReactIcon'