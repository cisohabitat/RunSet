import { useState } from "react";
import { useI18n } from "../i18n/I18n";
import {
  isTableOrder,
  tableOrderKey,
  type TableOrder,
} from "../lib/tableOrder";
import "./TableArrangement.css";
export function TableArrangement({
  value,
  onChange,
}: {
  value: TableOrder;
  onChange: (next: TableOrder) => void;
}) {
  const { t } = useI18n();
  const [notice, setNotice] = useState("");
  return (
    <details className="table-arrangement">
      <summary>{t("Table arrangement")}</summary>
      <label>
        {t("Table arrangement")}
        <select
          aria-label={t("Table arrangement")}
          value={value}
          onChange={(e) => {
            const next = e.currentTarget.value;
            if (!isTableOrder(next)) return;
            onChange(next);
            try {
              localStorage.setItem(tableOrderKey, next);
              setNotice("");
            } catch {
              setNotice(
                "The table view changed, but this browser could not remember the choice.",
              );
            }
          }}
        >
          <option value="placed">{t("Placed order")}</option>
          <option value="kind">{t("Groups then runs")}</option>
          <option value="colour">{t("Colour then number")}</option>
        </select>
      </label>
      <p>
        {t(
          "Display only. Your tiles, selection and turn stay unchanged. Meld numbers keep their original meaning. Incomplete melds stay first in organised views.",
        )}
      </p>
      {value === "colour" && (
        <p>
          {t(
            "Runs use their shared colour. Matching-number groups follow the runs.",
          )}
        </p>
      )}
      {notice && <p role="status">{t(notice)}</p>}
    </details>
  );
}
