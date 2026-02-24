"use client";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { useState } from "react";
import Switch from "@mui/material/Switch";

type DataPoint = {
  timestamp: Date;
  value: number;
};
interface LineChartProps {
  data: DataPoint[];
}
export default function LineChart({ data }: LineChartProps) {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const xData = data.map((item) => item.timestamp.getTime());
  const yData = data.map((item) => item.value);
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<DataPoint>();
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  return (
    <div className="w-full h-full relative">
      <div className="mb-4 flex justify-end items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          Line Visibility
        </span>
        <Switch
          checked={isVisible}
          onChange={(e) => {
            setIsVisible(e.target.checked);
            if (!e.target.checked) hideTooltip();
          }}
          color="primary"
        />
      </div>
      <ParentSize>
        {({ width, height }) => {
          const xMax = width - margin.left - margin.right;
          const yMax = height - margin.top - margin.bottom;

          const xScale = scaleTime({
            range: [0, xMax],
            domain: [
              new Date(Math.min(...xData)),
              new Date(Math.max(...xData)),
            ],
          });

          const yScale = scaleLinear({
            range: [yMax, 0],
            domain: [0, Math.max(...yData)],
          });
          return (
            <>
              {tooltipData && (
                <TooltipWithBounds
                  top={tooltipTop}
                  left={tooltipLeft}
                  style={{
                    backgroundColor: "#111827",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    pointerEvents: "none",
                    maxwidth: "200px",
                    position: "absolute",
                  }}
                >
                  <div>
                    Timestamp:{" "}
                    <strong>{tooltipData.timestamp.toLocaleString()}</strong>
                  </div>
                  <div>Value: {tooltipData.value}</div>
                </TooltipWithBounds>
              )}
              <svg width={width} height={height}>
                <Group left={margin.left} top={margin.top}>
                  {isVisible && (
                    <LinePath
                      data={data}
                      x={(d) => xScale(d.timestamp) ?? 0}
                      y={(d) => yScale(d.value) ?? 0}
                      stroke="#6366f1"
                      strokeWidth={3}
                    />
                  )}
                  <rect
                    width={xMax}
                    height={yMax}
                    fill="transparent"
                    onMouseMove={(event) => {
                      const point = localPoint(event);
                      if (!point) return;

                      const x = point.x - margin.left;
                      const hoveredTime = xScale.invert(x).getTime();

                      let closest = data[0];
                      let minDiff = Math.abs(
                        closest.timestamp.getTime() - hoveredTime,
                      );
                      for (let i = 1; i < data.length; i++) {
                        const diff = Math.abs(
                          data[i].timestamp.getTime() - hoveredTime,
                        );
                        if (diff < minDiff) {
                          minDiff = diff;
                          closest = data[i];
                        }
                      }

                      if (
                        hoveredPoint?.timestamp.getTime() !==
                        closest.timestamp.getTime()
                      ) {
                        setHoveredPoint(closest);
                        showTooltip({
                          tooltipData: closest,
                          tooltipLeft: xScale(closest.timestamp) + margin.left,
                          tooltipTop: yScale(closest.value) + margin.top,
                        });
                      }
                    }}
                    onMouseLeave={hideTooltip}
                  />

                  {tooltipData && (
                    <>
                      <line
                        x1={xScale(tooltipData.timestamp)}
                        x2={xScale(tooltipData.timestamp)}
                        y1={0}
                        y2={yMax}
                        stroke="#CC0000"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        pointerEvents="none"
                      />
                      <circle
                        cx={xScale(tooltipData.timestamp)}
                        cy={yScale(tooltipData.value)}
                        r={5}
                        fill="#6366f1"
                        stroke="white"
                        strokeWidth={2}
                      />
                    </>
                  )}

                  <AxisBottom
                    top={yMax}
                    scale={xScale}
                    stroke="#6b7280"
                    tickStroke="#6b7280"
                    tickLabelProps={() => ({
                      fill: "#6b7280",
                      fontSize: 11,
                      textAnchor: "middle",
                    })}
                  />
                  <AxisLeft
                    scale={yScale}
                    stroke="#6b7280"
                    tickStroke="#6b7280"
                    tickLabelProps={() => ({
                      fill: "#6b7280",
                      fontSize: 11,
                      textAnchor: "end",
                      dx: "-0.5em",
                      dy: "0.25em",
                    })}
                    numTicks={10}
                  />
                </Group>
              </svg>
            </>
          );
        }}
      </ParentSize>
    </div>
  );
}
