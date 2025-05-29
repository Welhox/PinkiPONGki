import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import DeleteAccountButton from '../components/DeleteAccount';
import EditProfilePic from '../components/EditProfilePic';
import SettingsField from '../components/SettingsField';
import LanguageSelector from '../components/LanguageSelector';
import ToggleSwitch from '../components/ToggleSwitch';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'api';

const Settings: React.FC = () => {
	const navigate = useNavigate();
	const { status, user, refreshSession } = useAuth();

	// import current settings from backend
	const [email, setEmail] = useState("");
	const [language, setLanguage] = useState("en");
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);

	useEffect(() => { // add profile pic update here too?
		if (user?.email) setEmail(user.email);
	}, [user]);

	useEffect(() => {
		// Fetch user settings from the backend
		const fetchUserSettings = async () => {
			try {
				const response = await axios.get(apiUrl + '/users/settings', { withCredentials: true });
				console.log('RESPONSE:' + response.data);
				setEmail(response.data.email);
				setLanguage(response.data.language);
				setIs2FAEnabled(response.data.is2FAEnabled);
			} catch (error) {
				console.error('Error fetching user settings:', error);
			}
		};
		if (status === 'authorized') {
			fetchUserSettings();
		}
	}, [status]);

	const handleReturn = () => {
		navigate('/');
	}

	const handleDelete = async () => {
		if (!user?.id) throw new Error('No user ID available');

		try {
			await axios.delete(`${apiUrl}/users/delete/${user?.id}`, { withCredentials: true });
			await axios.post(`${apiUrl}/users/logout`, {}, { withCredentials: true });
			localStorage.clear();
			sessionStorage.clear();
			await refreshSession();
			navigate('/');
		} catch (error: any) {
			console.error('Failed to delete account:', error);
			alert('Failed to delete account. Please try again later.');
		}
	};

	//toggle mfa on/off
	// send request to backend to update mfa status
	const handle2FAToggle = async () => {
		try {
			// send request to backend to update 2FA status
			const response = await axios.post(apiUrl + '/auth/mfa', { mfaInUse: !is2FAEnabled }, { withCredentials: true });
			setIs2FAEnabled(response.data.mfaInUse);
			console.log("2FA toggled!");
		}
		catch (error) {
			console.error('Error updating 2FA status:', error);
		}
	};
	
	const uploadProfilePic = async (file: File | null) => {
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await axios.post(apiUrl + '/user/profile-pic', formData, {
				withCredentials: true,
			});

			await refreshSession();
			console.log(user);
		} catch (error: any) {
			console.error('Error uploading file:', error);
			alert('Upload failed: ' + (error.response?.data?.error || error.message));
		}
	}

	const handleLanguageChange = async (newLang: string) => {
		try {
			const response = await axios.post(
				apiUrl + '/user/language',
				{ language: newLang },
				{ withCredentials: true }
			);

			setLanguage(response.data.language);
			console.log('Language updated to:', response.data.language);
		} catch (error: any) {
			console.error('Failed to update language:', error);
			alert('Failed to update language preference. Please try again.');
		}
	}

	if (status === 'loading') return <p>Loading...</p>
	if (status === 'unauthorized') return <Navigate to="/" replace />;

	return (
		<div className="text-center dark:text-white">
			<h1 className="text-6xl text-center text-teal-800 dark:text-teal-300 m-3">Settings</h1>
			<EditProfilePic
				pic={user?.profilePic ? `${apiUrl}${user.profilePic}` : `${apiUrl}/assets/default_avatar.png`}
				onChange={() => {}}
				onSave={uploadProfilePic} />
			<SettingsField label="Email" type="email" value={email} onUpdate={(newEmail) => setEmail(newEmail)} />
			<SettingsField label="Password" type="password" value="********" />
			<LanguageSelector value={language} onChange={handleLanguageChange} />
			<ToggleSwitch
				label="Enable Two-Factor Authentication"
				enabled={is2FAEnabled}
				onToggle={handle2FAToggle}
			/>
			<DeleteAccountButton onDelete={handleDelete} />
			<button className="font-semibold block mx-auto my-5 px-20 text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 
								  focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-full 
								  sm:w-auto py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-700
								  dark:focus:ring-teal-800"
					onClick={handleReturn}>Back</button>
		</div>
	);
};

export default Settings;