import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartComponent = ({ assessedCount, notAssessedCount }) => {
    const data = {
      // Reverse the order of labels
      labels: ["ยังไม่ประเมิน", "ประเมินแล้ว"],
      datasets: [
        {
          // Reverse the order of data
          data: [notAssessedCount, assessedCount],
          // Reverse the order of colors
          backgroundColor: ["#87CEFA", "#72DA95"],
          borderColor: ["#1686cc", "#35b15e"],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false, // This allows us to set a custom size
      plugins: {
        legend: {
          position: "right",
          align: "center",
          labels: {
            font: {
              family: "Prompt",
              size: 14,
            },
            padding: 20, // Increase padding between legend items
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "white",
          titleFont: {
            size: 16,
            weight: "bold",
          },
          bodyColor: "white",
          bodyFont: {
            size: 14,
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed !== null) {
                label += context.parsed;
              }
              return label;
            },
          },
          position: "average",
          interaction: {
            mode: "nearest",
            intersect: true,
          },
        },
      },
      layout: {
        padding: {},
      },
    };

    const plugins = [
        {
            id: "textInside",
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    chart
                        .getDatasetMeta(datasetIndex)
                        .data.forEach((segment, index) => {
                            const model = segment;
                            const midRadius =
                                (model.innerRadius + model.outerRadius) / 2;
                            const midAngle =
                                (model.startAngle + model.endAngle) / 2;
                            const x = midRadius * Math.cos(midAngle);
                            const y = midRadius * Math.sin(midAngle);
                            ctx.save();
                            ctx.translate(model.x + x, model.y + y);
                            ctx.fillStyle = "white";
                            ctx.font = "16px Prompt";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            const text = `${chart.data.labels[index]} (${dataset.data[index]})`;
                            ctx.fillText(text, 0, 0);
                            ctx.restore();
                        });
                });
            },
        },
    ];

    return <Pie data={data} options={options} plugins={plugins} />;
};

export default PieChartComponent;
