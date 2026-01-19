import { Menu } from '@mantine/core';
import { LuChevronsUpDown } from 'react-icons/lu';

import { useMockUser } from '~client/utils/mock-data';

function Profile() {
	const user = useMockUser();
	const { data: userData } = useMockUser();
	if (!user || !userData) return null;

	return (
		<>
			{/* User Menu */}
			<Menu width={220} position="right-start" offset={-4} closeDelay={300} openDelay={0}>
				<Menu.Target>
					<div className="mb-2 mt-1 flex cursor-pointer items-center gap-3 rounded-md px-4 py-1 hover:bg-btn-secondary">
						<img src={"/logo.png"} alt={`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Profile'} className="size-7 rounded-full" />
						<div className="flex flex-col">
							<p className="text-sm font-medium">{userData.firstName || ''} {userData.lastName || ''}</p>
							<p className="text-xs">{userData.email}</p>
						</div>
						<div className="grow" />
						<LuChevronsUpDown size={12} />
					</div>
				</Menu.Target>
			</Menu>
		</>
	);
}

export default Profile;
