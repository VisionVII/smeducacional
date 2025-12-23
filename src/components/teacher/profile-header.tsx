import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar?: string | null;
  profileCompletion: number;
  totalCourses: number;
  totalStudents: number;
  totalModules: number;
  totalLessons: number;
}

export function ProfileHeader({
  name,
  email,
  avatar,
  profileCompletion,
  totalCourses,
  totalStudents,
  totalModules,
  totalLessons,
}: ProfileHeaderProps) {
  return (
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px] transition-transform duration-700" />

      <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Avatar e Info Principal */}
          <div className="flex gap-4 sm:gap-5 items-start w-full lg:flex-1">
            <div className="relative flex-shrink-0">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-4 border-primary/20 ring-4 ring-primary/10 transition-all hover:scale-105">
                <AvatarImage src={avatar || undefined} alt={name} />
                <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-theme-triple break-words leading-tight">
                  {name}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                  Professor | Educador Digital
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Ativo
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {profileCompletion}% Completo
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground break-all">
                {email}
              </p>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/teacher/profile">Editar Perfil</Link>
              </Button>
            </div>
          </div>

          {/* Stats Rápidas */}
          <div className="w-full lg:w-auto lg:min-w-[200px] grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            <div className="space-y-2 text-center bg-muted/30 rounded-lg p-3">
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {totalCourses}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Cursos
              </p>
            </div>
            <div className="space-y-2 text-center bg-muted/30 rounded-lg p-3">
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {totalStudents}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Alunos
              </p>
            </div>
            <div className="space-y-2 text-center bg-muted/30 rounded-lg p-3">
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {totalModules}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Módulos
              </p>
            </div>
            <div className="space-y-2 text-center bg-muted/30 rounded-lg p-3">
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {totalLessons}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Aulas
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
