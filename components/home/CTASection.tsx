'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import FloatingShapes from '@/components/animations/FloatingShapes';
import MagneticButton from '@/components/ui/MagneticButton';
import { ArrowRight, MapPin, Briefcase } from 'lucide-react'; 
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const kidRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const scallopPath = "M0,0 V12 Q15,24 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12 V0 Z";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a "staggered" entrance for the cards
      cardsRef.current.forEach((card, i) => {
        gsap.from(card, {
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.2)",
          delay: i * 0.2,
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          }
        });
      });

      // The Kid "runs" across the grass at the bottom
      gsap.to(kidRef.current, {
        x: '88vw',
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 bg-[#F0F9FF] overflow-hidden">
      
      {/* Top Scallop: Transition from previous white section */}
      <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
        <svg viewBox="0 0 1200 24" className="w-full h-16 block fill-white" preserveAspectRatio="none">
          <path d={scallopPath} />
        </svg>
      </div>

      <FloatingShapes count={6} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-bubblegum text-5xl md:text-7xl mb-6 text-[#003366]">
            Ready to <span className="text-[#ef5f5f]">Explore?</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto font-baloo">
            Step into a world of wonder and start your adventure today.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Creative Card 1: Elevated */}
          <div 
            ref={(el) => { cardsRef.current[0] = el; }}
            className="group bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(239,95,95,0.15)] border-t-8 border-[#ef5f5f] hover:-translate-y-4 transition-all duration-500"
          >
            <div className="w-24 h-24 bg-[#ef5f5f]/10 rounded-3xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform">
              <ArrowRight className="w-12 h-12 text-[#ef5f5f]" />
            </div>
            <h3 className="font-bubblegum text-3xl mb-4 text-[#003366]">Enquiry</h3>
            <p className="text-gray-500 mb-8 font-baloo text-lg">Your journey begins with a single question.</p>
            <Link href="/admission">
              <button className="w-full bg-[#ef5f5f] text-white font-bubblegum text-xl py-4 rounded-2xl shadow-lg hover:shadow-[#ef5f5f]/40 transition-shadow">
                Start Now
              </button>
            </Link>
          </div>

          {/* Creative Card 2: Lowered for Visual Rhythm */}
          <div 
            ref={(el) => { cardsRef.current[1] = el; }}
            className="group bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(251,210,103,0.15)] border-t-8 border-[#fbd267] md:translate-y-12 hover:translate-y-8 transition-all duration-500"
          >
            <div className="w-24 h-24 bg-[#fbd267]/10 rounded-3xl flex items-center justify-center mb-8 -rotate-3 group-hover:rotate-0 transition-transform">
              <MapPin className="w-12 h-12 text-[#fbd267]" />
            </div>
            <h3 className="font-bubblegum text-3xl mb-4 text-[#003366]">Centers</h3>
            <p className="text-gray-500 mb-8 font-baloo text-lg">Find the magic of T.I.M.E. Kids near you.</p>
            <Link href="/locate-centre">
              <button className="w-full bg-[#fbd267] text-[#003366] font-bubblegum text-xl py-4 rounded-2xl shadow-lg hover:shadow-[#fbd267]/40 transition-shadow">
                Find Us
              </button>
            </Link>
          </div>

          {/* Creative Card 3: Elevated */}
          <div 
            ref={(el) => { cardsRef.current[2] = el; }}
            className="group bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(108,195,213,0.15)] border-t-8 border-[#6cc3d5] hover:-translate-y-4 transition-all duration-500"
          >
            <div className="w-24 h-24 bg-[#6cc3d5]/10 rounded-3xl flex items-center justify-center mb-8 rotate-6 group-hover:rotate-0 transition-transform">
              <Briefcase className="w-12 h-12 text-[#6cc3d5]" />
            </div>
            <h3 className="font-bubblegum text-3xl mb-4 text-[#003366]">Franchise</h3>
            <p className="text-gray-500 mb-8 font-baloo text-lg">Grow with India&apos;s favorite preschool.</p>
            <Link href="/franchise">
              <button className="w-full bg-[#6cc3d5] text-white font-bubblegum text-xl py-4 rounded-2xl shadow-lg hover:shadow-[#6cc3d5]/40 transition-shadow">
                Join Us
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- THE GROUND (Grass effect for the kid to walk on) --- */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent opacity-50 z-20" />

      {/* --- THE KID: Walking on the "Floor" --- */}
      <div ref={kidRef} className="absolute bottom-4 left-0 z-40 pointer-events-none">
          <div className="relative w-40 h-40 md:w-52 md:h-52">
              <Image 
                  src="/kid-character.gif" 
                  alt="Walking Kid" 
                  fill
                  className="object-contain drop-shadow-xl"
                  unoptimized
              />
          </div>
      </div>

      {/* Bottom Scallop: Transition to Footer */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none rotate-180">
        <svg viewBox="0 0 1200 24" className="w-full h-12 block fill-white" preserveAspectRatio="none">
          <path d={scallopPath} />
        </svg>
      </div>
    </section>
  );
};

export default CTASection;