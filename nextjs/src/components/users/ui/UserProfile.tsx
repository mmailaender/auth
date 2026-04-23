'use client';

import ProfileInfo from '@/components/users/ui/ProfileInfo';
import Emails from '@/components/users/ui/Emails';
import Accounts from '@/components/users/ui/Accounts';
import ApiKeys from '@/components/users/ui/ApiKeys';
import DeleteUser from '@/components/users/ui/DeleteUser';
import { AUTH_CONSTANTS } from '@/convex/auth.constants';

export default function UserProfile() {
	return (
		<div className="w-full">
			<div className="flex flex-col gap-3 pb-8">
				<ProfileInfo />
				<Emails />
			</div>
			<Accounts />
			{AUTH_CONSTANTS.apiKeys ? <ApiKeys /> : null}
			<DeleteUser />
		</div>
	);
}
