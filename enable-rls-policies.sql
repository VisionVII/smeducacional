-- ====================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ====================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ====================================
-- POLÍTICAS PARA USERS
-- ====================================

-- Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);

-- Usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Todos podem ver perfis públicos de professores (para exibir cursos)
DROP POLICY IF EXISTS "users_select_teachers" ON public.users;
CREATE POLICY "users_select_teachers" ON public.users
  FOR SELECT
  USING (role = 'TEACHER');

-- ====================================
-- POLÍTICAS PARA CATEGORIES
-- ====================================

-- Todos podem visualizar categorias
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT
  USING (true);

-- Apenas admins podem inserir categorias
DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Apenas admins podem atualizar categorias
DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Apenas admins podem deletar categorias
DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;
CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );


DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT
  USING ("isPublished" = true);

DROP POLICY IF EXISTS "courses_select_own" ON public.courses;
CREATE POLICY "courses_select_own" ON public.courses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND id = "instructorId"
    )
  );

DROP POLICY IF EXISTS "courses_select_admin" ON public.courses;
CREATE POLICY "courses_select_admin" ON public.courses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "courses_insert_teacher_admin" ON public.courses;
CREATE POLICY "courses_insert_teacher_admin" ON public.courses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text 
      AND (role = 'TEACHER' OR role = 'ADMIN')
      AND (id = "instructorId" OR role = 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "courses_update_own_or_admin" ON public.courses;
CREATE POLICY "courses_update_own_or_admin" ON public.courses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text 
      AND (id = "instructorId" OR role = 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "courses_delete_own_or_admin" ON public.courses;
CREATE POLICY "courses_delete_own_or_admin" ON public.courses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text 
      AND (id = "instructorId" OR role = 'ADMIN')
    )
  );


DROP POLICY IF EXISTS "modules_select_published_courses" ON public.modules;
CREATE POLICY "modules_select_published_courses" ON public.modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = "courseId" AND "isPublished" = true
    )
  );

DROP POLICY IF EXISTS "modules_select_own_courses" ON public.modules;
CREATE POLICY "modules_select_own_courses" ON public.modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = "courseId" AND "instructorId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "modules_select_admin" ON public.modules;
CREATE POLICY "modules_select_admin" ON public.modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "modules_insert_own_courses" ON public.modules;
CREATE POLICY "modules_insert_own_courses" ON public.modules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = "courseId" 
      AND ("instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );

DROP POLICY IF EXISTS "modules_update_own_courses" ON public.modules;
CREATE POLICY "modules_update_own_courses" ON public.modules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = "courseId" 
      AND ("instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );

DROP POLICY IF EXISTS "modules_delete_own_courses" ON public.modules;
CREATE POLICY "modules_delete_own_courses" ON public.modules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = "courseId" 
      AND ("instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );


DROP POLICY IF EXISTS "lessons_select_free" ON public.lessons;
CREATE POLICY "lessons_select_free" ON public.lessons
  FOR SELECT
  USING (
    "isFree" = true AND EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" AND c."isPublished" = true
    )
  );

DROP POLICY IF EXISTS "lessons_select_enrolled" ON public.lessons;
CREATE POLICY "lessons_select_enrolled" ON public.lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      JOIN public.enrollments e ON e."courseId" = c.id
      WHERE m.id = "moduleId" 
      AND e."studentId" = auth.uid()::text
      AND c."isPublished" = true
    )
  );

