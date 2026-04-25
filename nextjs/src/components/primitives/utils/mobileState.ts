'use client';

import { useEffect, useState } from 'react';

export function useMobileState() {
	const [width, setWidth] = useState<number>(() =>
		typeof window === 'undefined' ? 1024 : window.innerWidth
	);

	useEffect(() => {
		const onResize = () => setWidth(window.innerWidth);
		onResize();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	return {
		isMobile: width < 768,
		isDesktop: width >= 768
	};
}
