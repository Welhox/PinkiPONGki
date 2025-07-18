import React from "react";
import { Player } from "../types/game";
import { useTranslation } from "react-i18next";

interface VictoryProps {
  standings: Player[];
}

const Victory: React.FC<VictoryProps> = ({ standings }: VictoryProps) => {
  const { t } = useTranslation();
    if (standings.length === 0)
        return (
            <div className="text-xl">
            <strong>Seems like you're all losers 😎</strong>
            </div>
    )
  
  return (
    <div className="text-center mt-10">
      <h2 className="text-3xl font-bold mb-6 text-green-600">
        🏆 {t("victory.tournamentFinished")}
      </h2>
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl text-blue-700 dark:text-blue-400">
          <strong>{t("victory.first")}:</strong> {standings[0]?.name}
        </div>
        <div className="text-lg text-yellow-700 dark:text-yellow-200">
          <strong>{t("victory.second")}:</strong> {standings[1]?.name}
        </div>
        <div className="text-lg text-brown-700 dark:text-brown-400">
          <strong>{t("victory.third")}:</strong> {standings[2]?.name}
        </div>
      </div>
    </div>
  );
};
export default Victory;
