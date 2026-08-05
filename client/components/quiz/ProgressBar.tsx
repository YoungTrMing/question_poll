import { motion } from "framer-motion";

export interface SegmentProgressData {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  isCurrent: boolean;
}

interface ProgressBarProps {
  segmentProgressData: SegmentProgressData[];
}

export default function ProgressBar({
  segmentProgressData,
}: ProgressBarProps) {
  if (segmentProgressData.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-full z-50 h-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Padding container for rounded segments with gaps */}
      <div className="absolute top-0 left-0 w-full px-2 py-1 h-4 flex gap-2 items-center">
        {segmentProgressData.map((segment) => {
          // Calculate progress percentage for this segment
          const segmentProgress =
            segment.totalTasks > 0
              ? (segment.completedTasks / segment.totalTasks) * 100
              : 0;

          return (
            <div
              key={segment.id}
              className="flex-1 h-full rounded-full"
              style={{
                backgroundColor: "rgba(200, 200, 200, 0.35)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Progress fill for segment */}
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                  boxShadow: "0 0 20px rgba(251, 191, 36, 1), 0 0 40px rgba(251, 191, 36, 0.7), 0 0 60px rgba(245, 158, 11, 0.5), inset 0 0 12px rgba(255, 255, 255, 0.4)",
                }}
                animate={{
                  width: `${segmentProgress}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 40,
                  mass: 0.5,
                }}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
