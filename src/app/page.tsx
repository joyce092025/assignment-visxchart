import LineChart from "@/components/LineChart";
import { useMemo } from "react";

function generateMockData() {
  const today = new Date();
  return Array.from({ length: 200 }).map((_, i) => ({
    timestamp: new Date(today.getTime() - (13 - i) * 24 * 60 * 60 * 1000),
    value: Math.floor(Math.random() * 100) + 20,
  }));
}

export default function Home() {
  const data = useMemo(() => {
    return generateMockData();
  }, []);
  return (
    <div style={{ height: 300 }}>
      <LineChart data={data} />
    </div>
  );
}
