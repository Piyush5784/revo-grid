import { AppShell, Box, Burger, Button, Collapse, Divider, Group, Space, Tooltip, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useLocation, useParams } from '@tanstack/react-router';
import { type IconType } from 'react-icons';

import DatabaseSidebar from '~client/lib/sidebar/database-sidebar';
import Profile from '~client/lib/sidebar/profile';
import { routeTree } from '~client/routeTree.gen';
import { useIsMobile } from '~client/utils/utils';

export const devtoolButtonProps = {
	px: 0,
	size: 'sm',
	color: 'stone',
	variant: 'light',
	styles: { label: { color: 'var(--mantine-color-stone-light-color)' } },
} as const;
export const sidebarPadding = 'px-3';
export const SIDEBAR_HEADER_HEIGHT = 46;
export const SIDEBAR_ICON_SIZE = 12;
export const APP_NAME = 'Coyax';

// PIYUSH added: Add these CSS variables or use them directly in your styles
export const sidebarIconColor = 'text-stone-500'; // Lighter stone color for icons
export const sidebarTextColor = 'text-stone-700'; // Darker stone color for text

export function Sidebar({ children }: { children: React.ReactNode }) {
	const [opened, { toggle }] = useDisclosure();
	const isMobile = useIsMobile();
	if (!routeTree.children) return null;

	return (
		<AppShell
			header={{ height: isMobile ? SIDEBAR_HEADER_HEIGHT : 0 }}
			navbar={{ width: 234, breakpoint: 'sm', collapsed: { mobile: !opened } }}
		>
			<AppShell.Header withBorder={isMobile ? true : false}>
				<Group h="100%" px="md" className="bg-sidebar-bg">
					<Burger opened={opened} onClick={toggle} size="sm" />
					<p className="text-lg font-medium text-stone-800">{APP_NAME}</p>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar withBorder={false}>

				{/* Sidebar */}
				<div className="flex h-full grow flex-col border-r border-solid border-bd-light bg-sidebar-bg text-base">

					{/* Header */}
					<Box hidden={isMobile} className="border-b border-bd-light" h={SIDEBAR_HEADER_HEIGHT}>
						<div className={`flex items-center gap-1 px-4 ${sidebarPadding}`}>
							<img src="/logo.png" alt={APP_NAME} className="size-[18px]" />
							<p className="my-2 ml-1 text-lg font-medium text-stone-800">{APP_NAME}</p>
						</div>
						{/* <Divider className="border-bd-light"></Divider> */}
					</Box>

					{/* Links */}
					<div className={`flex flex-col gap-3 ${sidebarPadding} min-h-0 flex-1`}>

						<DatabaseSidebar />
					</div>
					<Profile />

				</div>
			</AppShell.Navbar>
			<AppShell.Main>
				<Box className="flex w-full flex-col" h={isMobile ? `calc(100dvh - ${SIDEBAR_HEADER_HEIGHT}px)` : '100dvh'}>
					{children}
				</Box>
			</AppShell.Main>
		</AppShell>
	);
}

export default Sidebar;

// PIYUSH added: Collapse component for nested routes
export function MyCollapse({
	children,
	title,
	icon: Icon,
	iconColor = 'text-stone-400',
	textColor = 'text-stone-700',
}: {
	children: React.ReactNode
	title: string
	icon: IconType
	iconColor?: string
	textColor?: string
}) {
	const [opened, { toggle }] = useDisclosure(true);

	return (
		<>
			<div className="sidebar-link cursor-pointer" onClick={toggle}>
				<Icon size={SIDEBAR_ICON_SIZE} className={iconColor} />
				<span className={textColor}>{title}</span>
			</div>
			<Space h={2} />
			<div className="flex">
				<Divider orientation="vertical" ml={20} mr={10} style={{ opacity: opened ? 1 : 0, transition: 'opacity 200ms ease' }} />
				<Collapse in={opened} className="flex w-full grow">
					<div className="flex grow flex-col">
						{children}
					</div>
				</Collapse>
			</div>
		</>
	);
}
