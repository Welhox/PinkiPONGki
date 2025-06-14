import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import i18n from '../i18n';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'api';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
	const [user, setUser] = useState<User | null>(null);
	const navigate = useNavigate();

	const refreshSession = async () => {
		try {
			const response = await axios.get<User>(apiUrl + '/session/user', {
				headers: {
					"Content-Type": "application/json", // optional but safe
				},
				withCredentials: true,
			});
			const data = response.data;
			
			if (response.status === 200 && data?.id) {
				const userLang = data.language ?? 'en';
      			await i18n.changeLanguage(userLang);
      			localStorage.setItem('language', userLang);

        		setUser(data);
        		setStatus('authorized');
      		} else {
				setUser(null);
				setStatus('unauthorized');
				await i18n.changeLanguage('en');
				localStorage.removeItem('language');
			}
		} catch (error: any) {
			if (error.response?.status === 419) {
				alert('Your session has expired. Please log in.');
				setUser(null);
				setStatus('unauthorized');
				await i18n.changeLanguage('en');
				localStorage.removeItem('language');
				navigate('/login', { replace: true });
			}
			setUser(null);
			setStatus('unauthorized');
			await i18n.changeLanguage('en');
			localStorage.removeItem('language');
		}
	};

	useEffect(() => {
		refreshSession();
	}, []);

	useEffect(() => {
		if (status === 'authorized') {
			const interval = setInterval(() => {
				refreshSession();
			}, 10 * 60 * 1000);

			return () => clearInterval(interval);
		}
	}, [status]);

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