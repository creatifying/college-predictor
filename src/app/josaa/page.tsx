import PredictorPage from "@/components/PredictorPage";

export const metadata = {
  title: "JoSAA College Predictor - NITs, IIITs & GFTIs",
  description: "Predict your JoSAA admission chances across NITs, IIITs and GFTIs using historical cutoff data.",
};

export default function JosaaPage() {
  return (
    <PredictorPage
      type="josaa"
      title="JoSAA Predictor"
      subtitle="Predict your chances at NITs, IIITs & GFTIs across all 6 counseling rounds"
    />
  );
}

