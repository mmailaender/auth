import { Suspense } from 'react';
import CreateOrganization from '@/components/organizations/ui/CreateOrganization';

export default function CreateOrganizationPage() {
	return (
		<Suspense fallback={null}>
			<CreateOrganization redirectTo="/" />
		</Suspense>
	);
}
