import { ActionIcon, Badge, Checkbox, Combobox, Menu, Pagination, Popover, ScrollArea, Textarea, NumberInput, TextInput } from '@mantine/core';
import { Button, Modal, Select, Tooltip } from '@mantine/core';
import { colorsTuple, createTheme } from '@mantine/core';

// Custom animations
const selectDropdownTransition = {
	in: { opacity: 1, transform: 'scale(1)' },
	out: { opacity: 0, transform: 'scale(0.95)' },
	common: { transformOrigin: 'top' },
	transitionProperty: 'transform, opacity',
};

// Theme config
export const theme = createTheme({
	colors: {
		blue: colorsTuple('#266DF0'),
		stone: [
			'#fafaf9', // stone.0
			'#f5f5f4', // stone.1
			'#e7e5e4', // stone.2
			'#d6d3d1', // stone.3
			'#a8a29e', // stone.4
			'#78716c', // stone.5
			'#57534e', // stone.6
			'#44403c', // stone.7
			'#292524', // stone.8
			'#1c1917', // stone.9
		],
	},
	cursorType: 'pointer', // adds pointer cursor for checkbox
	focusClassName: 'focus-auto',
	fontFamily: 'Inter, sans-serif',
	components: {
		Button: Button.extend({
			defaultProps: {
				variant: 'primary',
				radius: '4px',
				size: 'xs',
				autoContrast: true,
				h: 27,
			},
			styles: (theme, { variant, color }) => ({
				root: variant === 'light' && color && theme.colors[color]
					? {
						border: `1px solid ${theme.colors[color][2]}`,
					}
					: {},
			}),
		}),
		ActionIcon: ActionIcon.extend({
			defaultProps: {
				radius: '4px',
				autoContrast: true,
				h: 27,
			},
		}),
		Textarea: Textarea.extend({
			defaultProps: {
				styles: {
					input: {
						fontSize: '12px',
					},
				},
			},
		}),
		Combobox: Combobox.extend({
			defaultProps: {
				offset: 4,
				shadow: 'md',
			},
		}),
		Select: Select.extend({
			defaultProps: {
				comboboxProps: {
					size: 'xs',
					transitionProps: { transition: selectDropdownTransition, duration: 100 },
					classNames: {
						dropdown: 'py-1', // reduces dropdown vertical padding
					},
				},
				allowDeselect: false,
				size: 'xs',
				styles: {
					input: {
						height: 27, // smaller than default xs (usually 30/28)
						minHeight: 25,
						fontSize: '12px',
						paddingTop: 2,
						paddingBottom: 2,
					},
					// Optionally smaller selector and icon
					dropdown: {
						paddingTop: 2,
						paddingBottom: 2,
					},
				},
			},
		}),
		Tooltip: Tooltip.extend({
			defaultProps: {
				radius: '6px',
				withArrow: true,
				openDelay: 300,
				transitionProps: { transition: 'pop', duration: 100 },
			},
		}),
		TooltipGroup: Tooltip.Group.extend({
			defaultProps: {
				openDelay: 300,
				closeDelay: 100,
			},
		}),
		Modal: Modal.extend({
			defaultProps: {
				returnFocus: false,
				centered: true,
				transitionProps: { transition: 'pop', duration: 150 },
			},
		}),
		ScrollArea: ScrollArea.extend({
			defaultProps: {
				scrollbarSize: 4,
			},
		}),
		Checkbox: Checkbox.extend({
			defaultProps: {
				size: 'xs',
				radius: '4px',
			},
		}),
		Badge: Badge.extend({
			defaultProps: {
				radius: '4px',
				fz: '11px',
				tt: 'none',
				styles: (theme, { color }) => ({
					root: color && theme.colors[color]
						? {
							color: theme.colors[color][9],
							border: `1px solid ${theme.colors[color][2]}`,
						}
						: {},
				}),
			},
		}),
		Popover: Popover.extend({
			defaultProps: {
				offset: 4,
				radius: '4px',
				styles: {
					dropdown: {
						padding: '4px',
					},
				},
				withArrow: false,
				transitionProps: { transition: selectDropdownTransition, duration: 70 },
			},
		}),
		Menu: Menu.extend({
			defaultProps: {
				shadow: 'xs',
				radius: '4px',
				transitionProps: { transition: selectDropdownTransition, duration: 100 },
			},
		}),
		NumberInput: NumberInput.extend({
			defaultProps: {
				size: 'xs',
				styles: (theme) => ({
					input: {
						height: 27,
						minHeight: 25,
						fontSize: '12px',
						paddingTop: 2,
						paddingBottom: 2,
						color: theme.colors.stone?.[8] || '#292524',
					},
					label: {
						fontSize: '12px',
						color: theme.colors.stone?.[5] || '#78716c',
						marginBottom: '4px',
					},
					description: {
						fontSize: '11px',
						color: theme.colors.stone?.[5] || '#78716c',
						marginTop: '2px',
					},
				}),
			},
		}),
		TextInput: TextInput.extend({
			defaultProps: {
				size: 'xs',
				styles: (theme) => ({
					input: {
						height: 27,
						minHeight: 25,
						fontSize: '12px',
						paddingTop: 2,
						paddingBottom: 2,
						color: theme.colors.stone?.[8] || '#292524',
					},
					label: {
						fontSize: '12px',
						color: theme.colors.stone?.[5] || '#78716c',
						marginBottom: '4px',
					},
					description: {
						fontSize: '11px',
						color: theme.colors.stone?.[5] || '#78716c',
						marginTop: '2px',
					},
				}),
			},
		}),
	},
});
