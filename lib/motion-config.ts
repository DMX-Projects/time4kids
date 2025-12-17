/**
 * Motion Animation Configuration
 * Inspired by Skole.vamtam.com
 * Whimsical, playful, kid-friendly animations
 */

export const motionConfig = {
    // Easing curves
    easing: {
        gentle: 'power1.out',
        medium: 'power2.out',
        strong: 'power3.out',
        bounce: 'back.out(1.7)',
        elastic: 'elastic.out(1, 0.5)',
        smooth: 'power1.inOut',
    },

    // Duration presets
    duration: {
        fast: 0.3,
        normal: 0.8,
        slow: 1.2,
        verySlow: 1.6,
        loop: {
            short: 5,
            medium: 8,
            long: 12,
        },
    },

    // Floating shapes configuration
    floatingShapes: {
        drift: {
            x: [-30, 30],
            y: [-40, 40],
            rotate: [-5, 5],
            scale: [0.95, 1.05],
            opacity: [0.4, 0.7],
            duration: 10,
            ease: 'power1.inOut',
        },
        gentle: {
            y: [-20, 20],
            duration: 6,
            ease: 'power1.inOut',
        },
        circular: {
            duration: 12,
            ease: 'none',
        },
    },

    // Hero entrance animations
    hero: {
        title: {
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.15,
        },
        subtitle: {
            y: 50,
            opacity: 0,
            duration: 1,
            delay: 0.3,
            ease: 'power3.out',
        },
        description: {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.5,
            ease: 'power2.out',
        },
        button: {
            y: 30,
            opacity: 0,
            duration: 0.6,
            delay: 0.7,
            stagger: 0.15,
            ease: 'back.out(1.2)',
        },
        illustration: {
            x: -100,
            opacity: 0,
            duration: 1.2,
            ease: 'back.out(1.7)',
            delay: 0.4,
        },
    },

    // Scroll-triggered animations
    scrollTrigger: {
        sectionTitle: {
            scale: 0.9,
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            start: 'top 80%',
        },
        cardLeft: {
            x: -100,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.2)',
            stagger: 0.2,
            start: 'top 75%',
        },
        cardRight: {
            x: 100,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.2)',
            stagger: 0.2,
            start: 'top 75%',
        },
        fadeUp: {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.15,
            start: 'top 80%',
        },
    },

    // Micro-interactions
    microInteractions: {
        buttonHover: {
            y: -5,
            scale: 1.05,
            duration: 0.3,
            ease: 'back.out(1.7)',
        },
        buttonTilt: {
            rotateX: -5,
            rotateY: 5,
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out',
        },
        iconWobble: {
            rotation: [-3, 3, -2, 2, 0],
            duration: 0.6,
            ease: 'power1.inOut',
        },
        ctaPulse: {
            scale: [1, 1.05, 1],
            duration: 2,
            repeat: -1,
            repeatDelay: 4,
            ease: 'power1.inOut',
        },
        cardLift: {
            y: -10,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            duration: 0.3,
            ease: 'power2.out',
        },
    },

    // Illustration animations
    illustrations: {
        bobbing: {
            y: [-5, 5],
            duration: 3,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
        },
        floating: {
            y: [-10, 10],
            x: [-5, 5],
            duration: 4,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
        },
        hairMovement: {
            rotation: [-2, 2],
            transformOrigin: 'top center',
            duration: 2,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
        },
        treeSway: {
            rotation: [-3, 3],
            transformOrigin: 'bottom center',
            duration: 4,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
        },
        wiggle: {
            rotation: [-5, 5, -3, 3, 0],
            duration: 1,
            ease: 'power1.inOut',
        },
    },

    // Background waves
    waves: {
        gentle: {
            duration: 20,
            ease: 'none',
            repeat: -1,
        },
        medium: {
            duration: 15,
            ease: 'none',
            repeat: -1,
        },
    },

    // Stagger configurations
    stagger: {
        fast: 0.1,
        normal: 0.15,
        slow: 0.2,
        verySlow: 0.3,
    },
};

export default motionConfig;
