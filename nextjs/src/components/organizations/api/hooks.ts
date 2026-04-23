import { useOrganizationRoleData } from '@/lib/auth/hooks';

export const useRoles = ({
	orgId
}: {
	orgId?: string;
} = {}) => {
	const role = useOrganizationRoleData(orgId);

	return {
		get hasOwnerRole() {
			return role === 'owner';
		},
		get hasAdminRole() {
			return role === 'admin';
		},
		get hasOwnerOrAdminRole() {
			return ['owner', 'admin'].includes(role ?? '');
		},
		get isMember() {
			return role != null;
		}
	};
};
