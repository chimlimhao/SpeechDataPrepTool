import { motion } from "framer-motion";

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay }}>
      <div className="p-4 sm:p-6 bg-card rounded-lg shadow-sm border border-accent">
        <div className="mb-3 sm:mb-4 inline-block p-2 sm:p-3 bg-accent rounded-full text-primary">{icon}</div>
        <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 text-foreground">{title}</h4>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

export default FeatureCard;