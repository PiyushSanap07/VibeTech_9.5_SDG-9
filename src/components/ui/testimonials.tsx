"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

interface Testimonial {
    image: string
    name: string
    username: string
    text: string
    social: string
}

interface TestimonialsProps {
    testimonials: Testimonial[]
    className?: string
    title?: string
    description?: string
    maxDisplayed?: number
    isSlider?: boolean
}

export function Testimonials({
    testimonials,
    className,
    title = "Read what people are saying",
    description = "Dummy feedback from virtual customers using our component library.",
    maxDisplayed = 6,
    isSlider = false,
}: TestimonialsProps) {
    const [showAll, setShowAll] = useState(false)

    const openInNewTab = (url: string) => {
        window.open(url, "_blank")?.focus()
    }

    if (isSlider) {
        // Double the testimonials for seamless infinite scroll
        const duplicatedTestimonials = [...testimonials, ...testimonials];

        return (
            <div className={cn("overflow-hidden py-10", className)}>
                <div className="flex flex-col items-center justify-center pt-5 mb-12">
                    <h2 className="text-center text-4xl font-bold mb-4">{title}</h2>
                    <p className="text-center text-muted-foreground max-w-2xl px-6">
                        {description.split("<br />").map((line, i) => (
                            <span key={i}>
                                {line}
                                {i !== description.split("<br />").length - 1 && <br />}
                            </span>
                        ))}
                    </p>
                </div>

                <div className="relative flex overflow-x-hidden">
                    <div className="animate-marquee whitespace-nowrap flex gap-6 py-4">
                        {duplicatedTestimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="w-80 h-auto p-6 flex-shrink-0 relative bg-white/50 backdrop-blur-sm border-slate-200 hover:border-primary-600/50 transition-all duration-300"
                            >
                                <div className="flex items-center">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        width={50}
                                        height={50}
                                        className="rounded-full object-cover size-12 border-2 border-primary-600/20"
                                    />
                                    <div className="flex flex-col pl-4">
                                        <span className="font-bold text-slate-900 text-sm">
                                            {testimonial.name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {testimonial.username}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-normal italic">
                                        "{testimonial.text}"
                                    </p>
                                </div>
                                <button
                                    onClick={() => openInNewTab(testimonial.social)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-primary-600 transition-colors"
                                >
                                    <Icons.twitter className="size-4" aria-hidden="true" />
                                </button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CSS for Marquee Animation */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        animation: marquee 40s linear infinite;
                    }
                    .animate-marquee:hover {
                        animation-play-state: paused;
                    }
                `}} />
            </div>
        )
    }

    return (
        <div className={className}>
            <div className="flex flex-col items-center justify-center pt-5">
                <div className="flex flex-col gap-5 mb-12">
                    <h2 className="text-center text-4xl font-bold">{title}</h2>
                    <p className="text-center text-muted-foreground max-w-2xl">
                        {description.split("<br />").map((line, i) => (
                            <span key={i}>
                                {line}
                                {i !== description.split("<br />").length - 1 && <br />}
                            </span>
                        ))}
                    </p>
                </div>
            </div>

            <div className="relative">
                <div
                    className={cn(
                        "flex justify-center items-center gap-6 flex-wrap",
                        !showAll &&
                        testimonials.length > maxDisplayed &&
                        "max-h-[800px] overflow-hidden",
                    )}
                >
                    {testimonials
                        .slice(0, showAll ? undefined : maxDisplayed)
                        .map((testimonial, index) => (
                            <Card
                                key={index}
                                className="w-80 h-auto p-6 relative bg-white border-slate-200 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex items-center">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        width={50}
                                        height={50}
                                        className="rounded-full size-12 object-cover"
                                    />
                                    <div className="flex flex-col pl-4">
                                        <span className="font-bold text-slate-900 border-b border-transparent hover:border-primary-600 transition-all cursor-pointer">
                                            {testimonial.name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {testimonial.username}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <p className="text-slate-600 leading-relaxed italic">
                                        "{testimonial.text}"
                                    </p>
                                </div>
                                <button
                                    onClick={() => openInNewTab(testimonial.social)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-primary-600 transition-colors"
                                >
                                    <Icons.twitter className="size-4" aria-hidden="true" />
                                </button>
                            </Card>
                        ))}
                </div>

                {testimonials.length > maxDisplayed && !showAll && (
                    <>
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10" />
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
                            <Button variant="outline" className="rounded-full border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white" onClick={() => setShowAll(true)}>
                                Show All Feedback
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
