'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import FloatingShapes from '@/components/animations/FloatingShapes';
import TwinklingStars from '@/components/animations/TwinklingStars';
import MagneticButton from '@/components/ui/MagneticButton';
import { ArrowRight, MapPin, Briefcase } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
          },
          scale: 0.95,
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });
      }

      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
            y: 60,
            opacity: 0,
            duration: 0.7,
            ease: 'back.out(1.4)',
            delay: index * 0.12,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-10 relative overflow-hidden">
      {/* Floating Shapes behind cards */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <FloatingShapes count={10} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/6 rounded-full blur-3xl"></div>
      </div>

      {/* Foreground content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-6">
          <h2 ref={titleRef} className="font-fredoka font-bold text-5xl md:text-6xl mb-4 text-[#003366]">
            Ready to Get Started?
          </h2>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-baloo">
            Join the T.I.M.E. Kids family and give your child the best start in their educational journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div ref={(el: HTMLDivElement | null) => { cardsRef.current[0] = el; }} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all hover-lift">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <ArrowRight className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-fredoka font-bold text-2xl mb-3 text-center text-[#003366]">Admission Enquiry</h3>
            <p className="text-gray-600 mb-6 text-center font-comic">Start your child&apos;s learning journey with us today.</p>
            <MagneticButton strength={0.3} className="block">
              <Link href="/admission" className="block">
                <Button variant="solid" className="w-full bg-primary-600 text-white hover:bg-primary-700 border-0 font-fredoka">
                  Enquire Now
                </Button>
              </Link>
            </MagneticButton>
          </div>

          <div ref={(el: HTMLDivElement | null) => { cardsRef.current[1] = el; }} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all hover-lift">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <MapPin className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-fredoka font-bold text-2xl mb-3 text-center text-[#003366]">Find a Centre</h3>
            <p className="text-gray-600 mb-6 text-center font-comic">Locate the nearest T.I.M.E. Kids centre in your area.</p>
            <MagneticButton strength={0.3} className="block">
              <Link href="/locate-centre" className="block">
                <Button variant="outline" className="w-full bg-white text-primary-600 hover:bg-gray-100 border-0 font-fredoka">
                  Locate Now
                </Button>
              </Link>
            </MagneticButton>
          </div>

          <div ref={(el: HTMLDivElement | null) => { cardsRef.current[2] = el; }} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all hover-lift">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Briefcase className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-fredoka font-bold text-2xl mb-3 text-center text-[#003366]">Franchise Opportunity</h3>
            <p className="text-gray-600 mb-6 text-center font-comic">Partner with us and start your own preschool.</p>
            <MagneticButton strength={0.3} className="block">
              <Link href="/franchise" className="block">
                <Button variant="outline" className="w-full bg-white text-primary-600 hover:bg-gray-100 border-0 font-fredoka">
                  Learn More
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
