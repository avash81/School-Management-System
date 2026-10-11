import { hash } from '@node-rs/argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const schoolId = '00000000-0000-0000-0000-000000000001';
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@schoolos.local';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!ChangeMe123!';

async function seed() {
  const school = await prisma.school.upsert({
    where: { id: schoolId },
    update: { name: 'SchoolOS Demo School', status: 'active' },
    create: {
      id: schoolId,
      name: 'SchoolOS Demo School',
      shortName: 'SchoolOS',
      status: 'active',
    },
  });

  await prisma.schoolSetting.upsert({
    where: { schoolId: school.id },
    update: { timeZone: 'Asia/Kathmandu' },
    create: {
      schoolId: school.id,
      timeZone: 'Asia/Kathmandu',
      language: 'en',
      dateFormat: 'YYYY-MM-DD',
    },
  });

  const academicYear = await prisma.academicYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: '2026-2027' } },
    update: { isActive: true },
    create: {
      schoolId: school.id,
      name: '2026-2027',
      startDate: new Date('2026-04-01T00:00:00.000Z'),
      endDate: new Date('2027-03-31T23:59:59.999Z'),
      isActive: true,
    },
  });

  const demoClass = await prisma.class.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Grade 10' } },
    update: {},
    create: { schoolId: school.id, name: 'Grade 10', shortName: '10', orderIndex: 10 },
  });

  const section = await prisma.section.upsert({
    where: { classId_name: { classId: demoClass.id, name: 'A' } },
    update: {},
    create: {
      schoolId: school.id,
      classId: demoClass.id,
      name: 'A',
      capacity: 40,
    },
  });

  const subject = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'MATH' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Mathematics',
      shortName: 'Math',
      code: 'MATH',
      category: 'core',
      maximumMarks: 100,
    },
  });

  const curriculum = await prisma.curriculumVersion.upsert({
    where: {
      schoolId_name_version: { schoolId: school.id, name: 'Demo Curriculum', version: '1.0' },
    },
    update: { isActive: true },
    create: { schoolId: school.id, name: 'Demo Curriculum', version: '1.0', isActive: true },
  });

  const blueprint =
    (await prisma.assessmentBlueprint.findFirst({
      where: {
        schoolId: school.id,
        curriculumVersionId: curriculum.id,
        name: 'Mathematics Standard Assessment',
      },
    })) ??
    (await prisma.assessmentBlueprint.create({
      data: {
        schoolId: school.id,
        curriculumVersionId: curriculum.id,
        name: 'Mathematics Standard Assessment',
        subjectId: subject.id,
        totalMarks: 100,
      },
    }));

  await prisma.assessmentComponent.upsert({
    where: { blueprintId_orderIndex: { blueprintId: blueprint.id, orderIndex: 1 } },
    update: {},
    create: {
      schoolId: school.id,
      blueprintId: blueprint.id,
      name: 'Theory',
      maxMarks: 100,
      orderIndex: 1,
    },
  });

  const role = await prisma.role.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'school_admin' } },
    update: { name: 'School Administrator' },
    create: { schoolId: school.id, name: 'School Administrator', code: 'school_admin' },
  });

  const setupPermissions = [
    ['school.manage', 'Manage school profile'],
    ['school.setup.view', 'View school setup status'],
    ['settings.manage', 'Manage school settings'],
    ['academic.years.manage', 'Manage academic years'],
    ['academic.years.read', 'Read academic years'],
    ['academic.classes.manage', 'Manage classes'],
    ['academic.classes.read', 'Read classes'],
    ['academic.sections.manage', 'Manage sections'],
    ['academic.sections.read', 'Read sections'],
    ['academic.subjects.manage', 'Manage subjects'],
    ['academic.subjects.read', 'Read subjects'],
    ['teachers.create', 'Create teachers'],
    ['teachers.read', 'Read teachers'],
    ['teachers.update', 'Update teachers'],
    ['students.create', 'Create students'],
    ['students.read', 'Read students'],
    ['students.update', 'Update students'],
    ['students.import', 'Import students'],
    ['students.enrollments.manage', 'Manage student enrollments'],
    ['students.guardians.manage', 'Manage guardians'],
    ['dashboard.summary', 'View school dashboard summary'],
    ['users.sessions.manage', 'Manage user sessions'],
  ];
  for (const [code, name] of setupPermissions) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { schoolId: school.id, status: 'active' },
    create: {
      schoolId: school.id,
      email: adminEmail,
      passwordHash: await hash(adminPassword),
      firstName: 'School',
      lastName: 'Administrator',
      status: 'active',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  const teacher = await prisma.teacher.upsert({
    where: { schoolId_employeeId: { schoolId: school.id, employeeId: 'T-0001' } },
    update: {},
    create: {
      schoolId: school.id,
      employeeId: 'T-0001',
      firstName: 'Demo',
      lastName: 'Teacher',
      email: 'teacher@schoolos.local',
      employmentType: 'full_time',
      status: 'active',
    },
  });

  await prisma.subjectOffering.upsert({
    where: {
      academicYearId_classId_sectionId_subjectId: {
        academicYearId: academicYear.id,
        classId: demoClass.id,
        sectionId: section.id,
        subjectId: subject.id,
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      classId: demoClass.id,
      sectionId: section.id,
      subjectId: subject.id,
      teacherId: teacher.id,
      blueprintId: blueprint.id,
    },
  });

  for (const [index, studentData] of [
    ['Aarav', 'Sharma', 'STU-0001'],
    ['Sita', 'Gurung', 'STU-0002'],
  ].entries()) {
    const student = await prisma.student.upsert({
      where: { schoolId_academicId: { schoolId: school.id, academicId: studentData[2] } },
      update: {},
      create: {
        schoolId: school.id,
        academicId: studentData[2],
        admissionNo: `ADM-000${index + 1}`,
        firstName: studentData[0],
        lastName: studentData[1],
        status: 'active',
      },
    });

    await prisma.enrollment.upsert({
      where: {
        studentId_academicYearId: { studentId: student.id, academicYearId: academicYear.id },
      },
      update: {},
      create: {
        schoolId: school.id,
        studentId: student.id,
        academicYearId: academicYear.id,
        classId: demoClass.id,
        sectionId: section.id,
        rollNumber: String(index + 1),
        status: 'active',
      },
    });
  }

  const exam = await prisma.exam.upsert({
    where: {
      schoolId_academicYearId_name: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        name: 'First Terminal',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'First Terminal',
      startDate: new Date('2026-07-15T00:00:00.000Z'),
      endDate: new Date('2026-07-25T00:00:00.000Z'),
      status: 'scheduled',
    },
  });

  const offering = await prisma.subjectOffering.findUniqueOrThrow({
    where: {
      academicYearId_classId_sectionId_subjectId: {
        academicYearId: academicYear.id,
        classId: demoClass.id,
        sectionId: section.id,
        subjectId: subject.id,
      },
    },
  });

  await prisma.examSubject.upsert({
    where: { examId_subjectOfferingId: { examId: exam.id, subjectOfferingId: offering.id } },
    update: {},
    create: {
      schoolId: school.id,
      examId: exam.id,
      subjectOfferingId: offering.id,
      blueprintId: blueprint.id,
    },
  });

  console.log(
    `Seeded ${school.name}, ${academicYear.name}, demo academics, students, and ${adminEmail}`,
  );
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
