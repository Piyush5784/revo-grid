import type { FileRoutesByPath } from '@tanstack/react-router';
import { type IconType } from 'react-icons';
import { LuBell, LuHouse } from 'react-icons/lu';

type RouteKeys = keyof FileRoutesByPath;
export type RouteFullPaths = FileRoutesByPath[RouteKeys]['fullPath'];

export interface SidebarRoute {
	fullPath: RouteFullPaths
	icon: IconType
	title: string
}

export interface RouteGroup {
	title: string
	icon: IconType
	routes: SidebarRoute[]
}

export interface BaseGroup {
	title?: string
	routes?: SidebarRoute[]
	groups?: RouteGroup[]
}

export const baseGroups: BaseGroup[] = [
	{
		routes: [
			{ fullPath: '/$orgName/home', icon: LuHouse, title: 'Home' },
			{ fullPath: '/$orgName/', icon: LuBell, title: 'Notifications' },
		],
	},
];
