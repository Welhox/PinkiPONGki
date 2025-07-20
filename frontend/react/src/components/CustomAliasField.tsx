import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  username: string;
  index: number;
  onUpdate: (newName: string) => void;
  finalized: boolean;
};

const usernameRegex = /^[a-zA-Z0-9]+$/;

const CustomAliasField: React.FC<Props> = ({
  username,
  index,
  onUpdate,
  finalized,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [customName, setCustomName] = useState(username);

  if (finalized) {
    return (
      <div className="text-center text-teal-800 dark:text-teal-300 font-semibold">
        {t("tournament.player", {
          index: index + 1,
          username,
        })}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 m-1 w-xs dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder={t("tournament.customNamePlaceholder") || "Enter new display name"}
          maxLength={20}
        />
        <div className="flex space-x-2 mt-2">
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
            {t("common.save")}
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-1 rounded"
            onClick={() => setEditing(false)}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <select
        className="text-teal-800 dark:text-teal-300 font-semibold bg-transparent"
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
