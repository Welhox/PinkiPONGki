import { AxiosInstance } from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { logoutFromInterceptor } from '../auth/AuthProvider';

let isHandlingSessionExpiry = false;

export function setupInterceptors({
	api,
	navigate,
}: {
	api: AxiosInstance
	navigate: NavigateFunction;
}) {
	api.interceptors.response.use(
		response => response,
		async error => {
			const status = error.response?.status;

			if ((status === 401 || status === 419) && !isHandlingSessionExpiry) {
				isHandlingSessionExpiry = true;
				console.warn('Session expired (status:', status, ') — refreshing session and redirecting');

				logoutFromInterceptor?.(); // update context immediately
				localStorage.removeItem('language');

				// avoid full reload
				navigate('/login', { replace: true });

				// reset lock after short delay
				setTimeout(() => {
					isHandlingSessionExpiry = false;
				}, 2000);
			}
			return Promise.reject(error);
		}
	);
}