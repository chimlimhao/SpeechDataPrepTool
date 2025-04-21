import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "What is Somleng?",
    answer: "Somleng is a specialized tool for Khmer speech recognition and processing. It helps researchers, journalists, and language enthusiasts transcribe, analyze, and enhance Khmer audio files efficiently and accurately."
  },
  {
    question: "What file formats are supported?",
    answer: "Currently, Somleng supports WAV audio files. We're working on expanding support for more formats in future updates."
  },
  {
    question: "How accurate is the speech recognition?",
    answer: "Our speech recognition technology achieves over 90% accuracy for clear Khmer audio. The accuracy may vary depending on audio quality, background noise, and dialects."
  },
  {
    question: "Can I process batches of files at once?",
    answer: "Yes, Somleng supports batch processing. You can upload multiple files or entire directories to process them efficiently in bulk."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a free trial that lets you process up to 10 minutes of audio. This allows you to test our services before committing to a subscription."
  },
  {
    question: "How do I export the transcriptions?",
    answer: "Somleng allows you to export transcriptions in multiple formats including TXT, CSV, and JSON. You can also directly copy text to your clipboard."
  }
]

export function FAQSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Got questions about Somleng? Find answers to common questions below. If you don't see what you're looking for, feel free to contact us.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-left py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-10 text-center">
            <p className="mb-4 text-muted-foreground">Still have questions?</p>
            <Button className="bg-teal-500 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 