import React, { useState } from "react";
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'api';

interface FieldProps {
	label: "Email" | "Password"
	type?: "email" | "password";
	value: string;
	onUpdate?: (newValue: string) => void;
}

/*
Displays the name of the setting, it's current value next to it (passwords are masked with '*') and
Update button. When button is clicked, input field opens up with save and cancel option.
*/
const SettingsField: React.FC<FieldProps> = ({
	label,
	type = "text",
	value,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [inputValue, setInputValue] = useState(value);
	const [confirmInput, setConfirmInput] = useState("");
	const [currentPassword, setCurrentPassword] = useState(""); 
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const validateInput = () => {
		if (inputValue.trim() !== confirmInput.trim()) {
			return "New values don't match.";
		}

		if (type === "password") {
			if (inputValue.length < 8 || inputValue.length > 42) {
				return "Password must be between 8 and 42 characters.";
			}
			const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
			if (!pwdRegex.test(inputValue)) {
				return "Password must be at least 8 characters, including uppercase, lowercase, number and special character.";
			}
		} else if (type === "email") {
			if (inputValue.length > 42) return "Email must be 42 characters of less.";
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(inputValue)) {
				return "Please enter a valid email address.";
			}
		} 

		if (!currentPassword/* || currentPassword.length < 8*/) { // COMMENT BACK IN FOR FINAL PRODUCT!!
			return "Current password required.";
		}

		return null;
	};

	const handleSave = async () => {
		const validationError = validateInput();

		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			const endpoint = type === "email" ? apiUrl + "/user/email" : apiUrl + "/user/password";
			await axios.put(endpoint, {
				newValue: inputValue.trim(),
				currentPassword: currentPassword.trim(),
			}, { withCredentials: true });

			setSuccess(`${label} updated successfully.`);
			setError(null);
			setIsEditing(false);
			onUpdate?.(inputValue.trim());
		} catch (error: any) {
			setError(error?.response?.data?.message || "Update failed.");
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setInputValue("");
		setConfirmInput("");
		setCurrentPassword("");
		setError(null);
		setSuccess(null);
	};

	return (
		<div>
			<strong>{label}:</strong>{" "}{value}{" "}
			{!isEditing ? (
				<>
					<button className="px-5 mx-3 my-2 text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 
								  focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm w-full 
								  sm:w-auto py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-700
								  dark:focus:ring-teal-800"
						    onClick={() => {
						setInputValue("");
						setIsEditing(true);
					}}>Update</button>
				</>
			) : (
				<>
					<br/>
					<input
						type={type}
						value={inputValue}
						placeholder={`New ${label}`}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<input
						type={type}
						value={confirmInput}
						placeholder={`Confirm ${label}`}
						onChange={(e) => setConfirmInput(e.target.value)}
					/>
					<input
						type="password"
						value={currentPassword}
						placeholder="Current password"
						onChange={(e) => setCurrentPassword(e.target.value)}
					/>
					<div>
						<button onClick={handleSave}>Save</button>{" "}
						<button onClick={handleCancel}>Cancel</button>
					</div>
					{error && <div className="text-red-600">{error}</div>}
					{success && <div className="text-green-600">{success}</div>}
				</>
			)}
		</div>
	);
};

export default SettingsField;