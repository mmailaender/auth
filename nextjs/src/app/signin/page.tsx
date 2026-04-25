import { Suspense } from 'react';
import SignIn from '@/components/auth/ui/SignIn';

export default function Login() {
	return (
		<Suspense fallback={null}>
			<SignIn />
		</Suspense>
	);
}
