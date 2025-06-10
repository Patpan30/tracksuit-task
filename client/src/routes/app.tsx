import { useCallback, useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import type { Insight } from "../schemas/insight.ts";

const fetchInsights = async (): Promise<Insight[]> => {
  const res = await fetch(`/api/insights`);
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error ?? `HTTP ${res.status}`);
  }
  return res.json();  
};

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  const refreshInsights = useCallback(async () => {
    try {
      setInsights(await fetchInsights());
    } catch (err) {
      console.error("Failed to fetch insights:", err)
    } 
  }, []);


  const removeInsight = useCallback((id: number) =>
    setInsights((prev) => prev.filter((i) => i.id !== id)), []);

  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  return (
    <main className={styles.main}>
      <Header onAdd={refreshInsights}/>
      <Insights className={styles.insights} insights={insights} onRemove={removeInsight}/>
    </main>
  );
};
