"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface Props {
  score: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

const RISK_COLORS: Record<Props["riskLevel"], string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

const RADIUS = 80;
const ARC_LENGTH = Math.PI * RADIUS; // ~251.33 — semicircle

export function RiskGauge({ score, riskLevel }: Props) {
  const motionScore = useMotionValue(0);
  const dashOffset = useTransform(motionScore, [0, 100], [ARC_LENGTH, 0]);

  useEffect(() => {
    const controls = animate(motionScore, score, { duration: 1.6, ease: "easeOut" });
    return () => controls.stop();
  }, [score, motionScore]);

  const color = RISK_COLORS[riskLevel];

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 110"
        width="280"
        height="154"
        aria-label={`Automation risk: ${score}%`}
      >
        {/* Track arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
          className="dark:opacity-20"
        />
        {/* Animated fill arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          style={{ strokeDashoffset: dashOffset }}
        />
        {/* Score label */}
        <text
          x="100"
          y="86"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill={color}
        >
          {score}%
        </text>
        {/* Risk level label */}
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fontSize="11"
          fill="#94a3b8"
          letterSpacing="1"
        >
          {riskLevel.toUpperCase()} RISK
        </text>
      </svg>
    </div>
  );
}
