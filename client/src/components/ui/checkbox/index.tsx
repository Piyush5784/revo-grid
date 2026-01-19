import { forwardRef } from 'react';
import {
    Checkbox as MantineCheckbox,
    type CheckboxProps as MantineCheckboxProps,
    type CheckboxGroupProps as MantineCheckboxGroupProps,
    type CheckboxIndicatorProps as MantineCheckboxIndicatorProps,
} from '@mantine/core';

export function Checkbox({ children, ...props }: { children?: React.ReactNode } & MantineCheckboxProps) {
    return <MantineCheckbox {...props}>{children}</MantineCheckbox>;
}

Checkbox.Group = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode } & MantineCheckboxGroupProps>(
    function CheckboxGroup({ className, children, ...props }, ref) {
        return (
            <MantineCheckbox.Group ref={ref} className={className} {...props}>
                {children}
            </MantineCheckbox.Group>
        );
    }
);

Checkbox.Indicator = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode } & MantineCheckboxIndicatorProps>(
    function CheckboxIndicator({ className, children, ...props }, ref) {
        return (
            <MantineCheckbox.Indicator ref={ref} className={className} {...props}>
                {children}
            </MantineCheckbox.Indicator>
        );
    }
);


