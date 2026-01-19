import {
    Tree as MantineTree,
    useTree,
    getTreeExpandedState,
    type RenderTreeNodePayload,
    type TreeProps,
    Group
} from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '../';

export const Tree = ({ ...props }: TreeProps) => <MantineTree {...props} />;

export { useTree, getTreeExpandedState };

export const renderTreeNode = ({
    node,
    expanded,
    hasChildren,
    elementProps,
    tree,
}: RenderTreeNodePayload) => {
    const checked = tree.isNodeChecked(node.value);
    const indeterminate = tree.isNodeIndeterminate(node.value);

    return (
        <Group gap="sm" mb={14} {...elementProps}>
            <Checkbox.Indicator
                size="xs"
                checked={checked}
                indeterminate={indeterminate}
                onClick={() => (!checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value))}
            />
            <Group gap="sm" onClick={() => tree.toggleExpanded(node.value)}>
                <span className='text-sm font-medium text-stone-800'>{node.label}</span>
                {hasChildren && (
                    <ChevronDown
                        size={14}
                        style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                )}
            </Group>
        </Group>
    );
};