DROP POLICY IF EXISTS "lessons_select_own_courses" ON public.lessons;
CREATE POLICY "lessons_select_own_courses" ON public.lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" AND c."instructorId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "lessons_select_admin" ON public.lessons;
CREATE POLICY "lessons_select_admin" ON public.lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "lessons_insert_own_courses" ON public.lessons;
CREATE POLICY "lessons_insert_own_courses" ON public.lessons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" 
      AND (c."instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );

DROP POLICY IF EXISTS "lessons_update_own_courses" ON public.lessons;
CREATE POLICY "lessons_update_own_courses" ON public.lessons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" 
      AND (c."instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );

DROP POLICY IF EXISTS "lessons_delete_own_courses" ON public.lessons;
CREATE POLICY "lessons_delete_own_courses" ON public.lessons
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" 
      AND (c."instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );


DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT
  USING ("studentId" = auth.uid()::text);

DROP POLICY IF EXISTS "enrollments_select_own_courses" ON public.enrollments;
CREATE POLICY "enrollments_select_own_courses" ON public.enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = "courseId" AND "instructorId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "enrollments_select_admin" ON public.enrollments;
CREATE POLICY "enrollments_select_admin" ON public.enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "enrollments_insert_student" ON public.enrollments;
CREATE POLICY "enrollments_insert_student" ON public.enrollments
  FOR INSERT
  WITH CHECK (
    "studentId" = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'STUDENT'
    )
  );

DROP POLICY IF EXISTS "enrollments_insert_admin" ON public.enrollments;
CREATE POLICY "enrollments_insert_admin" ON public.enrollments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;
CREATE POLICY "enrollments_update_own" ON public.enrollments
  FOR UPDATE
  USING (
    "studentId" = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );


DROP POLICY IF EXISTS "progress_select_own" ON public.progress;
CREATE POLICY "progress_select_own" ON public.progress
  FOR SELECT
  USING ("studentId" = auth.uid()::text);

DROP POLICY IF EXISTS "progress_select_own_courses" ON public.progress;
CREATE POLICY "progress_select_own_courses" ON public.progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l."moduleId"
      JOIN public.courses c ON c.id = m."courseId"
      WHERE l.id = "lessonId" AND c."instructorId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "progress_select_admin" ON public.progress;
CREATE POLICY "progress_select_admin" ON public.progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "progress_insert_own" ON public.progress;
CREATE POLICY "progress_insert_own" ON public.progress
  FOR INSERT
  WITH CHECK ("studentId" = auth.uid()::text);

DROP POLICY IF EXISTS "progress_update_own" ON public.progress;
CREATE POLICY "progress_update_own" ON public.progress
  FOR UPDATE
  USING ("studentId" = auth.uid()::text);


DROP POLICY IF EXISTS "certificates_select_own" ON public.certificates;
CREATE POLICY "certificates_select_own" ON public.certificates
  FOR SELECT
  USING ("studentId" = auth.uid()::text);

DROP POLICY IF EXISTS "certificates_select_public" ON public.certificates;
CREATE POLICY "certificates_select_public" ON public.certificates
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "certificates_select_own_courses" ON public.certificates;
CREATE POLICY "certificates_select_own_courses" ON public.certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = "courseId" AND "instructorId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "certificates_insert_system" ON public.certificates;
CREATE POLICY "certificates_insert_system" ON public.certificates
  FOR INSERT
  WITH CHECK (
    "studentId" = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );


DROP POLICY IF EXISTS "activities_select_enrolled" ON public.activities;
CREATE POLICY "activities_select_enrolled" ON public.activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.id = "moduleId"
      WHERE e."courseId" = m."courseId" AND e."studentId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "activities_select_own_courses" ON public.activities;
CREATE POLICY "activities_select_own_courses" ON public.activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" AND c."instructorId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "activities_select_admin" ON public.activities;
CREATE POLICY "activities_select_admin" ON public.activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "activities_insert_own_courses" ON public.activities;
CREATE POLICY "activities_insert_own_courses" ON public.activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" 
      AND (c."instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );

DROP POLICY IF EXISTS "activities_update_own_courses" ON public.activities;
CREATE POLICY "activities_update_own_courses" ON public.activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m."courseId"
      WHERE m.id = "moduleId" 
      AND (c."instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );


DROP POLICY IF EXISTS "messages_select_recipient" ON public.messages;
CREATE POLICY "messages_select_recipient" ON public.messages
  FOR SELECT
  USING ("receiverId" = auth.uid()::text);

DROP POLICY IF EXISTS "messages_select_sender" ON public.messages;
CREATE POLICY "messages_select_sender" ON public.messages
  FOR SELECT
  USING ("senderId" = auth.uid()::text);

DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT
  WITH CHECK ("senderId" = auth.uid()::text);

DROP POLICY IF EXISTS "messages_update_recipient" ON public.messages;
CREATE POLICY "messages_update_recipient" ON public.messages
  FOR UPDATE
  USING ("receiverId" = auth.uid()::text);


DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;
CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE
  USING ("userId" = auth.uid()::text);


DROP POLICY IF EXISTS "activity_logs_select_own" ON public.activity_logs;
CREATE POLICY "activity_logs_select_own" ON public.activity_logs
  FOR SELECT
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "activity_logs_select_admin" ON public.activity_logs;
CREATE POLICY "activity_logs_select_admin" ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "activity_logs_insert_system" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_system" ON public.activity_logs
  FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

-- ====================================
-- POLÍTICAS PARA MATERIALS
-- ====================================

DROP POLICY IF EXISTS "materials_select_public_free" ON public.materials;
CREATE POLICY "materials_select_public_free" ON public.materials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l."moduleId"
      JOIN public.courses c ON c.id = m."courseId"
      WHERE l.id = "lessonId" AND l."isFree" = true AND c."isPublished" = true
    )
  );

DROP POLICY IF EXISTS "materials_select_enrolled" ON public.materials;
CREATE POLICY "materials_select_enrolled" ON public.materials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l."moduleId"
      JOIN public.courses c ON c.id = m."courseId"
      JOIN public.enrollments e ON e."courseId" = c.id
      WHERE l.id = "lessonId" AND e."studentId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "materials_crud_teacher_admin" ON public.materials;
CREATE POLICY "materials_crud_teacher_admin" ON public.materials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l."moduleId"
      JOIN public.courses c ON c.id = m."courseId"
      WHERE l.id = "lessonId" AND (c."instructorId" = auth.uid()::text OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
      ))
    )
  );

