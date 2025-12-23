'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  Clock,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  duration: number | null;
  level: string | null;
  price: number;
  isPaid: boolean;
  instructor: {
    name: string;
    avatar: string | null;
  };
  _count: {
    enrollments: number;
  };
}

interface CoursesCarouselProps {
  courses: Course[];
}

export function CoursesCarousel({ courses }: CoursesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isAutoPlay || courses.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % courses.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, courses.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % courses.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  if (courses.length === 0) {
    return null;
  }

  const currentCourse = courses[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Mobile Shorts Layout */}
      <div className="block md:hidden">
        <div className="relative h-screen max-h-[600px] w-full overflow-hidden">
          {/* Slides */}
          <div className="relative w-full h-full">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Background Image */}
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority={index === currentIndex}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-purple-600/40" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 pb-8">
                  {/* Top: Progress Indicators */}
                  <div className="flex gap-1">
                    {courses.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? 'bg-white'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Bottom: Course Info */}
                  <div className="space-y-4">
                    {/* Instructor */}
                    <div className="flex items-center gap-3">
                      {course.instructor.avatar ? (
                        <Image
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-white">
                        {course.instructor.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white leading-tight line-clamp-2">
                      {course.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-gray-200 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-gray-300">
                      {course.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}h</span>
                        </div>
                      )}
                      {course._count.enrollments > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course._count.enrollments}</span>
                        </div>
                      )}
                      {course.level && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs uppercase font-semibold px-2 py-1 rounded bg-primary/30">
                            {course.level}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        asChild
                        className="flex-1 h-11 bg-gradient-to-r from-primary via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/50"
                      >
                        <Link
                          href={`/courses/${course.slug}`}
                          className="flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Explorar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dots (already in progress indicators) */}
      </div>

      {/* Desktop Landscape Layout */}
      <div className="hidden md:block relative h-96 lg:h-[500px] w-full overflow-hidden">
        {/* Slides */}
        <div className="relative w-full h-full">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Background Image */}
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority={index === currentIndex}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-purple-600/40" />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center p-8 lg:p-12">
                <div className="max-w-lg space-y-6">
                  {/* Instructor */}
                  <div className="flex items-center gap-3">
                    {course.instructor.avatar ? (
                      <Image
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-300">Instrutor</p>
                      <p className="font-semibold text-white">
                        {course.instructor.name}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {course.title}
                  </h2>

                  {/* Description */}
                  <p className="text-lg text-gray-200 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm text-gray-300">
                    {course.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>{course.duration}h de conteúdo</span>
                      </div>
                    )}
                    {course._count.enrollments > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>
                          {course._count.enrollments.toLocaleString()} alunos
                        </span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-semibold px-3 py-1 rounded-full bg-primary/30">
                          {course.level}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      asChild
                      className="h-12 px-8 bg-gradient-to-r from-primary via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/50 text-white font-semibold"
                    >
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Começar Curso
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 right-6 flex gap-2 z-10">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-6 left-6 flex gap-2 z-10">
          {courses.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
