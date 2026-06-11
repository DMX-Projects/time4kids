"use client";



import { Play } from "lucide-react";

import { ParentDocList } from "@/components/dashboard/parent/ParentDocList";



/** Watch • Hear • Learn — videos, audio, PDFs, and other learning resources together. */

export default function ParentVideosPage() {

    return (

        <ParentDocList

            category="VIDEOS"

            title="Watch Hear and Learn (AY 2026-27)"

            description="Videos, audio clips, PDFs, and other learning resources from your centre — all in one place."

            emptyMessage="No learning resources uploaded yet. Your centre will add videos, audio, and files here."

            headerIcon={<Play className="w-5 h-5" />}

            mixedMedia

        />

    );

}

