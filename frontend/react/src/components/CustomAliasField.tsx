import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  username: string;
  index: number;
  onUpdate: (newName: string) => void;
  finalized: boolean;
  isYou?: boolean;
};

const usernameRegex = /^[a-zA-Z0-9]+$/;

const CustomAliasField: React.FC<Props> = ({
  username,
  index,
  onUpdate,
  finalized,
  isYou,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [customName, setCustomName] = useState(username);

  if (finalized) {
    return (
      <div className="flex items-center space-x-2 justify-center text-teal-800 dark:text-teal-300 font-semibold">
        <span className="font-bold text-lg">
        {isYou
            ? t("tournament.playerYou", {
                index: index + 1,
                username,
            })
            : t("tournament.player", {
                index: index + 1,
                username,
            })}
        </span>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center justify-center space-x-2 text-lg">
        <label className="font-bold text-teal-800 dark:text-teal-300 whitespace-nowrap">
          {t("tournament.playerLabel")} {index + 1}:
        </label>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder={t("tournament.playerLabel") || "Enter new display name"}
          maxLength={20}
        />
        <button
          className="bg-green-500 text-white px-4 py-1 rounded"
          onClick={() => {
            const newName = customName.trim();
            if (
              !newName ||
              !usernameRegex.test(newName) ||
              newName.length < 2 ||
              newName.length > 20
            ) {
              alert(t("tournament.errorUsernameInvalid"));
              return;
            }

            onUpdate(newName);
            setEditing(false);
          }}
        >
          {t("settings.save")}
        </button>
        <button
          className="bg-gray-400 text-white px-4 py-1 rounded"
          onClick={() => setEditing(false)}
        >
          {t("settings.cancel")}
        </button>
      </div>
    );
  }

  // dropdown display
  return (
    <div className="flex items-center justify-center space-x-2 text-lg">
      <label htmlFor={`custom-alias-select-${index}`} className="font-bold text-teal-800 dark:text-teal-300 whitespace-nowrap">
        {t("tournament.playerLabel")} {index + 1}:
      </label>
      <select id={`custom-alias-select-${index}`}
        aria-label={t("tournament.customAliasSelectAriaLabel", {
        index: index + 1,
        username,
        })}
        className="text-teal-800 dark:text-teal-300 font-semibold bg-transparent text-lg"
        onChange={(e) => {
          if (e.target.value === "customize") {
            setEditing(true);
            setCustomName(username);
          }
        }}
        defaultValue=""
      >
        <option value="" disabled>
          {username}
        </option>
        <option value="customize">{t("tournament.customizeDisplayName")}</option>
      </select>
    </div>
  );
};

export default CustomAliasField;