-- ====================================
-- POLÍTICAS PARA SUBMISSIONS
-- ====================================

DROP POLICY IF EXISTS "submissions_select_own" ON public.submissions;
CREATE POLICY "submissions_select_own" ON public.submissions
  FOR SELECT
  USING ("studentId" = auth.uid()::text);

DROP POLICY IF EXISTS "submissions_insert_own" ON public.submissions;
CREATE POLICY "submissions_insert_own" ON public.submissions
  FOR INSERT
  WITH CHECK ("studentId" = auth.uid()::text);

DROP POLICY IF EXISTS "submissions_select_teacher" ON public.submissions;
CREATE POLICY "submissions_select_teacher" ON public.submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = "activityId" AND a."createdById" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "submissions_select_admin" ON public.submissions;
CREATE POLICY "submissions_select_admin" ON public.submissions
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN')
  );

-- ====================================
-- POLÍTICAS PARA GRADES
-- ====================================

DROP POLICY IF EXISTS "grades_select_own" ON public.grades;
CREATE POLICY "grades_select_own" ON public.grades
  FOR SELECT
  USING ("studentId" = auth.uid()::text);

DROP POLICY IF EXISTS "grades_crud_teacher" ON public.grades;
CREATE POLICY "grades_crud_teacher" ON public.grades
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = "activityId" AND (
        a."createdById" = auth.uid()::text OR EXISTS (
          SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
      )
    )
  );

DROP POLICY IF EXISTS "grades_select_admin" ON public.grades;
CREATE POLICY "grades_select_admin" ON public.grades
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN')
  );

-- ====================================
-- POLÍTICAS PARA SUPPORT_TICKETS
-- ====================================

DROP POLICY IF EXISTS "support_tickets_select_own" ON public.support_tickets;
CREATE POLICY "support_tickets_select_own" ON public.support_tickets
  FOR SELECT
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "support_tickets_insert_own" ON public.support_tickets;
CREATE POLICY "support_tickets_insert_own" ON public.support_tickets
  FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "support_tickets_admin_all" ON public.support_tickets;
CREATE POLICY "support_tickets_admin_all" ON public.support_tickets
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN')
  );

