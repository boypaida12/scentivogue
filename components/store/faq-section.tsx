"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    question: "Where do you get your perfume oils from?",
    answer:
      "They are sourced from Dubai and France.",
  },
  {
    question: "How long does your perfume oils last?",
    answer:
      "72 hours in the clothes and 12 hours on the skin.",
  },
  {
    question: "How many fragrances have you got for your perfume oils?",
    answer:
      "Over 100 frangrances to choose from.",
  },
  {
    question: "Do you wholesale your perfume oils?",
    answer:
      "We are one of the biggest suppliers of perfume oils in Ghana. We wholesale to retailers and individuals. Contact us for wholesale prices.",
  },
  {
    question: "Where are your fragrances made?",
    answer:
      "They are proudly made in Ghana with the best quality ingredients. We have a wide range of frangrances to choose from.",
  },
];

const INITIAL_DISPLAY_COUNT = 4;

export default function FaqSection() {
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined
  );
  const [showAll, setShowAll] = useState(false);

  const displayedFaqs = showAll
    ? FAQS
    : FAQS.slice(0, INITIAL_DISPLAY_COUNT);

  const toggleDisplay = () => {
    setShowAll(!showAll);
    setSelectedItem(undefined);
  };

  return (
    <section className="py-16 bg-gray-50" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="mb-3 text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500">
            Everything you need to know about shopping with us
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-4"
          value={selectedItem}
          onValueChange={setSelectedItem}
        >
          {displayedFaqs.map((faq, index) => {
            const itemValue = `item-${index + 1}`;
            const isSelected = selectedItem === itemValue;

            return (
              <AccordionItem
                key={index}
                value={itemValue}
                className={`rounded-none overflow-hidden shadow-sm bg-white border-2 transition-colors duration-200 ${
                  isSelected
                    ? "border-black"
                    : "border-transparent"
                }`}
              >
                <AccordionTrigger className="flex justify-between items-center px-6 py-5 hover:bg-gray-50 w-full hover:no-underline">
                  <span className="text-base font-medium text-left">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {FAQS.length > INITIAL_DISPLAY_COUNT && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="rounded-full px-8"
              onClick={toggleDisplay}
            >
              {showAll ? "View Less" : `View More (${FAQS.length - INITIAL_DISPLAY_COUNT} more)`}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}