import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import SentimentLib from "sentiment";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sentiment = new SentimentLib();

type Result = {
  text: string;
  score: number;
  comparative: number;
  label: "positive" | "neutral" | "negative";
};

function classify(score: number): Result["label"] {
  if (score >= 1) return "positive";
  if (score <= -1) return "negative";
  return "neutral";
}

const Sentiment = () => {
  const [input, setInput] = useState<string>("I love this product!\nThis is okay.\nWorst experience ever.");
  const [results, setResults] = useState<Result[] | null>(null);

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: "Tweet Sentiment Analysis",
      description: "Classify tweets as positive, neutral, or negative in the browser.",
      keywords: "sentiment analysis, tweets, NLP, JavaScript"
    }),
    []
  );

  const analyze = () => {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const out: Result[] = lines.map((text) => {
      const r = sentiment.analyze(text);
      const score = r.score as number;
      const comparative = (r as any).comparative as number;
      return { text, score, comparative, label: classify(score) };
    });
    setResults(out);
  };

  return (
    <>
      <Helmet>
        <title>Tweet Sentiment Analysis | AI Lab</title>
        <meta name="description" content="Analyze tweets as positive, neutral, or negative using in-browser NLP." />
        <link rel="canonical" href="/sentiment" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Twitter Sentiment Analysis</h1>
        </header>
        <section>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Twitter Sentiment Analysis</CardTitle>
              <CardDescription>Paste tweets (one per line). No server, runs entirely in your browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                placeholder="Paste tweets here, one per line"
              />
              <div>
                <Button variant="hero" onClick={analyze}>Analyze Sentiment</Button>
              </div>

              {results && (
                <div className="mt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tweet</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Comparative</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="max-w-[420px] whitespace-pre-wrap">{r.text}</TableCell>
                          <TableCell>
                            {r.label === "positive" && <Badge className="bg-primary text-primary-foreground">Positive</Badge>}
                            {r.label === "neutral" && <Badge variant="secondary">Neutral</Badge>}
                            {r.label === "negative" && <Badge className="bg-destructive text-destructive-foreground">Negative</Badge>}
                          </TableCell>
                          <TableCell className="text-right">{r.score}</TableCell>
                          <TableCell className="text-right">{r.comparative?.toFixed(3)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Tip: Lines are treated independently to mimic individual tweets.
            </CardFooter>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Sentiment;
