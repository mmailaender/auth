import type { FunctionReturnType } from 'convex/server';

import type { api } from '@/convex/_generated/api';
import type { authClient } from '@/lib/auth/api/auth-client';

export type GetActiveUserType = FunctionReturnType<typeof api.users.queries.getActiveUser>;
export type ListAccountsType = FunctionReturnType<typeof api.users.queries.listAccounts>;
export type ListApiKeysType = FunctionReturnType<typeof api.users.queries.listApiKeys>;

export type GetActiveOrganizationType = FunctionReturnType<
	typeof api.organizations.queries.getActiveOrganization
>;
export type ListOrganizationsType = FunctionReturnType<
	typeof api.organizations.queries.listOrganizations
>;
export type ListInvitationsType = FunctionReturnType<
	typeof api.organizations.invitations.queries.listInvitations
>;

export type Role = typeof authClient.$Infer.Member.role;

export interface InitialAuthData {
	activeUser?: GetActiveUserType;
	accountList?: ListAccountsType;
	activeOrganization?: GetActiveOrganizationType;
	organizationList?: ListOrganizationsType;
	invitationList?: ListInvitationsType;
	role?: Role;
}
