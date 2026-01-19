import { Skeleton as MantineSkeleton, type SkeletonProps } from '@mantine/core';

export default function Skeleton(props: SkeletonProps) {
	return <MantineSkeleton {...props} />;
}
