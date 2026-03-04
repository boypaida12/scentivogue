"use client"

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const testimonials = [
  {
    text: "Scenti Vogue helped me choose everything for my hospital bag on WhatsApp. They were patient and honest about what I really needed",
    author: "Ama Serwaa, Expectant Mum, Accra",
    image:
      "/assets/feeding-mum.svg",
  },
  {
    text: "I got hair accessories and little gifts for my niece. The items were colourful and fun – exactly like the pictures they sent.",
    author: "Kofi Mensah, Gift Buyer, Kumasi",
    image:
      "/assets/uncle.svg",
  },
  {
    text: "The bear clothing sets are so cute. My boys love them and the fabric is light enough for Ghana weather.",
    author: "Gloria, Mum of 2, Takoradi",
    image:
     "/assets/aunty.svg",
  },
];

const TestimonialCarousel = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTestimonial(
        (prevTestimonial) => (prevTestimonial + 1) % testimonials.length,
      );
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const { text, author, image } = testimonials[currentTestimonial];

  const variants = {
    initial: { opacity: 0, y: "100%", scale: 0.1 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: "100%", scale: 0.1 },
  };
  const dotVariants = {
    active: { scale: 1.2, backgroundColor: "#3f3f46" },
    inactive: { scale: 1, backgroundColor: "#D1D5DB" },
  };

  return (
    <section className="py-16 border">
      <div className="w-full">
        <h2 className="text-3xl font-bold text-center mb-4">Why Choose Us</h2>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentTestimonial}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className="flex w-full flex-col items-center justify-center"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.5,
            }}
          >
            <Image src={image} alt={author} className="m-0 h-18 w-18" width={72} height={72}/>
            <p className="max-md:m-2 text-center md:text-2xl font-medium tracking-tight max-w-4xl">
              &quot;{text}&quot;
            </p>
            <div className="mx-auto mt-5">
              <div className="flex flex-col items-center justify-center space-x-3">
                <div className="font-regular text-sm text-gray-900/80">
                  {author}
                </div>
              </div>
            </div>
          </motion.div>
          <div className="mt-8 flex justify-center">
            {testimonials.map((_, index) => (
              <motion.div
                key={index}
                className="mx-1 h-1 w-1 cursor-pointer rounded-full"
                variants={dotVariants}
                animate={index === currentTestimonial ? "active" : "inactive"}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
