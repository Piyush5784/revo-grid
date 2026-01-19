import {
	Collapse as MantineCollapse,
	type CollapseProps as MantineCollapseProps
} from '@mantine/core';

export function Collapse({ children, ...props }: { children?: React.ReactNode } & MantineCollapseProps) {
	return <MantineCollapse {...props}>{children}</MantineCollapse>;
}

