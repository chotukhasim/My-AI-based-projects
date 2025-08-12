import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "AI Lab Demos",
      description: "Interactive ML demos: stock prediction and sentiment analysis.",
      url: typeof window !== "undefined" ? window.location.origin : "",
      applicationCategory: "EducationalApplication"
    }),
    []
  );

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spotlight-x", `${x}%`);
    el.style.setProperty("--spotlight-y", `${y}%`);
  };

  return (
    <>
      <Helmet>
        <title>AI Lab — Stock Predictor & Tweet Sentiment</title>
        <meta name="description" content="Try two interactive ML demos: a stock price predictor and a tweet sentiment analyzer." />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div ref={containerRef} onMouseMove={onMouseMove} className="min-h-screen relative overflow-hidden">
        <header className="container py-10">
          <nav className="flex items-center justify-between">
            <div className="text-lg font-semibold">AI Lab</div>
            <div className="hidden sm:flex gap-3">
              <Link to="/stocks"><Button variant="soft">Stock Predictor</Button></Link>
              <Link to="/sentiment"><Button variant="soft">Sentiment</Button></Link>
            </div>
          </nav>
        </header>

        <main className="container pb-24">
          <section className="relative rounded-2xl border bg-card p-10 md:p-16 shadow-[var(--shadow-elevated)]">
            <div className="pointer-events-none absolute inset-0 interactive-spotlight rounded-2xl" aria-hidden="true" />
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Explore Interactive Machine Learning Demos
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                Learn by doing. Predict stock prices with linear regression and classify tweet sentiment in your browser.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/stocks"><Button variant="hero" size="lg">Try Stock Predictor</Button></Link>
                <Link to="/sentiment"><Button variant="outline" size="lg">Analyze Tweets</Button></Link>
              </div>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6 mt-10">
            <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow">
              <CardHeader>
                <CardTitle>Stock Price Predictor</CardTitle>
                <CardDescription>Upload CSV or use sample data. Forecast with simple linear regression and visualize results.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/stocks"><Button variant="soft">Open</Button></Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow">
              <CardHeader>
                <CardTitle>Twitter Sentiment</CardTitle>
                <CardDescription>Paste tweets and get positive, neutral, or negative labels with confidence scores.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/sentiment"><Button variant="soft">Open</Button></Link>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </>
  );
};

export default Index;
