'use client';

import { Key } from 'react';
import { HairStyleCard } from './imgCard';

export function HairStyleGrid({ example }: { example: any }) {
    if (!example) {
        return null;
    }
  const HAIRSTYLES = example.imgs  
  return (
    <section id={example.name} className=" py-12">
        <div className="container mx-auto">
            <div className="text-center">
            <h2 className="mt-4 text-4xl font-semibold">{example.title}</h2>
            <p className="mt-6 font-medium text-muted-foreground">
            {example.description}
            </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {HAIRSTYLES.map((style: { title: string; originalImage: string; effectImage: string; }, index: Key | null | undefined) => (
                    <HairStyleCard
                    key={index}
                    title={style.title}
                    originalImage={style.originalImage}
                    effectImage={style.effectImage}
                    />
                ))}
            </div>
        </div>
    </section>
  );
}