import { motion } from 'framer-motion'

export function ReasoningReveal({ text }: { text: string }) {
  const words = text.split(' ')

  return (
    <p className="text-base leading-relaxed text-mist-100">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.3, delay: i * 0.02 }}
          className="mr-1 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}
