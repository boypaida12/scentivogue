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
    question: "What age range do your products cater to?",
    answer:
      "Our products cater to newborns all the way up to teenagers. We also stock essentials for expectant and new mums. Each product listing includes age and size recommendations to help you choose the right fit.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Simply browse our store, add items to your cart, and proceed to checkout. You can pay securely via Mobile Money (MTN, Vodafone, AirtelTigo), bank card, or choose Cash on Delivery for orders under GH₵ 200.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes! We offer Cash on Delivery for orders under GH₵ 200 within our delivery areas. Simply select 'Cash on Delivery' at checkout and have the exact amount ready when your order arrives.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery within Accra typically takes 1-3 business days. Orders outside Accra may take 3-5 business days. You will receive a call from our team to confirm your delivery schedule.",
  },
  {
    question: "Is free delivery available?",
    answer:
      "Yes! We offer free delivery on all orders above GH₵ 200 within Accra.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Please contact us via whatsapp 0245354884 or email mommysoasis25@gmail.com with your order number to initiate a return.",
  },
  {
    question: "How do I track my order?",
    answer:
      "After placing your order, you will receive an order confirmation with your order number. Our team will contact you directly to provide delivery updates. You can also reach out to us with your order number for a status update.",
  },
  {
    question: "Are your products authentic and safe for children?",
    answer:
      "Absolutely. We carefully curate all products to ensure they meet quality and safety standards suitable for babies and children. We only stock from trusted suppliers and brands.",
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