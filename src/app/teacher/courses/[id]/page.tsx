import { redirect } from 'next/navigation';

export default function TeacherCoursePage({
  params,
}: {
  params: { id: string };
}) {
  // Redireciona para a página de conteúdo do curso
  redirect(`/teacher/courses/${params.id}/content`);
}
