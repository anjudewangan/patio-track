import { useMemo } from "react";
import Chart from "react-apexcharts";


const GroupChart = ({ data }) => {
    const dynamicHeight = useMemo(() => data.length * 35, [data.length]);

    const series = useMemo(() => ([
        { name: "Online", data: data.map(g => g.online_count) },
        { name: "Offline", data: data.map(g => g.offline_count) },
        { name: "Unknown", data: data.map(g => g.unknown_count) },
    ]), [data]);
    const options = {
        chart: {
            type: "bar",
            height: dynamicHeight,   // <-- dynamic height
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                // barHeight: "60%",
            },
        },
        colors: ["#42A5F5", "#26A69A", "#FB8C00"],  // 🔥 UPDATED COLORS
        xaxis: {
            categories: data.map((g) => g.groupName),
            labels: {
                rotate: 0, style: {
                    colors: "#cccccc",    // soft gray
                    fontSize: "12px"
                }
            },
        },
        dataLabels: { enabled: false },
        stroke: { width: 1 },
        legend: {
            position: "top",
            labels: {
                colors: "#fff" // white text for dark theme
            }
        },
        yaxis: {
            // 🎨 UPDATED Y-AXIS LABEL COLOR
            labels: {
                style: {
                    colors: "#cccccc",    // soft gray
                    fontSize: "12px"
                }
            }
        },
        grid: {
            borderColor: "#333",
        },
        tooltip: {
            theme: "dark",
        },
    };

    return <Chart options={options} series={series} type="bar" height={dynamicHeight} />;
};

export default GroupChart;
