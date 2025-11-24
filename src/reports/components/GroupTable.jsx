import { useState, useMemo } from "react";

const GroupTable = ({ data }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const sortedData = useMemo(() => {
        let sortable = [...data];

        if (sortConfig.key) {
            sortable.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return sortable;
    }, [data, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
                <thead style={styles.thead}>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={styles.th}
                                onClick={() => handleSort(col.key)}
                            >
                                {col.label}
                                {sortConfig.key === col.key &&
                                    (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {sortedData.map((row) => (
                        <tr key={row.groupId}>
                            <td style={styles.td}>{row.groupName}</td>
                            <td style={styles.td}>{row.online_count}</td>
                            <td style={styles.td}>{row.offline_count}</td>
                            <td style={styles.td}>{row.unknown_count}</td>
                            <td style={styles.td}>{row.total_devices}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GroupTable;

// ---------------- Table Columns ----------------

const columns = [
    { key: "groupName", label: "Group Name" },
    { key: "online_count", label: "Online" },
    { key: "offline_count", label: "Offline" },
    { key: "unknown_count", label: "Unknown" },
    { key: "total_devices", label: "Total Devices" },
];

// ---------------- CSS Styles ----------------

const styles = {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        background: "#1e1e1e",
        color: "#e0e0e0",
        fontSize: "14px",
        borderRadius: "6px",
        overflow: "hidden",
    },
    thead: {
        background: "#2a2a2a",
        position: "sticky",
        top: 0,
        zIndex: 1,
    },
    th: {
        padding: "12px",
        textAlign: "left",
        cursor: "pointer",
        borderBottom: "1px solid #444",
        userSelect: "none",
        whiteSpace: "nowrap",
    },
    td: {
        padding: "10px",
        borderBottom: "1px solid #333",
        whiteSpace: "nowrap",
    },
};
