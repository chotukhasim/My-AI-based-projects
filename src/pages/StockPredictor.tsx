import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Papa from "papaparse";
import { addDays, format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Legend } from "recharts";

interface PricePoint { date: string; close: number }

const sampleData: PricePoint[] = [
  { date: "2025-05-01", close: 182.1 },
  { date: "2025-05-02", close: 183.5 },
  { date: "2025-05-05", close: 181.9 },
  { date: "2025-05-06", close: 184.2 },
  { date: "2025-05-07", close: 186.0 },
  { date: "2025-05-08", close: 185.2 },
  { date: "2025-05-09", close: 187.4 },
  { date: "2025-05-12", close: 188.1 },
  { date: "2025-05-13", close: 189.0 },
  { date: "2025-05-14", close: 188.6 },
  { date: "2025-05-15", close: 190.2 },
  { date: "2025-05-16", close: 191.1 },
  { date: "2025-05-19", close: 192.4 },
  { date: "2025-05-20", close: 193.0 },
  { date: "2025-05-21", close: 192.2 },
  { date: "2025-05-22", close: 193.8 },
  { date: "2025-05-23", close: 194.5 },
  { date: "2025-05-27", close: 195.3 },
  { date: "2025-05-28", close: 196.1 },
  { date: "2025-05-29", close: 196.9 },
];

function linearRegression(y: number[]) {
  const n = y.length;
  const xs = y.map((_, i) => i);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * y[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = n !== 0 ? (sumY - slope * sumX) / n : 0;
  return { slope, intercept };
}

function buildChartData(data: PricePoint[], horizon: number) {
  if (data.length === 0) {
    return { combined: [] as any[], slope: 0, intercept: 0 };
  }
  const closes = data.map((d) => d.close);
  const { slope, intercept } = linearRegression(closes);

  const withPredHistorical = data.map((d, i) => ({
    date: d.date,
    actual: d.close,
    predicted: slope * i + intercept,
  }));

  const start = new Date(data[data.length - 1].date);
  const future: { date: string; actual?: number; predicted: number }[] = [];
  for (let h = 1; h <= horizon; h++) {
    const x = data.length - 1 + h;
    const date = format(addDays(start, h), "yyyy-MM-dd");
    future.push({ date, predicted: slope * x + intercept });
  }

  return { combined: [...withPredHistorical, ...future], slope, intercept };
}

const StockPredictor = () => {
  const [data, setData] = useState<PricePoint[]>(sampleData);
  const [horizon, setHorizon] = useState<number>(14);

  const { combined, slope } = useMemo(() => buildChartData(data, horizon), [data, horizon]);

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: "Stock Price Predictor",
      description: "Forecast stock prices from CSV using simple linear regression.",
      keywords: "stock prediction, regression, CSV, JavaScript"
    }),
    []
  );

  const onFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (res) => {
        const rows = (res.data as any[]).filter(Boolean);
        const parsed: PricePoint[] = rows
          .map((r) => {
            const date = (r.date || r.Date || r.DATE || r.timestamp || r.Timestamp)?.toString?.();
            const close = Number(r.close ?? r.Close ?? r.CLOSE ?? r.price ?? r.Price);
            if (!date || Number.isNaN(close)) return null;
            return { date, close } as PricePoint;
          })
          .filter(Boolean) as PricePoint[];
        if (parsed.length > 0) setData(parsed);
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Stock Price Predictor | AI Lab</title>
        <meta name="description" content="Upload a CSV and forecast stock prices with in-browser linear regression." />
        <link rel="canonical" href="/stocks" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Stock Price Predictor</h1>
        </header>
        <section>
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle>Stock Price Predictor</CardTitle>
              <CardDescription>Simple linear regression over closing prices. Bring your own CSV (date, close).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload CSV</Label>
                  <Input id="file" type="file" accept=".csv" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                  }} />
                </div>
                <div className="space-y-2">
                  <Label>Forecast horizon (days)</Label>
                  <div className="px-1">
                    <Slider value={[horizon]} min={7} max={60} step={1} onValueChange={(v) => setHorizon(v[0])} />
                    <div className="text-sm text-muted-foreground mt-1">{horizon} days</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combined} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" hide={false} minTickGap={24} />
                      <YAxis domain={["auto", "auto"]} />
                      <ReTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="actual" name="Actual" stroke="hsl(var(--foreground))" dot={false} />
                      <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(var(--primary))" strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Model: y = a·t + b (slope {slope.toFixed(4)}). This is a teaching demo; not financial advice.
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="soft" onClick={() => setData(sampleData)}>Load Sample Data</Button>
              <Button variant="outline" onClick={() => setData([])}>Clear</Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </>
  );
};

export default StockPredictor;
