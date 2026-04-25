import DeviceAuthorization from '@/components/auth/ui/DeviceAuthorization';

export default async function DeviceAuthorizationPage({
	params
}: {
	params: Promise<{ code: string }>;
}) {
	const { code } = await params;
	return <DeviceAuthorization code={code} />;
}
