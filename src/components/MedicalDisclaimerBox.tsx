import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function MedicalDisclaimerBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`my-6 p-4 sm:p-5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 shadow-xs ${className}`}
      role="note"
      aria-label="Medical Disclaimer"
    >
      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="text-xs sm:text-sm leading-relaxed">
        <p className="font-bold text-amber-950 dark:text-amber-100 mb-1">
          Clinical &amp; Medical Disclaimer
        </p>
        <p className="text-amber-800 dark:text-amber-300">
          The content published on this website is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, clinical diagnosis, or treatment. Always seek the direct guidance of your physician or qualified healthcare provider with any questions regarding a medical condition. Never disregard or delay seeking professional clinical advice because of something you read here. Read our full{" "}
          <Link href="/medical-disclaimer" className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100">
            Medical Disclaimer
          </Link>.
        </p>
      </div>
    </div>
  );
}
