import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const eslintConfig = [
	...nextVitals,
	...nextTypeScript,
	{
		rules: {
			'react-hooks/preserve-manual-memoization': 'off',
			'react-hooks/purity': 'off',
			'react-hooks/set-state-in-effect': 'off'
		}
	}
];

export default eslintConfig;
