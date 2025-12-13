import { redirect } from 'next/navigation';

export default async function TeacherCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Redireciona para a página de conteúdo do curso
  redirect(`/teacher/courses/${id}/content`);
}
