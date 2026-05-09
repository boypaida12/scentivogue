"use client";

import Image from "next/image";
import React from "react";

const App = () => {

    const testimonials = [
        { id: 1, date: "2026", text: "“As a first timer with your franchise, this is excellent by far and all expectations well met. Special request, I need a physician sample”", name: "Anon", role: "Health Worker", img: "assets/uncle.svg" },
        { id: 2, date: "2026", text: "“Oh and I love the fact that they are portable, I literally have one in my purse every single day and wherever I go.”", name: "Anon", role: "Business woman", img: "assets/aunty.svg" },
        { id: 3, date: "2026", text: "“They all smell soo good, see I am indecisive at the moment. The one I gave to my brother is amazing. It is giviiing!.”", name: "Anon", role: "Corporate Worker, Inc.", img: "assets/uncle.svg" },
        { id: 4, date: "2026", text: "“This is the best perfume fragrance (Baccarat) I have tried so far and it is surprisingly long lasting. Thanks so much for giving me a great product”", name: "Anon", role: "Business woman", img: "assets/aunty.svg" },
        { id: 5, date: "2026", text: "“Thee perfume oils smell really nice. I could not gt over the smell since the first day it was delivered. Due to the wonderful scent, my sister came for it as the new owner lol.”", name: "Anon", role: "Student", img: "assets/uncle.svg" }
    ];

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isMobile, setIsMobile] = React.useState(false);

    // FIX: avoid window usage during SSR
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize(); // run once on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNext = () => {
        setCurrentIndex((prev) => prev + 3 >= testimonials.length ? 0 : prev + 3);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => prev - 3 < 0 ? Math.max(testimonials.length - 3, 0) : prev - 3);
    };

    React.useEffect(() => {
        if (!isMobile) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                prev + 1 >= testimonials.length ? 0 : prev + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [isMobile, testimonials.length]);

    return (
        <>

            <section className='py-20 container mx-auto px-4'>
                <div>
                    <h1 className='text-neutral-900 font-medium text-4xl md:text-[40px] text-center md:text-left'>
                        What our customers say about us
                    </h1>

                    <div className='hidden md:flex justify-end gap-2 mt-4'>
                        <div onClick={handlePrev} className='h-10 w-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all text-neutral-500'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
                            </svg>
                        </div>

                        <div onClick={handleNext} className='h-10 w-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all text-neutral-500'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    <div className='mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 md:px-0 mt-12 md:mt-6'>
                        {testimonials.slice(currentIndex, isMobile ? currentIndex + 1 : currentIndex + 3).map((item) => (
                            <div key={item.id} className='bg-zinc-50 hover:-translate-y-1 transition duration-300 border border-zinc-200 rounded-2xl p-6 space-y-6'>
                                
                                <div className='flex items-start justify-between'>
                                    <div className="flex">
                                        {Array(5).fill(0).map((_, i) => (
                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                className="lucide lucide-star text-transparent fill-[#FF8F20]">
                                                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                                            </svg>
                                        ))}
                                    </div>

                                    <p className='text-xs text-neutral-500'>{item.date}</p>
                                </div>

                                <p className='text-sm/6 text-neutral-600'>{item.text}</p>

                                <div className='flex items-center gap-4 mt-4'>
                                    <Image src={item.img} alt="User Avatar" className='w-12 h-12 rounded-full object-cover' width={100} height={100}/>
                                    <div>
                                        <p className='text-sm text-neutral-700'>{item.name}</p>
                                        <p className='text-xs font-medium text-neutral-500'>{item.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hidden max-[768px]:flex items-center justify-center mt-5 space-x-2">
                    {testimonials.map((_, index) => (
                        <span key={index} onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentIndex
                                    ? "bg-neutral-800"
                                    : "bg-neutral-300"
                            }`}
                        ></span>
                    ))}
                </div>
            </section>
        </>
    );
};

export default App;