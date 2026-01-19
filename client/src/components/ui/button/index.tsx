import {
	Button as MantineButton,
	type ButtonGroupProps as MantineButtonGroupProps,
	type ButtonGroupSectionProps as MantineButtonGroupSectionProps,
	type ButtonProps as MantineButtonProps
} from '@mantine/core';
import { forwardRef } from 'react';

export function Button({ children, ...props }: { children: React.ReactNode, type?: 'submit', onClick?: () => void } & MantineButtonProps) {
	return <MantineButton {...props}>{children}</MantineButton>;
}

Button.Group = forwardRef<HTMLDivElement, { className?: string, children?: React.ReactNode } & MantineButtonGroupProps>(
	function ButtonGroup({ className, children, ...props }, ref) {
		return (
			<MantineButton.Group ref={ref} className={className} {...props}>
				{children}
			</MantineButton.Group>
		);
	},
);

Button.GroupSection = forwardRef<HTMLDivElement, { className?: string, children?: React.ReactNode } & MantineButtonGroupSectionProps>(
	function ButtonGroupSection({ className, children, ...props }, ref) {
		return (
			<MantineButton.GroupSection ref={ref} className={className} {...props}>
				{children}
			</MantineButton.GroupSection>
		);
	},
);
