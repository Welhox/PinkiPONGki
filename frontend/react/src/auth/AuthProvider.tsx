import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupInterceptors } from '../api/setupInterceptors';
import api from '../api/axios';
import i18n from '../i18n';

export interface User {
	id: string;
	username: string;
	email?: string;
	profilePic?: string;
	language?: string; 
}

export interface AuthContextType {
	status: 'loading' | 'authorized' | 'unauthorized';
	user: User | null;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export let logoutFromInterceptor: (() => void) | null = null; // export a hook

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
	const [user, setUser] = useState<User | null>(null);
	const [sessionExpired, setSessionExpired] = useState(false);
	const [initialCheckComplete, setInitialCheckComplete] = useState(false);
	const navigate = useNavigate();

	logoutFromInterceptor = () => {
		setUser(null);
		setStatus('unauthorized');
		setSessionExpired(true);
	};

	const refreshSession = async () => {
		try {
			const response = await api.get<User>('/session/user', {
				headers: {
					"Content-Type": "application/json", // optional but safe
				},
			});
			const data = response.data;
			
			if (response.status === 200 && data?.id) {
				const userLang = data.language ?? 'en';
      			await i18n.changeLanguage(userLang);
      			localStorage.setItem('language', userLang);

        		setUser(data);
        		setStatus('authorized');
				setSessionExpired(false);
      		} else {
				setUser(null);
				setStatus('unauthorized');
				await i18n.changeLanguage('en');
				localStorage.removeItem('language');
			}
		} catch (error) {
			if (status === 'authorized') {
				setSessionExpired(true);
			}
			setUser(null);
			setStatus('unauthorized');
			await i18n.changeLanguage('en');
			localStorage.removeItem('language');
		} finally {
			setInitialCheckComplete(true);
		}
	};

	useEffect(() => {
		refreshSession();
	}, []);

	useEffect(() => {
		if (status === 'authorized') {
			const interval = setInterval(() => {
				refreshSession();
			}, /*10*/1 * 60 * 1000);

			return () => clearInterval(interval);
		}
	}, [status]);

	useEffect(() => {
		if (initialCheckComplete && sessionExpired) {
			alert('Your session has expired. Please log in again.');
			setSessionExpired(false);
		}
	}, [initialCheckComplete, sessionExpired]);

	useEffect(() => {
		setupInterceptors({ api, navigate });
	}, [refreshSession, navigate]);

	if (status === 'loading') {
		return null;
	}

	return (
		<AuthContext.Provider value={{ status, user, refreshSession }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within AuthProvider');
	return context;
};