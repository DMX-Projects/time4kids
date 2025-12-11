'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Brain, Heart, Users, Palette, Music, Dumbbell, BookOpen, Globe } from 'lucide-react';

const KeySkills = () => {
    const skills = [
        {
            icon: Brain,
            title: 'Cognitive Development',
            description: 'Problem-solving and critical thinking',
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: Heart,
            title: 'Emotional Intelligence',
            description: 'Self-awareness and empathy',
            color: 'from-pink-500 to-pink-600',
        },
        {
            icon: Users,
            title: 'Social Skills',
            description: 'Communication and collaboration',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: Palette,
            title: 'Creative Expression',
            description: 'Art, craft, and imagination',
            color: 'from-orange-500 to-orange-600',
        },
        {
            icon: Music,
            title: 'Musical Abilities',
            description: 'Rhythm, melody, and movement',
            color: 'from-green-500 to-green-600',
        },
        {
            icon: Dumbbell,
            title: 'Physical Development',
            description: 'Motor skills and coordination',
            color: 'from-red-500 to-red-600',
        },
        {
            icon: BookOpen,
            title: 'Language Skills',
            description: 'Reading, writing, and speaking',
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            icon: Globe,
            title: 'Environmental Awareness',
            description: 'Understanding the world around',
            color: 'from-teal-500 to-teal-600',
        },
    ];

    return (
        <div className="py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-display font-bold text-4xl mb-4">
                        8 Key <span className="gradient-text">Skills We Develop</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Our holistic curriculum focuses on developing these essential skills for your child's overall growth
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {skills.map((skill, index) => (
                        <Card key={index} className="text-center group cursor-pointer">
                            <div className={`w-16 h-16 bg-gradient-to-br ${skill.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                                <skill.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-base mb-2 text-gray-900">{skill.title}</h3>
                            <p className="text-gray-600 text-sm">{skill.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KeySkills;
