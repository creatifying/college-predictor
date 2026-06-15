import PredictorPage from "@/components/PredictorPage";

export const metadata = {
  title: "CSAB College Predictor - NITs, IIITs & GFTIs",
  description: "Predict your CSAB special round admission chances across NITs, IIITs and GFTIs using historical cutoff data.",
};

export default function CsabPage() {
  return (
    <PredictorPage
      type="csab"
      title="CSAB Predictor"
      subtitle="Predict your chances in CSAB special rounds with Home State & Other State quotas"
    />
  );
}

