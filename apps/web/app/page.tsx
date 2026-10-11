const highlights = [
  ['Student records', 'Find student profiles and review their enrollment details.'],
  ['Notices and marksheets', 'Manage school communications and examination records.'],
  ['School setup', 'Configure academic years, classes, sections, and subjects.'],
];

const apiHealthUrl = process.env.NEXT_PUBLIC_API_BASE ?? `http://localhost:${process.env.API_PORT ?? '4000'}/api/v1`;
const adminLoginUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? `http://localhost:${process.env.ADMIN_PORT ?? '3002'}/login`;

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">SchoolOS · Local preview</p>
        <h1>School operations, in one place.</h1>
        <p className="lede">
          Sign in to the staff console to manage student records, academic setup, notices, and marksheets.
        </p>
        <div className="actions">
          <a href={adminLoginUrl} className="primary">
            Staff sign in
          </a>
          <a href={`${apiHealthUrl}/health`} className="secondary">
            Service status
          </a>
        </div>
      </section>

      <section className="grid">
        {highlights.map(([title, description]) => (
          <article key={title} className="card">
            <span className="card-label">Staff module</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
